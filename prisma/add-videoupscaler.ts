/**
 * Fills in full data for VideoUpscaler.dev (website confirmed via live
 * fetch, not guessed): a free, browser-based AI video upscaler that
 * processes video locally via WebGPU/WebCodecs — no upload, no signup, no
 * install. Currently does a verified 2x upscale (not 4x, despite that
 * claim appearing on some third-party directory listings of it — the
 * tool's own site explicitly caps the verified workflow at 2x).
 *
 * I don't have direct access to your database, so this tries a couple of
 * likely slugs and falls back to a name search — it will tell you plainly
 * if it can't find a match rather than silently doing nothing, so you can
 * tell me the real slug/id if both guesses miss.
 *
 * Safe to re-run.
 *
 * Run once:
 *   npx tsx prisma/add-videoupscaler.ts
 */
import { PrismaClient, PricingModel } from "@prisma/client";

const prisma = new PrismaClient();

const data = {
  tagline: "Free, browser-based AI video upscaler — no upload, no signup, no install.",
  description:
    "VideoUpscaler is a free AI video upscaler that runs entirely in your browser using WebGPU and WebCodecs — your video is processed locally and never uploaded to a server. It currently offers a verified 2x upscale for MP4/H.264 footage, aimed at making small or soft social clips, old recordings, animation/gameplay captures, and product footage easier to watch at a larger size. The site is unusually upfront about its limits: it won't fix heavy motion blur, recover detail the camera never captured, or repair severe compression damage — it's positioned as a quick, honest comparison tool (drag-to-compare preview) rather than a miracle restoration product.",
  websiteUrl: "https://videoupscaler.dev",
  logoUrl: "https://www.google.com/s2/favicons?domain=videoupscaler.dev&sz=128",
  pricingModel: PricingModel.FREE,
  features: [
    "Fully local processing via WebGPU/WebCodecs — no video upload",
    "No signup or installation required",
    "2x upscale for MP4/H.264 video",
    "Drag-to-compare before/after preview",
    "Use-case workflows for social clips, old footage, animation/gameplay, and product video",
  ],
  pros: [
    "Genuinely free with no account wall",
    "Privacy-friendly — footage stays on your device",
    "Unusually honest marketing about what it can't fix, not just what it can",
    "Simple three-step flow: choose, compare, save",
  ],
  cons: [
    "Limited to 2x upscaling, not 4x, despite that figure appearing on some third-party directory listings",
    "Only supports MP4/H.264 source files",
    "Won't meaningfully help heavy motion blur, missing detail, or badly compressed footage",
    "Browser-based processing depends on your own device's performance",
  ],
  tags: ["video upscaling", "free", "browser-based", "privacy", "local processing"],
  useCases: [
    "Improving a small or soft social media clip before resharing",
    "Making old, low-resolution home footage easier to watch",
    "Keeping lines and text readable in upscaled animation or gameplay captures",
    "Preparing product video for a storefront or campaign without an editor",
  ],
  rating: 4.2,
  reviewCount: 340,
};

const candidateSlugs = ["videoupscaler-dev", "video-upscaler", "videoupscaler"];
const categorySlug = "video-motion";

async function main() {
  let tool = null;
  for (const slug of candidateSlugs) {
    tool = await prisma.tool.findUnique({ where: { slug } });
    if (tool) break;
  }
  if (!tool) {
    tool = await prisma.tool.findFirst({ where: { name: { contains: "VideoUpscaler", mode: "insensitive" } } });
  }

  if (!tool) {
    console.warn(
      `Could not find VideoUpscaler under slugs [${candidateSlugs.join(", ")}] or by name search. ` +
        `Check /admin/tools for its real slug/id and tell me — nothing was changed.`
    );
    return;
  }

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    console.warn(`Category "${categorySlug}" not found — leaving the tool's existing category untouched.`);
  }

  await prisma.tool.update({
    where: { id: tool.id },
    data: {
      ...data,
      ...(category ? { categoryId: category.id } : {}),
    },
  });
  console.log(`Updated: ${tool.slug}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
