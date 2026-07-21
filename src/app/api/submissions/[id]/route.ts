import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const decisionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("reject") }),
  z.object({ action: z.literal("approve"), categoryId: z.string().min(1) }),
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

  if (parsed.data.action === "reject") {
    await prisma.toolSubmission.update({ where: { id }, data: { status: "REJECTED", reviewedAt: new Date() } });
    return NextResponse.json({ success: true });
  }

  const tool = await prisma.tool.create({
    data: {
      name: submission.name,
      slug: slugify(submission.name),
      tagline: submission.tagline,
      description: submission.description,
      websiteUrl: submission.websiteUrl,
      logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(submission.websiteUrl).hostname}&sz=128`,
      categoryId: parsed.data.categoryId,
      verified: false,
      featured: false,
    },
  });

  await prisma.toolSubmission.update({ where: { id }, data: { status: "APPROVED", reviewedAt: new Date() } });

  return NextResponse.json(tool, { status: 201 });
}
