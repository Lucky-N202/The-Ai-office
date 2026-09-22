import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, requireAdmin } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Either an admin, or the review's own author, can delete it.
  const session = await auth();
  const isOwner = session?.user?.id === review.userId;
  if (!isOwner) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.review.delete({ where: { id } });

  // Recalculate the tool's cached rating/reviewCount — previously missing
  // here, which left stale aggregate numbers on the tool after any
  // deletion (admin-initiated or otherwise).
  const agg = await prisma.review.aggregate({ where: { toolId: review.toolId }, _avg: { rating: true }, _count: true });
  await prisma.tool.update({
    where: { id: review.toolId },
    data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });

  return NextResponse.json({ success: true });
}
