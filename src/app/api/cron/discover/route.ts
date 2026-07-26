import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fetchAndExtract } from "@/lib/intelligence/extract";
import { analyzeChange } from "@/lib/intelligence/analyze";
import { notifyAdminOfPendingChange } from "@/lib/intelligence/notify";
import { getSiteUrl } from "@/lib/site";

// How many tools to process per invocation. This is the batching cursor that
// makes "thousands of tools" tractable within a single serverless function's
// time limit — each run advances lastCheckedAt for whatever it processes, so
// the next run (whatever the cron schedule is) naturally picks up where this
// one left off, oldest-checked-first.
const BATCH_SIZE = 15;

// Auto-apply only the narrowest, lowest-risk case: a confidently-extracted
// price change. Everything else — features, rebrands, shutdowns, anything
// below this confidence bar — always goes to human review. This threshold
// and the changeType allowlist are the entire safety mechanism here; loosen
// them deliberately, not by accident.
const AUTO_APPLY_MIN_CONFIDENCE = 0.85;
const AUTO_APPLY_CHANGE_TYPES = new Set(["pricing"]);

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Vercel Cron sends this header automatically when CRON_SECRET is set as an
  // env var — see https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs.
  // Also accept it as a manual trigger (e.g. `curl -H "Authorization: Bearer $CRON_SECRET" ...`)
  // for local testing or an on-demand admin-triggered run.
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tools = await prisma.tool.findMany({
    orderBy: [{ lastCheckedAt: { sort: "asc", nulls: "first" } }],
    take: BATCH_SIZE,
  });

  const results = {
    checked: 0,
    sourcesChecked: 0,
    changesDetected: 0,
    autoApplied: 0,
    queuedForReview: 0,
    errors: [] as string[],
  };

  for (const tool of tools) {
    const sourceUrls = [tool.websiteUrl, tool.docsUrl].filter((u): u is string => Boolean(u));

    for (const sourceUrl of sourceUrls) {
      results.sourcesChecked++;

      const fetched = await fetchAndExtract(sourceUrl);
      if (!fetched) continue; // fetch/parse failure — skip, don't fail the batch

      const previousSnapshot = await prisma.toolSnapshot.findFirst({
        where: { toolId: tool.id, sourceUrl },
        orderBy: { fetchedAt: "desc" },
      });

      // First time seeing this source — establish the baseline, nothing to diff yet.
      if (!previousSnapshot) {
        await prisma.toolSnapshot.create({
          data: { toolId: tool.id, sourceUrl, content: fetched.content, contentHash: fetched.contentHash },
        });
        continue;
      }

      // Unchanged since last check — nothing to do, and no AI call needed.
      if (previousSnapshot.contentHash === fetched.contentHash) continue;

      // Content differs from the tool's own official source — this is the
      // "verify against official websites" step: we're not trusting a claim
      // about the tool, we're diffing the primary source directly.
      const newSnapshot = await prisma.toolSnapshot.create({
        data: { toolId: tool.id, sourceUrl, content: fetched.content, contentHash: fetched.contentHash },
      });

      const analysis = await analyzeChange({
        toolName: tool.name,
        sourceUrl,
        previousContent: previousSnapshot.content,
        newContent: fetched.content,
      });

      // AI call unavailable or failed — still record that a raw change was
      // detected (queued for review), rather than silently losing it.
      if (!analysis || !analysis.hasSubstantiveChange) {
        if (!analysis) {
          await prisma.toolChange.create({
            data: {
              toolId: tool.id,
              sourceUrl,
              fromSnapshotId: previousSnapshot.id,
              toSnapshotId: newSnapshot.id,
              summary: "Content changed on the official source, but automated analysis was unavailable — needs manual comparison.",
              changeType: "other",
              confidence: 0,
              status: "PENDING_REVIEW",
            },
          });
          results.changesDetected++;
          results.queuedForReview++;
        }
        continue;
      }

      results.changesDetected++;

      const canAutoApply =
        analysis.confidence >= AUTO_APPLY_MIN_CONFIDENCE &&
        AUTO_APPLY_CHANGE_TYPES.has(analysis.changeType) &&
        analysis.suggestedUpdates &&
        Object.keys(analysis.suggestedUpdates).length > 0;

      await prisma.toolChange.create({
        data: {
          toolId: tool.id,
          sourceUrl,
          fromSnapshotId: previousSnapshot.id,
          toSnapshotId: newSnapshot.id,
          summary: analysis.summary,
          changeType: analysis.changeType,
          confidence: analysis.confidence,
          suggestedUpdates: analysis.suggestedUpdates ?? undefined,
          status: canAutoApply ? "AUTO_APPLIED" : "PENDING_REVIEW",
        },
      });

      if (canAutoApply && analysis.suggestedUpdates) {
        await prisma.tool.update({ where: { id: tool.id }, data: analysis.suggestedUpdates });
        revalidatePath(`/browse/tools/${tool.slug}`);
        revalidatePath(`/browse/categories/${tool.categoryId}`);
        revalidatePath("/");
        results.autoApplied++;
      } else {
        results.queuedForReview++;
        await notifyAdminOfPendingChange({
          toolName: tool.name,
          summary: analysis.summary,
          changeType: analysis.changeType,
          confidence: analysis.confidence,
          reviewUrl: `${getSiteUrl()}/admin/changes`,
        });
      }
    }

    await prisma.tool.update({ where: { id: tool.id }, data: { lastCheckedAt: new Date() } });
    results.checked++;
  }

  return NextResponse.json(results);
}
