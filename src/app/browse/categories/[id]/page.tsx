import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import { ToolCard } from "@/components/tool-card";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { formatPrice, pricingLabel } from "@/lib/utils";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 3600;

async function getCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      tools: {
        include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
        // Featured first (this is the actual mechanism behind the paid
        // "Featured" plan's promised category-page boost — see /advertise),
        // then by rating within each group.
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
      },
    },
  });
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { id: true } });
    return categories.map((c) => ({ id: c.id }));
  } catch (err) {
    // If the DB is briefly unreachable at build time (e.g. a Neon cold-start
    // or connection-pool blip), don't fail the entire deployment over it —
    // return no pre-built paths and let each page render on-demand instead,
    // where it's then cached per the `revalidate` setting above like normal.
    console.error("generateStaticParams: failed to fetch categories, falling back to on-demand rendering", err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  let category;
  try {
    category = await prisma.category.findUnique({ where: { id } });
  } catch (err) {
    console.error(`generateMetadata: failed to fetch category "${id}", using fallback metadata`, err);
    return { title: "Category — The AI Office" };
  }
  if (!category) return {};
  const siteUrl = getSiteUrl();
  return {
    title: `Best ${category.name} AI Tools in ${new Date().getFullYear()} (Ranked & Compared)`,
    description: `${category.description} Ranked by rating, with pricing, pros and best-for notes for each pick.`.slice(0, 160),
    keywords: [category.name, "AI tools", `best ${category.name.toLowerCase()} AI tools`],
    alternates: { canonical: `${siteUrl}/browse/categories/${category.id}` },
    openGraph: {
      title: `Best ${category.name} AI Tools`,
      description: category.description,
      url: `${siteUrl}/browse/categories/${category.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Best ${category.name} AI Tools`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();

  const Icon = (Icons[category.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Sparkles;
  const siteUrl = getSiteUrl();
  const updated = category.tools.reduce((d, t) => (t.updatedAt > d ? t.updatedAt : d), category.updatedAt);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Best ${category.name} AI Tools`,
          description: category.description,
          dateModified: updated.toISOString(),
          url: `${siteUrl}/browse/categories/${category.id}`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: category.tools.map((tool, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${siteUrl}/browse/tools/${tool.slug}`,
              name: tool.name,
            })),
          },
        }}
      />
      <Link href="/#categories" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        <ArrowLeft size={14} /> All categories
      </Link>

      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${category.color}1a`, color: category.color }}>
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{category.name}</h1>
          <p className="mt-1 text-[var(--color-muted)]">{category.description}</p>
        </div>
      </div>

      {category.tools.length > 0 && (
        <section className="mb-14">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold">Top {Math.min(5, category.tools.length)} picks</h2>
            <p className="text-xs text-[var(--color-muted-2)]">
              Updated {updated.toLocaleDateString("en-US", { month: "long", year: "numeric" })} · Ranked by rating;
              sponsored placements are labeled.
            </p>
          </div>
          <ol className="space-y-4">
            {category.tools.slice(0, 5).map((tool, i) => (
              <li key={tool.id} className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                <span className="text-2xl font-bold text-[var(--color-primary)] sm:w-8">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/browse/tools/${tool.slug}`} className="text-lg font-semibold hover:text-[var(--color-primary)]">
                      {tool.name}
                    </Link>
                    {tool.featured && <Badge>Sponsored</Badge>}
                    {tool.verified && <Badge className="border-[var(--color-primary)] text-[var(--color-primary)]">Verified</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{tool.tagline}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted-2)]">
                    <span className="flex items-center gap-1.5">
                      <StarRating rating={tool.rating} size={12} /> {tool.rating.toFixed(1)}
                    </span>
                    <span>{tool.startingPrice != null ? formatPrice(tool.startingPrice) : pricingLabel(tool.pricingModel)}</span>
                  </div>
                  {tool.useCases.length > 0 && (
                    <p className="mt-3 text-sm text-[var(--color-muted)]">
                      <span className="font-medium text-[var(--color-foreground)]">Best for: </span>
                      {tool.useCases.slice(0, 2).join("; ")}
                    </p>
                  )}
                  {tool.pros[0] && (
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      <span className="font-medium text-[var(--color-foreground)]">Why it stands out: </span>
                      {tool.pros[0]}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <Link href={`/browse/tools/${tool.slug}`} className="text-sm text-[var(--color-primary)]">Details →</Link>
                  <a href={`/out/${tool.id}`} target="_blank" rel="noopener noreferrer nofollow sponsored" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                    Visit site ↗
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {category.tools.length > 0 && <h2 className="mb-5 text-xl font-semibold">All {category.name} tools</h2>}

      {category.tools.length === 0 ? (
        <p className="text-[var(--color-muted)]">No tools in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {category.tools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      )}
    </div>
  );
}
