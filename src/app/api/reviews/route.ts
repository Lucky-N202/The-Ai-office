import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  toolId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "You must be signed in to leave a review" }, { status: 401 });

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const review = await prisma.review.upsert({
    where: { toolId_userId: { toolId: parsed.data.toolId, userId: session.user.id } },
    update: parsed.data,
    create: { ...parsed.data, userId: session.user.id },
  });

  const agg = await prisma.review.aggregate({ where: { toolId: parsed.data.toolId }, _avg: { rating: true }, _count: true });
  await prisma.tool.update({
    where: { id: parsed.data.toolId },
    data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });

  return NextResponse.json(review, { status: 201 });
}
