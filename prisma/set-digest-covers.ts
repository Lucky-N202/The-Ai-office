/**
 * Custom covers for the two weekly-digest articles already live on your
 * site (visible in your screenshot), replacing their generic
 * "weekly-roundup-default.png" fallback.
 *
 * Matched by exact title rather than slug — the weekly digest generator
 * appends a date suffix to every slug (see generate-digest.ts), so I can't
 * reliably guess the exact slug from here. Title matching is safe since
 * these are one-off article titles, not a field with expected duplicates.
 *
 * Safe to re-run.
 *
 * Run once:
 *   npx tsx prisma/set-digest-covers.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fixes: Record<string, string> = {
  "Google's Gemini 3.6 Flash Lineup: What's New and What It Costs": "/blog-covers/gemini-3-6-flash-lineup.png",
  "Claude Sonnet 5 Is Now the Default Across Every Claude Plan": "/blog-covers/claude-sonnet-5-default.png",
};

async function main() {
  for (const [title, coverImage] of Object.entries(fixes)) {
    const article = await prisma.article.findFirst({ where: { title } });
    if (!article) {
      console.warn(`Skipping "${title}" — no exact title match found. Check /admin/articles for the real title/slug if this seems wrong.`);
      continue;
    }
    await prisma.article.update({ where: { id: article.id }, data: { coverImage } });
    console.log(`Set custom cover: ${article.slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
