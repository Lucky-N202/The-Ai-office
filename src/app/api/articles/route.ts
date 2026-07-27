import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const createArticleSchema = z.object({
  title: z.string().min(1).max(140),
  excerpt: z.string().min(1).max(300),
  content: z.string().min(1),
  coverImage: z.string().url().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createArticleSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const article = await prisma.article.create({
    data: { ...parsed.data, slug: slugify(parsed.data.title), status: "DRAFT" },
  });

  return NextResponse.json(article, { status: 201 });
}
