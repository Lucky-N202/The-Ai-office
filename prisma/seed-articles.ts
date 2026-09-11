/**
 * One-off: creates the initial batch of blog content (comparison posts +
 * one roundup) as DRAFT articles. Following the same pattern as the
 * automated weekly digest — never auto-published, always left for a human
 * editorial pass in /admin/articles before going live.
 *
 * Safe to re-run — upserts by slug, so re-running just updates content
 * rather than creating duplicates.
 *
 * Run once:
 *   npx tsx prisma/seed-articles.ts
 */
import { PrismaClient } from "@prisma/client";
import articles from "./articles-data.json";

const prisma = new PrismaClient();

async function main() {
  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        status: "DRAFT",
        aiGenerated: true,
      },
    });
    console.log(`Upserted: ${article.slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
