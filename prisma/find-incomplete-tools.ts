/**
 * I don't have direct access to your production database, so I can't see
 * which tools are missing information myself. Run this, and paste the
 * output back to me — I'll research and fill in each one by name, the same
 * way I just did for VideoUpscaler.
 *
 * Flags a tool if:
 *   - pros, cons, features, or useCases is empty
 *   - logoUrl is missing, or is still the Google favicon fallback
 *     (a working image, but the lowest-quality option — see the earlier
 *     logo-upgrade pass for why this matters)
 *   - tagline or description looks suspiciously short (likely a
 *     placeholder from a quick manual add or an approved submission that
 *     was never fleshed out)
 *
 * Read-only — makes no changes.
 *
 * Run:
 *   npx tsx prisma/find-incomplete-tools.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tools = await prisma.tool.findMany({
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      tagline: true,
      description: true,
      logoUrl: true,
      features: true,
      pros: true,
      cons: true,
      useCases: true,
    },
  });

  const flagged: { name: string; slug: string; issues: string[] }[] = [];

  for (const t of tools) {
    const issues: string[] = [];
    if (t.features.length === 0) issues.push("no features");
    if (t.pros.length === 0) issues.push("no pros");
    if (t.cons.length === 0) issues.push("no cons");
    if (t.useCases.length === 0) issues.push("no use cases");
    if (!t.logoUrl) issues.push("no logo");
    else if (t.logoUrl.includes("google.com/s2/favicons")) issues.push("logo is favicon fallback, not a real logo");
    if (t.tagline.length < 15) issues.push("tagline looks like a placeholder");
    if (t.description.length < 150) issues.push("description looks thin");

    if (issues.length > 0) flagged.push({ name: t.name, slug: t.slug, issues });
  }

  if (flagged.length === 0) {
    console.log("Every tool has complete information. Nothing to report.");
    return;
  }

  console.log(`${flagged.length} of ${tools.length} tools have at least one gap:\n`);
  for (const f of flagged) {
    console.log(`- ${f.name} (${f.slug}): ${f.issues.join(", ")}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
