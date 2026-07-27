import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const SYSTEM_PROMPT = `You write a short, factual weekly roundup for an AI tools directory, based on real data provided to you — never invent tools, prices, or changes not present in the data.

Respond with ONLY a JSON object, no markdown fences, no prose outside it:
{
  "title": "a specific, factual headline — not clickbait, no exclamation marks",
  "excerpt": "one sentence, under 160 characters, for use as a meta description and preview text",
  "content": "the full article body in markdown, 300-500 words"
}

Style: plain, direct, specific. Reference actual tool names, actual price figures, actual counts from the data — never vague filler like "the AI landscape continues to evolve." If the data provided is sparse (few or no changes), write a correspondingly short article rather than padding it — a short honest roundup beats an inflated one.`;

export type DigestResult = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
} | null;

/**
 * Builds a draft "this week in AI tools" article from ToolChange records
 * created in the last 7 days (the Intelligence Engine's own output) plus any
 * tools added in that window. Always returns a DRAFT — this never
 * auto-publishes or auto-sends; see /admin/articles for the review step.
 */
export async function generateWeeklyDigest(): Promise<DigestResult> {
  if (!client) return null;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [changes, newTools] = await Promise.all([
    prisma.toolChange.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: ["AUTO_APPLIED", "APPROVED"] },
      },
      include: { tool: { select: { name: true, category: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tool.findMany({
      where: { createdAt: { gte: since } },
      select: { name: true, tagline: true, category: { select: { name: true } } },
    }),
  ]);

  // Nothing happened this week — don't waste an AI call generating filler
  // about nothing, and don't create an empty draft for an admin to deal with.
  if (changes.length === 0 && newTools.length === 0) return null;

  const changesSummary = changes
    .map((c) => `- ${c.tool.name} (${c.tool.category.name}): ${c.summary}`)
    .join("\n");
  const newToolsSummary = newTools
    .map((t) => `- ${t.name} (${t.category.name}): ${t.tagline}`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Verified tool changes this week:\n${changesSummary || "(none)"}\n\nNew tools added this week:\n${newToolsSummary || "(none)"}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = JSON.parse(textBlock.text.trim()) as { title: string; excerpt: string; content: string };

    // Ensure slug uniqueness by appending a short date suffix — weekly
    // digests will often generate similar titles week to week.
    const baseSlug = slugify(parsed.title);
    const dateSuffix = new Date().toISOString().slice(0, 10);

    return {
      title: parsed.title,
      slug: `${baseSlug}-${dateSuffix}`,
      excerpt: parsed.excerpt,
      content: parsed.content,
    };
  } catch {
    return null;
  }
}
