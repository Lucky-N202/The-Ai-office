/**
 * Sets `coverImage` on the 6 blog articles from the earlier batch. The
 * field already existed in your schema but was never actually rendered
 * anywhere (blog list, post page, or social share metadata) — that's fixed
 * in the same change set as this script.
 *
 * Images are custom-generated PNGs (1200x630, standard social-share size)
 * matching your actual brand colors (#09090b background, #7c3aed accent),
 * hosted in your own /public/blog-covers/ folder — no external image
 * domain, no licensing risk, no next.config.ts changes needed since
 * same-origin images don't need remotePatterns whitelisting.
 *
 * Safe to re-run.
 *
 * Run once:
 *   npx tsx prisma/set-blog-covers.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const covers: Record<string, string> = {
  "claude-vs-chatgpt": "/blog-covers/claude-vs-chatgpt.png",
  "ai-image-generators-compared": "/blog-covers/ai-image-generators-compared.png",
  "github-copilot-vs-cursor": "/blog-covers/github-copilot-vs-cursor.png",
  "runway-vs-synthesia": "/blog-covers/runway-vs-synthesia.png",
  "intercom-fin-vs-zendesk-ai": "/blog-covers/intercom-fin-vs-zendesk-ai.png",
  "recent-moves-ai-coding-tools": "/blog-covers/recent-moves-ai-coding-tools.png",
};

async function main() {
  for (const [slug, coverImage] of Object.entries(covers)) {
    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) {
      console.warn(`Skipping "${slug}" — article not found.`);
      continue;
    }
    await prisma.article.update({ where: { slug }, data: { coverImage } });
    console.log(`Set cover image: ${slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
