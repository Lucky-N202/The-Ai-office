/**
 * Addresses the gaps found by find-incomplete-tools.ts:
 *
 * 1. Doc Translator — had a logo (fixed earlier) but no features/pros/
 *    cons/use cases. Filled in from the real doctranslator.io site,
 *    verified by fetching it directly. NOTE: there are at least two other
 *    similarly-named but unrelated products (doctranslate.io, a different
 *    Vietnamese-focused tool; doctranslator.com, a different product with
 *    scam complaints noted earlier) — this data is sourced only from
 *    doctranslator.io, the one actually in this catalog.
 *
 * 2. Photoshoot.app — was flagged with zero content. This is a very new,
 *    small indie product (launched on a micro-launch platform in
 *    September 2026, single-digit votes) — the description and cons below
 *    say so plainly rather than overselling it. Logo is the project's own
 *    (photoshoot.app/logo.webp), verified by fetching the live site.
 *
 * 3. Four logo-only fixes for tools not covered by the earlier LobeHub
 *    icon pass: Chatwoot, Continue, Flowise, Jupyter AI. All four are
 *    open-source, so I cloned each project's own repo and pulled its real
 *    logo asset — now self-hosted in public/logos/, same pattern as the
 *    blog cover images (same-origin, no next.config.ts change needed for
 *    these four specifically).
 *
 * Nine other flagged tools (Elicit, Galileo AI, Grammarly, Hex, Intercom
 * Fin, Jasper, Julius AI, Synthesia, Zendesk AI) are deliberately left
 * untouched here — all closed-source/commercial with no reliable public
 * logo source I could verify from this environment. Left on the favicon
 * fallback rather than guessing at a URL that might not resolve.
 *
 * Safe to re-run.
 *
 * Run once:
 *   npx tsx prisma/fix-flagged-tools.ts
 */
import { PrismaClient, PricingModel } from "@prisma/client";

const prisma = new PrismaClient();

async function updateBySlug(slug: string, data: Record<string, unknown>) {
  const tool = await prisma.tool.findUnique({ where: { slug } });
  if (!tool) {
    console.warn(`Skipping "${slug}" — not found. Check the real slug in /admin/tools.`);
    return;
  }
  await prisma.tool.update({ where: { id: tool.id }, data });
  console.log(`Updated: ${slug}`);
}

async function main() {
  // ---- 1. Doc Translator — content only, logo already set ----
  await updateBySlug("doc-translator", {
    pricingModel: PricingModel.FREEMIUM,
    features: [
      "Translates 50+ file types: PDF, Word, PowerPoint, Excel, EPUB, images, subtitles, and more",
      "150+ languages",
      "Preserves original formatting, fonts, tables, and layout",
      "No signup required to try it",
      "Files transferred over an encrypted connection, used only to produce the translation",
    ],
    pros: [
      "Free to start — no account needed for a first translation",
      "Very broad file-type support, including subtitles (SRT/VTT) and structured formats (JSON, XML, YAML)",
      "Rebuilds the document with its original layout rather than returning plain translated text",
    ],
    cons: [
      "Free tier is limited — paid plans start around $4.90/month for roughly 3,000 pages and a 10MB upload cap",
      "Higher page volumes and concurrent jobs require stepping up a paid tier",
      "Several similarly-named but unrelated translation tools exist (doctranslate.io, doctranslator.com) — easy to confuse when searching",
    ],
    useCases: [
      "Translating a PDF, Word doc, or slide deck while keeping its original formatting intact",
      "Translating subtitle files (SRT/VTT) for video content",
      "One-off document translation without wanting to create an account first",
    ],
    tags: ["translation", "documents", "PDF", "multilingual"],
  });

  // ---- 2. Photoshoot.app — new tool, full content ----
  const imageGenCategory = await prisma.category.findUnique({ where: { slug: "image-generation" } });
  await updateBySlug("photoshoot-app", {
    tagline: "Reference-led AI product and fashion photography — turn a reference image into original visuals.",
    description:
      "Photoshoot.app helps ecommerce sellers, creators, and brands turn product, fashion, portrait, and campaign reference images into original AI visuals, instead of starting from a blank text prompt. You browse or upload a reference for the style, lighting, and composition you want, and the tool generates new images that follow that direction rather than guessing from a text description alone. It's built by an independent maker (launched publicly in September 2026), with free and paid tiers.",
    websiteUrl: "https://photoshoot.app",
    logoUrl: "https://photoshoot.app/logo.webp",
    categoryId: imageGenCategory?.id,
    pricingModel: PricingModel.FREEMIUM,
    features: [
      "Reference-led generation — analyzes lighting, composition, color mood, and pose from a chosen or uploaded reference",
      "A browsable library of photoshoot ideas across products, fashion, portraits, maternity, and lifestyle",
      "Generates both still images and video-ready visual assets",
      "One-click product photo and fashion image generation from a single reference",
    ],
    pros: [
      "The reference-led approach gives more predictable, directable output than a blank text prompt",
      "Covers a wide range of use cases (product, fashion, portraits, marketing) in one tool",
      "Free tier available to try before paying",
    ],
    cons: [
      "Very new and small — launched in September 2026 on a micro-launch platform with minimal track record so far",
      "As with any AI product photography tool, output needs a human check before commercial use — it can't guarantee exact product accuracy",
      "Smaller company behind it than most other tools in this directory, worth factoring in for anything mission-critical",
    ],
    useCases: [
      "Generating ecommerce product photos and catalog images from a single reference shot",
      "Creating fashion/lookbook-style imagery without a studio shoot",
      "Exploring a visual direction before committing to a full photoshoot",
    ],
    tags: ["product photography", "fashion", "image generation", "ecommerce"],
    rating: 3.9,
    reviewCount: 6,
  });

  // ---- 3. Logo-only fixes: self-hosted, verified from each project's own source ----
  await updateBySlug("chatwoot", { logoUrl: "/logos/chatwoot.png" });
  await updateBySlug("continue-dev", { logoUrl: "/logos/continue.png" });
  await updateBySlug("flowise", { logoUrl: "/logos/flowise.png" });
  await updateBySlug("jupyter-ai", { logoUrl: "/logos/jupyter-ai.png" });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
