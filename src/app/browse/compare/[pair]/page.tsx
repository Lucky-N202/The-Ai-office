import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Check, X, ExternalLink, ArrowLeft } from "lucide-react";
import { getSiteUrl } from "@/lib/site";
import { getComparePair, getComparePairs } from "@/lib/compare";
import { JsonLd } from "@/components/json-ld";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPrice, pricingLabel } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    return (await getComparePairs()).map((p) => ({ pair: p.slug }));
  } catch (err) {
    console.error("generateStaticParams: failed to fetch compare pairs, falling back to on-demand rendering", err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  let result;
  try {
    result = await getComparePair(pair);
  } catch (err) {
    console.error(`generateMetadata: failed to resolve compare pair "${pair}"`, err);
    return { title: "Compare AI Tools" };
  }
  if (!result) return {};

  const { a, b, canonical } = result;
  const siteUrl = getSiteUrl();
  const title = `${a.name} vs ${b.name}: Features, Pricing & Which to Choose`;
  const description = `${a.name} vs ${b.name} compared side by side — features, pricing, pros and cons, and ratings. See which AI tool fits your workflow.`;
  const url = `${siteUrl}/browse/compare/${canonical}`;

  return {
    title,
    description,
    alternates: { canonical: url, types: { "application/rss+xml": `${siteUrl}/rss.xml` } },
    openGraph: { type: "website", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

type Tool = NonNullable<Awaited<ReturnType<typeof getComparePair>>>["a"];

function ToolColumnHeader({ tool }: { tool: Tool }) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 p-6 text-center">
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white/5">
        <Image src={tool.logoUrl} alt={`${tool.name} logo`} fill sizes="64px" className="object-cover" />
      </div>
      <Link href={`/browse/tools/${tool.slug}`} className="text-xl font-semibold hover:text-[var(--color-primary)]">
        {tool.name}
      </Link>
      <p className="text-sm text-[var(--color-muted)]">{tool.tagline}</p>
      <div className="flex items-center gap-2">
        <StarRating rating={tool.rating} />
        <span className="text-xs text-[var(--color-muted-2)]">
          {tool.rating.toFixed(1)} ({formatNumber(tool.reviewCount)})
        </span>
      </div>
      <a href={`/out/${tool.id}`} target="_blank" rel="noopener noreferrer nofollow sponsored">
        <Button>
          Visit {tool.name} <ExternalLink size={14} />
        </Button>
      </a>
      {tool.affiliateUrl && (
        <p className="text-[11px] text-[var(--color-muted-2)]">We may earn a commission from this link.</p>
      )}
    </div>
  );
}

function List({ items, kind }: { items: string[]; kind: "pro" | "con" | "plain" }) {
  if (items.length === 0) return <p className="text-sm text-[var(--color-muted-2)]">—</p>;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
          {kind === "pro" && <Check size={14} className="mt-0.5 shrink-0 text-green-400" />}
          {kind === "con" && <X size={14} className="mt-0.5 shrink-0 text-red-400" />}
          {kind === "plain" && <Check size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />}
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Plain-language summary derived only from stored data — no invented claims. */
function quickTake(a: Tool, b: Tool): string[] {
  const lines: string[] = [];
  if (a.reviewCount > 0 && b.reviewCount > 0 && a.rating !== b.rating) {
    const [hi, lo] = a.rating > b.rating ? [a, b] : [b, a];
    lines.push(`${hi.name} is rated higher by our users (${hi.rating.toFixed(1)} vs ${lo.rating.toFixed(1)}).`);
  }
  if (a.startingPrice != null && b.startingPrice != null && a.startingPrice !== b.startingPrice) {
    const [lo, hi] = a.startingPrice < b.startingPrice ? [a, b] : [b, a];
    lines.push(`${lo.name} has the lower starting price (${formatPrice(lo.startingPrice)} vs ${formatPrice(hi.startingPrice)}).`);
  }
  if (a.pricingModel !== b.pricingModel) {
    lines.push(`${a.name} is ${pricingLabel(a.pricingModel).toLowerCase()}, while ${b.name} is ${pricingLabel(b.pricingModel).toLowerCase()}.`);
  }
  return lines;
}

export default async function ComparePairPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const result = await getComparePair(pair);
  if (!result) notFound();

  const { a, b, canonical } = result;
  // b-vs-a and a-vs-b are the same page — send everything to one URL.
  if (pair !== canonical) permanentRedirect(`/browse/compare/${canonical}`);

  const siteUrl = getSiteUrl();
  const take = quickTake(a, b);

  const rows: { label: string; a: string; b: string }[] = [
    { label: "Starting price", a: a.startingPrice != null ? formatPrice(a.startingPrice) : pricingLabel(a.pricingModel), b: b.startingPrice != null ? formatPrice(b.startingPrice) : pricingLabel(b.pricingModel) },
    { label: "Pricing model", a: pricingLabel(a.pricingModel), b: pricingLabel(b.pricingModel) },
    { label: "Rating", a: a.reviewCount > 0 ? `${a.rating.toFixed(1)} / 5` : "No reviews yet", b: b.reviewCount > 0 ? `${b.rating.toFixed(1)} / 5` : "No reviews yet" },
    { label: "Category", a: a.category.name, b: b.category.name },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${a.name} vs ${b.name}`,
          url: `${siteUrl}/browse/compare/${canonical}`,
          dateModified: (a.updatedAt > b.updatedAt ? a.updatedAt : b.updatedAt).toISOString(),
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Compare", item: `${siteUrl}/browse/compare` },
              { "@type": "ListItem", position: 2, name: `${a.name} vs ${b.name}`, item: `${siteUrl}/browse/compare/${canonical}` },
            ],
          },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: [a, b].map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${siteUrl}/browse/tools/${t.slug}`,
              name: t.name,
            })),
          },
        }}
      />

      <Link href="/browse/compare" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        <ArrowLeft size={14} /> Compare other tools
      </Link>

      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-4xl">
        {a.name} vs {b.name}
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--color-muted)]">
        A side-by-side look at {a.name} and {b.name}: what each does, what it costs, where each one is strong, and where
        it falls short.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ToolColumnHeader tool={a} />
        <ToolColumnHeader tool={b} />
      </div>

      {take.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Quick take</h2>
          <ul className="space-y-1.5 text-sm text-[var(--color-muted)]">
            {take.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">At a glance</h2>
        <div className="card-surface overflow-x-auto p-0">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="w-40 p-4 text-left font-normal text-[var(--color-muted-2)]" />
                <th className="p-4 text-left font-semibold">{a.name}</th>
                <th className="p-4 text-left font-semibold">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-[var(--color-border)] last:border-0">
                  <th scope="row" className="p-4 text-left font-normal text-[var(--color-muted-2)]">{r.label}</th>
                  <td className="p-4">{r.a}</td>
                  <td className="p-4">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {[
        { title: "Key features", ka: a.features, kb: b.features, kind: "plain" as const },
        { title: "Best for", ka: a.useCases, kb: b.useCases, kind: "plain" as const },
        { title: "Pros", ka: a.pros, kb: b.pros, kind: "pro" as const },
        { title: "Cons", ka: a.cons, kb: b.cons, kind: "con" as const },
      ].map((section) =>
        section.ka.length === 0 && section.kb.length === 0 ? null : (
          <section key={section.title} className="mt-10">
            <h2 className="mb-4 text-lg font-semibold">{section.title}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--color-muted)]">{a.name}</h3>
                <List items={section.ka} kind={section.kind} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--color-muted)]">{b.name}</h3>
                <List items={section.kb} kind={section.kind} />
              </div>
            </div>
          </section>
        )
      )}

      <section className="mt-12 flex flex-wrap gap-4 text-sm">
        <Link href={`/browse/tools/${a.slug}`} className="text-[var(--color-primary)]">Full {a.name} profile →</Link>
        <Link href={`/browse/tools/${b.slug}`} className="text-[var(--color-primary)]">Full {b.name} profile →</Link>
        <Link href={`/browse/categories/${a.category.id}`} className="text-[var(--color-primary)]">More in {a.category.name} →</Link>
      </section>
    </div>
  );
}
