/**
 * Catches any PUBLISHED article missing a coverImage — specifically the
 * auto-generated weekly digest posts created before the cron route was
 * updated to set one (see api/cron/weekly-digest/route.ts). Finds them by
 * querying for `coverImage: null` rather than hardcoding slugs, so it also
 * covers any other article you may have created without one.
 *
 * Safe to re-run — only touches articles that still have no cover.
 *
 * Run once:
 *   npx tsx prisma/backfill-missing-covers.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_COVER = "/blog-covers/weekly-roundup-default.png";

async function main() {
  const missing = await prisma.article.findMany({
    where: { status: "PUBLISHED", coverImage: null },
    select: { id: true, slug: true, title: true },
  });

  if (missing.length === 0) {
    console.log("No published articles are missing a cover image.");
    return;
  }

  for (const article of missing) {
    await prisma.article.update({ where: { id: article.id }, data: { coverImage: DEFAULT_COVER } });
    console.log(`Backfilled cover: ${article.slug} ("${article.title}")`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
