import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend's free tier caps daily/monthly sends — this batches to stay within
// a reasonable per-call size and avoid a single request timing out against a
// large list. Increase if you're on a paid Resend plan with a larger list.
const BATCH_SIZE = 100;

export type SendResult = { sent: number; failed: number; skipped: "not_configured" | null };

/**
 * Emails a published article to every active (non-unsubscribed) newsletter
 * subscriber. Always called explicitly from the admin "Publish & Send"
 * action — there is no automatic path that sends email without a human
 * having clicked publish on this specific article.
 */
export async function sendArticleToSubscribers(article: {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
}): Promise<SendResult> {
  if (!resend) return { sent: 0, failed: 0, skipped: "not_configured" };

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    select: { email: true, unsubscribeToken: true },
  });

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/blog/${article.slug}`;

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((sub) =>
        resend!.emails.send({
          from: "The AI Office <newsletter@the-ai-office.com>",
          to: sub.email,
          subject: article.title,
          text: `${article.title}\n\n${article.excerpt}\n\nRead the full article: ${articleUrl}\n\n---\nUnsubscribe: ${siteUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`,
        })
      )
    );
    for (const r of results) {
      if (r.status === "fulfilled") sent++;
      else failed++;
    }
  }

  return { sent, failed, skipped: null };
}
