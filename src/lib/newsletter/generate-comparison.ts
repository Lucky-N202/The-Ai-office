import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const SYSTEM_PROMPT = `You write a comparison blog post for an AI tools directory, comparing 2-3 named tools using ONLY the factual data provided about them — never invent features, pricing, or capabilities not present in the data.

Respond with ONLY a JSON object, no markdown fences, no prose outside it:
{
  "title": "a specific, factual headline in the style '<Tool A> vs <Tool B>: <question or angle>'",
  "excerpt": "one sentence, under 160 characters, for use as a meta description and preview text",
  "content": "the full article body in markdown, 400-600 words, following this structure: a short intro framing why these tools get compared, then one section per tool covering what it's actually best at (using its real features/use cases from the data), then a 'Quick picks by use case' bulleted section, then a closing paragraph. End with a 'Compare them directly:' line followed by markdown links in the form [Tool Name](/browse/tools/tool-slug) for each tool."
}

Style: plain, direct, specific — the way a knowledgeable person would explain the real trade-off to a friend, not marketing copy. Never claim a tool is simply better than another; explain what each is actually for and let the reader match it to their situation.`;

export type ComparisonResult = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
} | null;

/**
 * Finds one tool-alternatives pairing that doesn't already have a
 * comparison post (checked heuristically: does any existing article slug
 * contain both tools' slugs, matching the "a-vs-b" naming convention used
 * throughout this blog), then drafts a comparison article about it via
 * Claude, grounded only in the real feature/use-case/pros/cons data already
 * in the database.
 *
 * Always returns a DRAFT — this never auto-publishes. See
 * api/cron/monthly-comparison/route.ts for how the result is saved and
 * routed to /admin/articles for review, matching the same pattern as the
 * weekly tool-change digest.
 */
export async function generateComparisonPost(): Promise<ComparisonResult> {
  if (!client) return null;

  const toolsWithAlternatives = await prisma.tool.findMany({
    where: { alternatives: { some: {} } },
    include: {
      alternatives: true,
      category: { select: { name: true } },
    },
  });

  const existingSlugs = (await prisma.article.findMany({ select: { slug: true } })).map((a) => a.slug);

  type Pair = { a: (typeof toolsWithAlternatives)[number]; b: (typeof toolsWithAlternatives)[number]["alternatives"][number] };
  const candidates: Pair[] = [];
  for (const tool of toolsWithAlternatives) {
    for (const alt of tool.alternatives) {
      const alreadyCovered = existingSlugs.some((slug) => slug.includes(tool.slug) && slug.includes(alt.slug));
      if (!alreadyCovered) candidates.push({ a: tool, b: alt });
    }
  }

  if (candidates.length === 0) return null;

  // Pick one at random rather than always the first, so re-running this
  // near-simultaneously (or across months) doesn't keep proposing the same
  // pairing if an admin hasn't gotten to reviewing the last draft yet.
const picked = candidates[Math.floor(Math.random() * candidates.length)];
if (!picked) return null;
const { a: toolA, b: toolBSummary } = picked;
  const toolB = await prisma.tool.findUnique({
    where: { id: toolBSummary.id },
    include: { category: { select: { name: true } } },
  });
  if (!toolB) return null;

  const describeToolData = (t: typeof toolA | typeof toolB) => `
### ${t.name} (${t.category.name})
Tagline: ${t.tagline}
Description: ${t.description}
Features: ${t.features.join("; ")}
Pros: ${t.pros.join("; ")}
Cons: ${t.cons.join("; ")}
Use cases: ${t.useCases.join("; ")}
Slug: ${t.slug}
`;

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Write a comparison post for these two tools, using only the data below:\n${describeToolData(toolA)}\n${describeToolData(toolB)}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = JSON.parse(textBlock.text.trim()) as { title: string; excerpt: string; content: string };

    const baseSlug = slugify(parsed.title);
    // Unlike the weekly digest (which appends a date since the same topic
    // recurs weekly), a comparison post is a one-time topic — no date
    // suffix needed unless the slug happens to collide.
    const slug = existingSlugs.includes(baseSlug) ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    return { title: parsed.title, slug, excerpt: parsed.excerpt, content: parsed.content };
  } catch {
    return null;
  }
}
