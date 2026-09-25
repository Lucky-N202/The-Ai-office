import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true, updatedAt: true },
  });

  const items = articles
    .map((article) => {
      const url = `${siteUrl}/blog/${article.slug}`;
      const pubDate = (article.publishedAt ?? article.updatedAt).toUTCString();
      const enclosure = article.coverImage
        ? `<enclosure url="${escapeXml(article.coverImage.startsWith("http") ? article.coverImage : `${siteUrl}${article.coverImage}`)}" type="image/png" />`
        : "";

      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.excerpt)}</description>
      ${enclosure}
    </item>`;
    })
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The AI Office Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Comparisons, roundups, and updates on AI tools from The AI Office.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
