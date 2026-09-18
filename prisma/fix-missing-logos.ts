/**
 * Aider was in the original 33-tool catalog but isn't covered by the
 * LobeHub icon library (see upgrade-tool-logos.ts), so it was left on the
 * Google favicon fallback — which apparently isn't resolving to anything
 * for aider.chat. Perplexica isn't one of the 33 tools I added — presumably
 * added separately since — so it never went through any logo pass at all.
 *
 * Both fixed here using real logo assets found directly in each project's
 * own GitHub repo (verified by cloning and viewing the actual image before
 * writing this, not guessed):
 *   - Aider: apple-touch-icon.png from aider/website/assets/icons/ in the
 *     Aider-AI/aider repo
 *   - Perplexica: icon.png from public/ in the ItzCrazyKns/Perplexica repo
 *
 * Both URLs are on githubusercontent.com, already whitelisted in
 * next.config.ts — no config change needed for these two.
 *
 * Safe to re-run.
 *
 * Run once:
 *   npx tsx prisma/fix-missing-logos.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fixes: Record<string, string> = {
  aider: "https://raw.githubusercontent.com/Aider-AI/aider/main/aider/website/assets/icons/apple-touch-icon.png",
  perplexica: "https://raw.githubusercontent.com/ItzCrazyKns/Perplexica/master/public/icon.png",
  // Found directly in doctranslator.io's own page HTML (header and footer
  // both reference this same file) — not a favicon scrape or guess.
  "doc-translator": "https://www.doctranslator.io/logo.webp",
};

async function main() {
  for (const [slug, logoUrl] of Object.entries(fixes)) {
    const tool = await prisma.tool.findUnique({ where: { slug } });
    if (!tool) {
      console.warn(`Skipping "${slug}" — not found in the database (check the exact slug in /admin/tools if this seems wrong).`);
      continue;
    }
    await prisma.tool.update({ where: { slug }, data: { logoUrl } });
    console.log(`Updated logo: ${slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
