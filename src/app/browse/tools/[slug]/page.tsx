import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft, Check, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/bookmark-button";
import { ReviewForm } from "@/components/review-form";
import { ToolCard } from "@/components/tool-card";
import { JsonLd } from "@/components/json-ld";
import { formatPrice, pricingLabel, formatNumber } from "@/lib/utils";
import { pairSlug } from "@/lib/compare";

export const revalidate = 3600;

async function getTool(slug: string) {
  return prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 10 },
      alternatives: { include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } } },
      alternativeTo: { include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } } },
    },
  });
}

export async function generateStaticParams() {
  try {
    const tools = await prisma.tool.findMany({ select: { slug: true } });
    return tools.map((t) => ({ slug: t.slug }));
  } catch (err) {
    console.error("generateStaticParams: failed to fetch tools, falling back to on-demand rendering", err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  let tool;
  try {
    tool = await getTool(slug);
  } catch (err) {
    // A transient DB hiccup here previously crashed the *entire* build,
    // not just this one page's metadata — generateStaticParams already
    // succeeded in listing this slug, so Next.js still tries to prerender
    // it; if the DB drops between those two calls, this used to be fatal.
    // Falling back to generic metadata lets the build continue; the actual
    // page component below still renders real content once the DB
    // recovers (on this build or the next request, per ISR).
    console.error(`generateMetadata: failed to fetch tool "${slug}", using fallback metadata`, err);
    return { title: "Tool — The AI Office" };
  }
  if (!tool) return {};
  const siteUrl = getSiteUrl();
  return {
    // Match what people actually search ("<tool> pricing", "<tool> alternatives")
    // instead of repeating the tagline; the layout's title template appends the
    // site name.
    title: `${tool.name} Review: Pricing, Features & Alternatives`,
    description: `${tool.name}: ${tool.tagline.replace(/\.$/, "")}. See features, pricing, pros and cons, and the best alternatives.`.slice(0, 160),
    keywords: [tool.name, tool.category.name, ...tool.tags, ...tool.useCases],
    alternates: { canonical: `${siteUrl}/browse/tools/${tool.slug}` },
    openGraph: {
      title: `${tool.name} Review: Pricing, Features & Alternatives`,
      description: tool.tagline,
      url: `${siteUrl}/browse/tools/${tool.slug}`,
      images: [{ url: tool.logoUrl }],
      type: "website",
    },
    twitter: { card: "summary", title: tool.name, description: tool.tagline },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) notFound();

  // Merge both relation directions and dedupe — see schema comment on why
  // there are two fields for what's conceptually one relationship.
  const alternativesMap = new Map([...tool.alternatives, ...tool.alternativeTo].map((t) => [t.id, t]));
  const alternatives = [...alternativesMap.values()];

  const related = await prisma.tool.findMany({
    where: { categoryId: tool.categoryId, id: { notIn: [tool.id, ...alternatives.map((a) => a.id)] } },
    include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
    take: 4,
  });

  const recentChanges = await prisma.toolChange.findMany({
    where: { toolId: tool.id, status: { in: ["AUTO_APPLIED", "APPROVED"] } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, summary: true, changeType: true, createdAt: true },
  });

  const siteUrl = getSiteUrl();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: tool.name,
          description: tool.description,
          applicationCategory: tool.category.name,
          url: `${siteUrl}/browse/tools/${tool.slug}`,
          image: tool.logoUrl,
          datePublished: tool.createdAt.toISOString(),
          dateModified: tool.updatedAt.toISOString(),
          keywords: [...tool.tags, ...tool.useCases].join(", "),
          featureList: tool.features,
          // Only emit an Offer when the price is actually known (or the tool is
          // free/open source) — previously unknown-price paid tools were
          // published to Google as "$0".
          offers:
            tool.startingPrice != null || tool.pricingModel === "FREE" || tool.pricingModel === "OPEN_SOURCE"
              ? { "@type": "Offer", price: tool.startingPrice ?? 0, priceCurrency: "USD" }
              : undefined,
          aggregateRating: tool.reviewCount > 0 ? {
            "@type": "AggregateRating",
            ratingValue: tool.rating,
            reviewCount: tool.reviewCount,
          } : undefined,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "All Tools", item: `${siteUrl}/browse/tools/all` },
              { "@type": "ListItem", position: 2, name: tool.category.name, item: `${siteUrl}/browse/categories/${tool.category.id}` },
              { "@type": "ListItem", position: 3, name: tool.name, item: `${siteUrl}/browse/tools/${tool.slug}` },
            ],
          },
        }}
      />

      <Link href="/browse/tools/all" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        <ArrowLeft size={14} /> Back to all tools
      </Link>

      <div className="card-surface flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white/5">
            <Image src={tool.logoUrl} alt={`${tool.name} logo`} fill sizes="64px" className="object-cover" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{tool.name}</h1>
              {tool.verified && <Badge className="border-[var(--color-primary)] text-[var(--color-primary)]">Verified</Badge>}
            </div>
            <p className="text-[var(--color-muted)]">{tool.tagline}</p>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={tool.rating} />
              <span className="text-sm text-[var(--color-muted-2)]">{tool.rating.toFixed(1)} ({formatNumber(tool.reviewCount)} reviews)</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <BookmarkButton toolId={tool.id} toolName={tool.name} />
            <a href={`/out/${tool.id}`} target="_blank" rel="noopener noreferrer nofollow sponsored">
              <Button>
                Visit Website <ExternalLink size={14} />
              </Button>
            </a>
          </div>
          {tool.affiliateUrl && (
            <p className="text-[11px] text-[var(--color-muted-2)]">We may earn a commission from this link.</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-semibold">About {tool.name}</h2>
            <p className="leading-relaxed text-[var(--color-muted)]">{tool.description}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Key Features</h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {tool.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                  <Check size={15} className="mt-0.5 shrink-0 text-[var(--color-primary)]" /> {f}
                </li>
              ))}
            </ul>
          </section>

          {tool.useCases.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Best For</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tool.useCases.map((u) => (
                  <li key={u} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" /> {u}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">Pros</h3>
              <ul className="space-y-2">
                {tool.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0 text-green-400" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">Cons</h3>
              <ul className="space-y-2">
                {tool.cons.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm">
                    <X size={14} className="mt-0.5 shrink-0 text-red-400" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {recentChanges.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Recent changes</h2>
              <ul className="space-y-2">
                {recentChanges.map((c) => (
                  <li key={c.id} className="text-sm text-[var(--color-muted)]">
                    <span className="text-xs text-[var(--color-muted-2)]">
                      {c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ·{" "}
                    </span>
                    {c.summary}
                  </li>
                ))}
              </ul>
              <Link href="/pricing-changes" className="mt-2 inline-block text-xs text-[var(--color-primary)]">
                See all AI tool changes →
              </Link>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
            <div className="mb-4">
              <ReviewForm toolId={tool.id} toolSlug={tool.slug} />
            </div>
            {tool.reviews.length > 0 ? (
              <div className="space-y-4">
                {tool.reviews.map((review) => (
                  <div key={review.id} className="card-surface p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="font-medium">{review.title}</p>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-sm text-[var(--color-muted)]">{review.body}</p>
                    <p className="mt-2 text-xs text-[var(--color-muted-2)]">— {review.user.name ?? "Anonymous"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No reviews yet — be the first to share your experience.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">Pricing</h3>
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              {tool.startingPrice != null ? formatPrice(tool.startingPrice) : pricingLabel(tool.pricingModel)}
            </p>
            <p className="text-xs text-[var(--color-muted-2)]">{pricingLabel(tool.pricingModel)}</p>
          </div>
          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">Category</h3>
            <Link href={`/browse/categories/${tool.category.id}`} className="text-sm text-[var(--color-primary)]">
              {tool.category.name}
            </Link>
          </div>
          <details className="card-surface p-5">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--color-muted)]">
              Own {tool.name}? Add our badge
            </summary>
            <p className="mt-3 text-xs text-[var(--color-muted-2)]">
              Show visitors you&rsquo;re listed here. Paste this on your site:
            </p>
            <pre className="mt-2 select-all overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-black/30 p-3 text-[11px] text-[var(--color-muted)]">{`<a href="${siteUrl}/browse/tools/${tool.slug}" target="_blank" rel="noopener"><img src="${siteUrl}/badge/${tool.slug}" alt="${tool.name} on The AI Office" width="220" height="56" /></a>`}</pre>
            <Link href="/advertise" className="mt-3 inline-block text-xs text-[var(--color-primary)]">
              Want Verified or Featured placement? →
            </Link>
          </details>
          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          </div>
        </aside>
      </div>

      {alternatives.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-3 text-xl font-semibold">Popular alternatives to {tool.name}</h2>
          <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)]">
            Compare head-to-head:
            {alternatives.map((t) => (
              <Link
                key={t.id}
                href={`/browse/compare/${pairSlug(tool.slug, t.slug)}`}
                className="text-[var(--color-primary)] hover:underline"
              >
                {tool.name} vs {t.name}
              </Link>
            ))}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {alternatives.map((t, i) => <ToolCard key={t.id} tool={t} index={i} />)}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold">Similar tools in {tool.category.name}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t, i) => <ToolCard key={t.id} tool={t} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
