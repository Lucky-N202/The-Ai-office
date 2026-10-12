import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const decisionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("reject") }),
  z.object({ action: z.literal("approve"), categoryId: z.string().min(1) }),
  z.object({ action: z.literal("toggle-priority") }),
]);

/** Admin — approve (creates a real Tool) or reject a pending submission. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const submission = await prisma.toolSubmission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = decisionSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Every action below only makes sense while a submission is still waiting
  // for a decision. Without this, a double-click or a stale browser tab
  // could approve the same submission twice (creating the same Tool again
  // and crashing on its unique slug) or flip an approved one to rejected —
  // which would also corrupt the log at /admin/submissions.
  if (submission.status !== "PENDING") {
    return NextResponse.json(
      { error: `This submission was already ${submission.status.toLowerCase()}. Refresh the page to see its current state.` },
      { status: 409 }
    );
  }

  // Recorded in the log so it's clear who made each call.
  const reviewer = admin.email ?? admin.name ?? "unknown admin";

  if (parsed.data.action === "reject") {
    await prisma.toolSubmission.update({
      where: { id },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: reviewer },
    });
    return NextResponse.json({ success: true });
  }

  if (parsed.data.action === "toggle-priority") {
    const updated = await prisma.toolSubmission.update({
      where: { id },
      data: { priorityReview: !submission.priorityReview },
    });
    return NextResponse.json(updated);
  }

  const slug = slugify(submission.name);
  const existing = await prisma.tool.findUnique({ where: { slug }, select: { name: true } });
  if (existing) {
    return NextResponse.json(
      { error: `A tool called "${existing.name}" is already in the directory, so this looks like a duplicate. Reject it instead.` },
      { status: 409 }
    );
  }

  const tool = await prisma.tool.create({
    data: {
      name: submission.name,
      slug,
      tagline: submission.tagline,
      description: submission.description,
      websiteUrl: submission.websiteUrl,
      // Prefer the logo the submitter actually gave us; fall back to a
      // favicon scrape only for submissions made before this field existed.
      logoUrl: submission.logoUrl ?? `https://www.google.com/s2/favicons?domain=${new URL(submission.websiteUrl).hostname}&sz=128`,
      categoryId: parsed.data.categoryId,
      verified: false,
      featured: false,
    },
  });

  await prisma.toolSubmission.update({
    where: { id },
    data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: reviewer, approvedToolId: tool.id },
  });

  return NextResponse.json(tool, { status: 201 });
}
