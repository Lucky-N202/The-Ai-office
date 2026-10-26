import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateWeeklyDigest } from "@/lib/newsletter/generate-digest";
import { generateToolSpotlight } from "@/lib/newsletter/generate-spotlight";
import { passesPublishChecks } from "@/lib/newsletter/util";
import { sendArticleToSubscribers } from "@/lib/newsletter/send";
import { pingIndexNow } from "@/lib/indexnow";
import { notifyAdminOfPendingChange } from "@/lib/intelligence/notify";
import { getSiteUrl } from "@/lib/site";

export const maxDuration = 60;

// Need at least this many real changes/new tools for a "what changed" roundup.
// Below it, the week gets a grounded tool spotlight instead — so there is
// still a post every week, without padding a thin digest.
const MIN_DIGEST_ITEMS = Number(process.env.DIGEST_MIN_ITEMS ?? 3);

/**
 * Weekly post. Default behavior is unchanged (saves a DRAFT and nudges you).
 * Set AUTO_PUBLISH_DIGEST=true to publish automatically when the post passes
 * the quality checks; anything that fails stays a draft for review.
 * Emailing subscribers is a separate opt-in: AUTO_SEND_NEWSLETTER=true.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let post: { title: string; slug: string; excerpt: string; content: string; toolNames: string[] } | null = null;
  let kind: "digest" | "spotlight" = "digest";

  const digest = await generateWeeklyDigest();
  if (digest && digest.itemCount >= MIN_DIGEST_ITEMS) {
    post = digest;
  } else {
    post = await generateToolSpotlight();
    kind = "spotlight";
  }

  if (!post) {
    return NextResponse.json({ created: false, reason: "nothing to report and no spotlight candidate, or AI unavailable" });
  }

  const autoPublish =
    process.env.AUTO_PUBLISH_DIGEST === "true" && passesPublishChecks(post.content, post.toolNames);

  const article = await prisma.article.create({
    data: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: autoPublish ? "PUBLISHED" : "DRAFT",
      publishedAt: autoPublish ? new Date() : null,
      aiGenerated: true,
      coverImage: "/blog-covers/weekly-roundup-default.png",
    },
  });

  let newsletter: unknown = null;
  if (autoPublish) {
    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/rss.xml");
    void pingIndexNow(["/blog", `/blog/${article.slug}`]);
    if (process.env.AUTO_SEND_NEWSLETTER === "true") {
      newsletter = await sendArticleToSubscribers(article);
    }
  }

  await notifyAdminOfPendingChange({
    toolName: kind === "digest" ? "Weekly Digest" : "Tool Spotlight",
    summary: autoPublish
      ? `Published automatically: "${post.title}". Unpublish it from /admin/articles if anything looks off.`
      : `A new AI-drafted article "${post.title}" is ready for review.`,
    changeType: "article",
    confidence: 0,
    reviewUrl: `${getSiteUrl()}/admin/articles/${article.id}`,
  });

  return NextResponse.json({ created: true, kind, published: autoPublish, articleId: article.id, title: post.title, newsletter });
}
