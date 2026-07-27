import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeeklyDigest } from "@/lib/newsletter/generate-digest";
import { notifyAdminOfPendingChange } from "@/lib/intelligence/notify";
import { getSiteUrl } from "@/lib/site";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const digest = await generateWeeklyDigest();

  if (!digest) {
    return NextResponse.json({ created: false, reason: "nothing to report this week, or AI unavailable" });
  }

  const article = await prisma.article.create({
    data: {
      title: digest.title,
      slug: digest.slug,
      excerpt: digest.excerpt,
      content: digest.content,
      status: "DRAFT",
      aiGenerated: true,
    },
  });

  // Always a review nudge, never a publish — same pattern as the Intelligence
  // Engine's low-confidence change notifications.
  await notifyAdminOfPendingChange({
    toolName: "Weekly Digest",
    summary: `A new AI-drafted article "${digest.title}" is ready for review.`,
    changeType: "article",
    confidence: 0,
    reviewUrl: `${getSiteUrl()}/admin/articles/${article.id}`,
  });

  return NextResponse.json({ created: true, articleId: article.id, title: digest.title });
}
