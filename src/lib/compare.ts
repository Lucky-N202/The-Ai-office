import { prisma } from "@/lib/prisma";

/** One canonical URL per pair: slugs sorted alphabetically, joined by "-vs-". */
export function pairSlug(a: string, b: string) {
  return [a, b].sort().join("-vs-");
}

/**
 * Every curated pairing (Tool.alternatives, either direction), de-duplicated.
 * Only these pairs get a page — arbitrary combinations would create an
 * unbounded crawl space of thin pages.
 */
export async function getComparePairs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const tools = await prisma.tool.findMany({
    select: { slug: true, updatedAt: true, alternatives: { select: { slug: true, updatedAt: true } } },
  });
  const pairs = new Map<string, Date>();
  for (const t of tools) {
    for (const alt of t.alternatives) {
      const key = pairSlug(t.slug, alt.slug);
      const updated = t.updatedAt > alt.updatedAt ? t.updatedAt : alt.updatedAt;
      const prev = pairs.get(key);
      if (!prev || updated > prev) pairs.set(key, updated);
    }
  }
  return [...pairs.entries()].map(([slug, updatedAt]) => ({ slug, updatedAt }));
}

const toolInclude = {
  category: { select: { id: true, name: true } },
  alternatives: { select: { id: true } },
  alternativeTo: { select: { id: true } },
} as const;

/**
 * Resolves "a-vs-b" into two tools, but only if they're a curated pairing.
 * Slugs can themselves contain "-vs-", so every split point is tried.
 */
export async function getComparePair(pair: string) {
  let from = 0;
  for (;;) {
    const i = pair.indexOf("-vs-", from);
    if (i === -1) return null;
    from = i + 1;
    const slugA = pair.slice(0, i);
    const slugB = pair.slice(i + 4);
    if (!slugA || !slugB || slugA === slugB) continue;

    const found = await prisma.tool.findMany({
      where: { slug: { in: [slugA, slugB] } },
      include: toolInclude,
    });
    if (found.length !== 2) continue;

    const [a, b] = found.sort((x, y) => (x.slug < y.slug ? -1 : 1));
    if (!a || !b) continue;
    const related =
      a.alternatives.some((t) => t.id === b.id) || a.alternativeTo.some((t) => t.id === b.id);
    if (!related) continue;

    return { a, b, canonical: pairSlug(a.slug, b.slug) };
  }
}
