/**
 * Second batch of comparison posts, following the same pattern as
 * seed-articles.ts: created as DRAFT for editorial review in
 * /admin/articles, each with a cover image already set (unlike the first
 * batch, which needed a separate script to add covers after the fact).
 *
 * Safe to re-run — upserts by slug.
 *
 * Run once:
 *   npx tsx prisma/seed-articles-2.ts
 */
import { PrismaClient } from "@prisma/client";
import articles from "./articles-data-2.json";

const prisma = new PrismaClient();

async function main() {
  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
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
