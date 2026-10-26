import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { DEFAULT_MODEL, parseModelJson, slugExists } from "@/lib/newsletter/util";

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const SYSTEM_PROMPT = `You write a practical, honest "tool spotlight" for an AI tools directory, using ONLY the facts provided — never invent features, prices, integrations, customers or claims that aren't in the data.

Respond with ONLY a JSON object, no markdown fences:
{
  "title": "specific and useful, e.g. 'Is <Tool> worth it? Pricing, strengths and who it's for' — no clickbait, no exclamation marks",
  "excerpt": "one sentence, under 160 characters, for meta description",
  "content": "markdown body, 350-550 words, with ## subheadings (e.g. What it does, Pricing, Strengths, Limitations, Who it's best for, Alternatives)"
}

Be balanced: give the real cons as much weight as the pros. If a data field is empty, skip that section rather than padding.`;

export type SpotlightResult = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  toolNames: string[];
};

/**
 * A grounded weekly post for slow weeks when the change feed is quiet. Picks
 * the best-rated tool that has never had a spotlight, so a post is never
 * repeated and the content is always built from the directory's own data.
 */
export async function generateToolSpotlight(): Promise<SpotlightResult | null> {
  if (!client) return null;

  const candidates = await prisma.tool.findMany({
    orderBy: [{ clickCount: "desc" }, { rating: "desc" }],
    take: 60,
    include: {
      category: { select: { name: true } },
      alternatives: { select: { name: true } },
      alternativeTo: { select: { name: true } },
    },
  });

  let tool: (typeof candidates)[number] | undefined;
  let slug = "";
  for (const t of candidates) {
    const s = `${t.slug}-pricing-features-review`;
    if (!(await slugExists(s))) {
      tool = t;
      slug = s;
      break;
    }
  }
  if (!tool) return null;

  const alts = [...new Set([...tool.alternatives, ...tool.alternativeTo].map((a) => a.name))];
  const facts = [
    `Name: ${tool.name}`,
    `Category: ${tool.category.name}`,
    `Tagline: ${tool.tagline}`,
    `Description: ${tool.description}`,
    `Pricing model: ${tool.pricingModel}${tool.startingPrice != null ? `, from $${tool.startingPrice}/mo` : ""}`,
    `Features: ${tool.features.join("; ") || "(none listed)"}`,
    `Best for: ${tool.useCases.join("; ") || "(none listed)"}`,
    `Pros: ${tool.pros.join("; ") || "(none listed)"}`,
    `Cons: ${tool.cons.join("; ") || "(none listed)"}`,
    `Alternatives in our directory: ${alts.join(", ") || "(none listed)"}`,
    tool.reviewCount > 0 ? `User rating: ${tool.rating.toFixed(1)}/5 from ${tool.reviewCount} reviews` : "No user reviews yet",
  ].join("\n");

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: facts }],
    });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;
    const parsed = parseModelJson<{ title: string; excerpt: string; content: string }>(block.text);
    return {
      title: parsed.title,
      slug: slug || slugify(parsed.title),
      excerpt: parsed.excerpt,
      content: parsed.content,
      toolNames: [tool.name, ...alts.slice(0, 3)],
    };
  } catch {
    return null;
  }
}
