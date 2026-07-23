import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import { ToolCard } from "@/components/tool-card";
import { CategoryGrid } from "@/components/category-grid";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { HeroSearchButton } from "@/components/hero-search-button";

export const revalidate = 3600; // ISR: refresh hourly

async function getHomeData() {
  const [featured, categories, toolCount] = await Promise.all([
    prisma.tool.findMany({
      where: { featured: true },
      include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
      orderBy: { rating: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      include: { _count: { select: { tools: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.tool.count(),
  ]);
  return { featured, categories, toolCount };
}

export default async function HomePage() {
  const { featured, categories, toolCount } = await getHomeData();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "The AI Office",
          url: getSiteUrl(),
          potentialAction: {
            "@type": "SearchAction",
            target: `${getSiteUrl()}/browse/tools/all?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{ background: "radial-gradient(600px circle at 50% 0%, var(--color-primary-muted), transparent 70%)" }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/[0.03] px-3.5 py-1.5 text-xs text-[var(--color-muted)]">
            <Sparkles size={12} className="text-[var(--color-primary)]" />
            {toolCount}+ AI tools, curated and reviewed
          </div>
          <h1 className="animate-fade-up text-4xl font-bold tracking-tight sm:text-6xl">
            Find the right AI tool, <span className="text-[var(--color-primary)]">every time.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--color-muted)]">
            Browse, compare, and bookmark the best AI tools for writing, coding, design, video, and more — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <HeroSearchButton />
            <Link href="/browse/tools/all">
              <Button size="lg" variant="outline">
                Browse All Tools <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/browse/compare">
              <Button size="lg" variant="secondary">Compare Tools</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Explore by Category</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">10 categories covering every AI-powered workflow.</p>
          </div>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {/* Featured tools */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured Tools</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Top-rated tools our editors and community love.</p>
          </div>
          <Link href="/browse/tools/all" className="flex items-center gap-1 text-sm text-[var(--color-primary)]">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
