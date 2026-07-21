import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft, Check, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/bookmark-button";
import { ToolCard } from "@/components/tool-card";
import { JsonLd } from "@/components/json-ld";
import { formatPrice, pricingLabel, formatNumber } from "@/lib/utils";

export const revalidate = 3600;

async function getTool(slug: string) {
  return prisma.tool.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 10 } },
  });
}

export async function generateStaticParams() {
  const tools = await prisma.tool.findMany({ select: { slug: true } });
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) return {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theaioffice.app";
  return {
    title: `${tool.name} — ${tool.tagline}`,
    description: tool.description.slice(0, 155),
    alternates: { canonical: `${siteUrl}/browse/tools/${tool.slug}` },
    openGraph: {
      title: `${tool.name} — ${tool.tagline}`,
      description: tool.description.slice(0, 155),
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

  const related = await prisma.tool.findMany({
    where: { categoryId: tool.categoryId, id: { not: tool.id } },
    include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
    take: 4,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theaioffice.app";

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
          offers: {
            "@type": "Offer",
            price: tool.startingPrice ?? 0,
            priceCurrency: "USD",
          },
          aggregateRating: tool.reviewCount > 0 ? {
            "@type": "AggregateRating",
            ratingValue: tool.rating,
            reviewCount: tool.reviewCount,
          } : undefined,
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
        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton toolId={tool.id} toolName={tool.name} />
          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer nofollow">
            <Button>
              Visit Website <ExternalLink size={14} />
            </Button>
          </a>
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

          {tool.reviews.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
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
            </section>
          )}
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
          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          </div>
        </aside>
      </div>

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
