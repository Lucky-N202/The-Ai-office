import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import { pageAlternates } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600;

// AUTO_APPLIED = detected + high confidence; APPROVED = a human confirmed it.
// PENDING_REVIEW / REJECTED are never shown publicly.
const PUBLIC_STATUSES = ["AUTO_APPLIED", "APPROVED"] as const;

async function getChanges() {
  return prisma.toolChange.findMany({
    where: { status: { in: [...PUBLIC_STATUSES] } },
    orderBy: { createdAt: "desc" },
    take: 150,
    include: { tool: { select: { name: true, slug: true, logoUrl: true } } },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  let count = 0;
  try {
    count = await prisma.toolChange.count({ where: { status: { in: [...PUBLIC_STATUSES] }, changeType: "pricing" } });
  } catch {
    // fall through with defaults
  }
  const title = "AI Tool Pricing Changes & Updates Tracker";
  const description =
    "A running log of pricing changes, new features and shutdowns across popular AI tools — detected automatically from each tool's own site.";
  return {
    title,
    description,
    alternates: pageAlternates("/pricing-changes"),
    // A near-empty tracker is thin content; keep it out of the index until it has substance.
    robots: count >= 3 ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "website", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

const TYPE_LABEL: Record<string, string> = {
  pricing: "Pricing",
  features: "Features",
  rebrand: "Rebrand",
  shutdown: "Shutdown",
  other: "Update",
};

type ChangeRow = Awaited<ReturnType<typeof getChanges>>[number];

function newPrice(c: ChangeRow): string | null {
  const u = c.suggestedUpdates as { startingPrice?: unknown } | null;
  return u && typeof u.startingPrice === "number" ? `$${u.startingPrice}/mo` : null;
}

export default async function PricingChangesPage() {
  const changes = await getChanges();
  const siteUrl = getSiteUrl();

  // Group by month, newest first (already sorted).
  const groups = new Map<string, ChangeRow[]>();
  for (const c of changes) {
    const key = c.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AI Tool Pricing Changes & Updates Tracker",
          url: `${siteUrl}/pricing-changes`,
          dateModified: (changes[0]?.createdAt ?? new Date()).toISOString(),
        }}
      />
      <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">AI Tool Pricing Changes</h1>
      <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
        Our monitoring checks each listed tool&rsquo;s own site every day and logs real changes here. Entries marked
        <em> auto-detected</em> were flagged with high confidence by our system; <em>reviewed</em> ones were confirmed
        by an editor. Always check the vendor&rsquo;s site before buying.
      </p>

      {changes.length === 0 ? (
        <p className="mt-10 text-[var(--color-muted)]">No changes recorded yet — check back soon.</p>
      ) : (
        [...groups.entries()].map(([month, rows]) => (
          <section key={month} className="mt-10">
            <h2 className="mb-4 text-lg font-semibold">{month}</h2>
            <ul className="space-y-3">
              {rows.map((c) => {
                const price = newPrice(c);
                return (
                  <li key={c.id} className="card-surface flex gap-4 p-4">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white/5">
                      <Image src={c.tool.logoUrl} alt={`${c.tool.name} logo`} fill sizes="40px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/browse/tools/${c.tool.slug}`} className="font-semibold hover:text-[var(--color-primary)]">
                          {c.tool.name}
                        </Link>
                        <Badge>{TYPE_LABEL[c.changeType] ?? "Update"}</Badge>
                        <span className="text-xs text-[var(--color-muted-2)]">
                          {c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
                          {c.status === "APPROVED" ? "reviewed" : "auto-detected"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">{c.summary}</p>
                      {price && c.changeType === "pricing" && (
                        <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">New starting price: {price}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
