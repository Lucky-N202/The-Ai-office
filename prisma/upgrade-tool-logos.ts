/**
 * Fixes the "no picture" problem across your catalog: every one of your 33
 * tools currently uses `google.com/s2/favicons` as its logo — a low-res
 * scrape that's often blurry or a generic placeholder icon.
 *
 * This swaps in real, high-quality logos from LobeHub's icon library
 * (github.com/lobehub/lobe-icons), an actively maintained, purpose-built
 * collection of AI/LLM brand icons — verified by downloading the actual
 * npm package and checking file contents before writing any of this, not
 * guessed from memory.
 *
 * Covers 22 of your 33 tools. The other 11 (Grammarly, Jasper, Synthesia,
 * Elicit, Julius AI, Hex, Galileo AI, Intercom Fin, Zendesk AI, Aider,
 * Jupyter AI) aren't in this library — smaller/non-model-provider products
 * it doesn't cover — so they're left untouched on the favicon fallback
 * rather than guessing at a URL that might not exist.
 *
 * Version pinned (not @latest) so a future library reorganization can't
 * silently break these URLs.
 *
 * Safe to re-run.
 *
 * Run once:
 *   npx tsx prisma/upgrade-tool-logos.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ICON_BASE = "https://unpkg.com/@lobehub/icons-static-png@1.97.0/light";

// slug -> icon filename (without .png), verified to exist in the package
const logoUpgrades: Record<string, string> = {
  claude: "claude-color",
  chatgpt: "openai", // ChatGPT has no dedicated icon in this library; OpenAI's is the accurate choice
  gemini: "gemini-color",
  "github-copilot": "githubcopilot",
  cursor: "cursor",
  "replit-agent": "replit-color",
  midjourney: "midjourney",
  "dalle-3": "dalle-color",
  "stable-diffusion": "stability-color", // Stability AI, the company behind Stable Diffusion
  runway: "runway",
  elevenlabs: "elevenlabs",
  suno: "suno",
  "notion-ai": "notion",
  perplexity: "perplexity-color",
  "figma-ai": "figma-color",
  cline: "cline",
  ollama: "ollama",
  comfyui: "comfyui-color",
  crewai: "crewai-color",
  n8n: "n8n-color",
  "open-webui": "openwebui",
  whisper: "openai", // Whisper is an OpenAI project with no icon of its own here
};

async function main() {
  for (const [slug, iconName] of Object.entries(logoUpgrades)) {
    const tool = await prisma.tool.findUnique({ where: { slug } });
    if (!tool) {
      console.warn(`Skipping "${slug}" — not found in the database.`);
      continue;
    }
    await prisma.tool.update({
      where: { slug },
      data: { logoUrl: `${ICON_BASE}/${iconName}.png` },
    });
    console.log(`Updated logo: ${slug} -> ${iconName}.png`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
