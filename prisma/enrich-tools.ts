/**
 * One-off data enrichment: adds `useCases` and curated `alternatives` to the
 * tools already in the catalog. Safe to re-run — uses `set` for the
 * alternatives relation, so re-running just re-applies the same state
 * rather than duplicating connections.
 *
 * Run once after `prisma db push` has added the new columns/relation:
 *   npx tsx prisma/enrich-tools.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const enrichment: Record<string, { useCases: string[]; alternatives: string[] }> = {
  claude: {
    useCases: [
      "Long-form writing and editing",
      "Agentic, multi-step coding workflows",
      "Analyzing and summarizing large documents",
      "Complex reasoning and research tasks",
    ],
    alternatives: ["chatgpt", "gemini"],
  },
  chatgpt: {
    useCases: [
      "General-purpose conversational assistant",
      "Brainstorming and first-draft writing",
      "Quick coding help and debugging",
      "Image generation via built-in DALL\u00b7E",
    ],
    alternatives: ["claude", "gemini", "perplexity"],
  },
  gemini: {
    useCases: [
      "Multimodal tasks combining text, image, and video",
      "Deep integration with Gmail, Docs, and Google Workspace",
      "Search-grounded, up-to-date answers",
    ],
    alternatives: ["chatgpt", "claude", "perplexity"],
  },
  "github-copilot": {
    useCases: [
      "Inline code completion inside your IDE",
      "Boilerplate and repetitive code generation",
      "Unit test scaffolding",
    ],
    alternatives: ["cursor", "replit-agent"],
  },
  cursor: {
    useCases: [
      "AI-native editing across an entire codebase",
      "Multi-file refactors",
      "Chat-driven debugging inside the editor",
    ],
    alternatives: ["github-copilot", "replit-agent"],
  },
  "replit-agent": {
    useCases: [
      "Building and deploying full apps from a prompt",
      "Rapid prototyping with zero local setup",
      "Hosting web apps directly in-browser",
    ],
    alternatives: ["cursor", "github-copilot"],
  },
  midjourney: {
    useCases: [
      "Highly stylized concept art and illustration",
      "Mood boards and visual exploration",
      "Marketing and social media visuals",
    ],
    alternatives: ["dalle-3", "stable-diffusion"],
  },
  "dalle-3": {
    useCases: [
      "Photorealistic image generation from detailed prompts",
      "Illustrating blog and social content",
      "Iterating on images through ChatGPT conversation",
    ],
    alternatives: ["midjourney", "stable-diffusion"],
  },
  "stable-diffusion": {
    useCases: [
      "Self-hosted, open-source image generation",
      "Fine-tuning on custom styles or datasets",
      "High-volume batch generation without per-image API costs",
    ],
    alternatives: ["midjourney", "dalle-3"],
  },
  runway: {
    useCases: [
      "Text-to-video generation",
      "AI-assisted video editing (inpainting, green screen)",
      "Motion graphics for short-form content",
    ],
    alternatives: ["synthesia"],
  },
  synthesia: {
    useCases: [
      "AI avatar presenter videos for training and e-learning",
      "Multilingual corporate video localization",
      "Product explainer videos without filming",
    ],
    alternatives: ["runway"],
  },
  elevenlabs: {
    useCases: [
      "Realistic text-to-speech voiceovers",
      "Voice cloning for creators and studios",
      "Multilingual dubbing",
    ],
    alternatives: ["suno"],
  },
  suno: {
    useCases: [
      "Generating original songs from text prompts",
      "Background music for videos",
      "Quick jingles and demo tracks",
    ],
    alternatives: ["elevenlabs"],
  },
  jasper: {
    useCases: [
      "Marketing copy at scale for teams",
      "On-brand content using saved brand voice",
      "Campaign asset generation",
    ],
    alternatives: ["grammarly", "notion-ai"],
  },
  grammarly: {
    useCases: [
      "Grammar and style checking across any app",
      "Tone adjustment for professional writing",
      "Plagiarism checking",
    ],
    alternatives: ["jasper", "notion-ai"],
  },
  "notion-ai": {
    useCases: [
      "Summarizing notes and docs inside Notion",
      "Drafting content directly in your workspace",
      "Auto-generating meeting notes and action items",
    ],
    alternatives: ["jasper", "grammarly"],
  },
  perplexity: {
    useCases: [
      "Cited, source-backed answers for research questions",
      "Fast fact-checking with linked sources",
      "Comparing products using real-time information",
    ],
    alternatives: ["chatgpt", "gemini", "elicit"],
  },
  elicit: {
    useCases: [
      "Literature reviews and academic paper summarization",
      "Extracting data across many research papers at once",
      "Finding related studies on a topic",
    ],
    alternatives: ["perplexity"],
  },
  "julius-ai": {
    useCases: [
      "Natural-language data analysis on spreadsheets/CSVs",
      "Generating charts from plain-English requests",
      "Quick statistical analysis without writing code",
    ],
    alternatives: ["hex"],
  },
  hex: {
    useCases: [
      "Collaborative data notebooks for teams",
      "AI-assisted SQL and Python analysis",
      "Building internal data dashboards",
    ],
    alternatives: ["julius-ai"],
  },
  "figma-ai": {
    useCases: [
      "Generating UI layout variations inside Figma",
      "Auto-naming layers and cleaning up files",
      "Translating designs into multiple languages",
    ],
    alternatives: ["galileo-ai"],
  },
  "galileo-ai": {
    useCases: [
      "Generating full UI screens from a text prompt",
      "Rapid wireframing for product concepts",
      "Exploring design directions before high-fidelity work",
    ],
    alternatives: ["figma-ai"],
  },
  "intercom-fin": {
    useCases: [
      "AI-first support chatbot trained on your help docs",
      "Automatically resolving common tickets",
      "Escalating complex issues to human agents",
    ],
    alternatives: ["zendesk-ai"],
  },
  "zendesk-ai": {
    useCases: [
      "AI-suggested replies for support agents",
      "Ticket triage and routing",
      "Support analytics on recurring issues",
    ],
    alternatives: ["intercom-fin"],
  },
};

async function main() {
  for (const [slug, { useCases, alternatives }] of Object.entries(enrichment)) {
    const tool = await prisma.tool.findUnique({ where: { slug } });
    if (!tool) {
      console.warn(`Skipping "${slug}" — not found in the database.`);
      continue;
    }

    // Only connect alternatives that actually exist in this database —
    // avoids a hard failure if the catalog has since changed.
    const existingAlternatives = await prisma.tool.findMany({
      where: { slug: { in: alternatives } },
      select: { slug: true },
    });
    const foundSlugs = existingAlternatives.map((t) => t.slug);
    const missing = alternatives.filter((s) => !foundSlugs.includes(s));
    if (missing.length > 0) {
      console.warn(`"${slug}": skipping missing alternative(s): ${missing.join(", ")}`);
    }

    await prisma.tool.update({
      where: { slug },
      data: {
        useCases,
        alternatives: { set: foundSlugs.map((s) => ({ slug: s })) },
      },
    });
    console.log(`Updated ${slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
