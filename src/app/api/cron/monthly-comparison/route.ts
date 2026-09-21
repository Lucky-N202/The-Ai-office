import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateComparisonPost } from "@/lib/newsletter/generate-comparison";
import { notifyAdminOfPendingChange } from "@/lib/intelligence/notify";
import { getSiteUrl } from "@/lib/site";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draft = await generateComparisonPost();

  if (!draft) {
    return NextResponse.json({ created: false, reason: "no uncovered tool pairing found, or AI unavailable" });
  }

  const article = await prisma.article.create({
    data: {
      title: draft.title,
      slug: draft.slug,
      excerpt: draft.excerpt,
      content: draft.content,
      status: "DRAFT",
      aiGenerated: true,
      // Generic fallback — swap for a custom cover (same style as the
      // manually-made comparison posts) before publishing if you want one
      // matching those visually.
      coverImage: "/blog-covers/weekly-roundup-default.png",
    },
  });

  // Same review-nudge pattern as the weekly digest — never auto-publishes.
  await notifyAdminOfPendingChange({
    toolName: "Comparison Post",
    summary: `A new AI-drafted comparison post "${draft.title}" is ready for review.`,
    changeType: "comparison-article",
    confidence: 0,
    reviewUrl: `${getSiteUrl()}/admin/articles/${article.id}`,
  });

  return NextResponse.json({ created: true, articleId: article.id, title: draft.title });
}
