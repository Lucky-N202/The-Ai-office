import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendArticleToSubscribers } from "@/lib/newsletter/send";

const updateArticleSchema = z.object({
  title: z.string().min(1).max(140).optional(),
  excerpt: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().url().nullable().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  // Publish is a distinct, explicit action — never a side effect of a plain
  // field edit. This is also the only path that sends email, and only ever
  // in response to a human clicking the button, never automatically.
  if (body.action === "publish") {
    const article = await prisma.article.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath("/sitemap.xml");

    const sendResult = await sendArticleToSubscribers(article);

    return NextResponse.json({ success: true, article, newsletter: sendResult });
  }

  const parsed = updateArticleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const article = await prisma.article.update({ where: { id }, data: parsed.data });
  if (article.status === "PUBLISHED") {
    revalidatePath(`/blog/${article.slug}`);
  }
  return NextResponse.json(article);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
