import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import { ToolCard } from "@/components/tool-card";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 3600;

async function getCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      tools: {
        include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
        orderBy: { rating: "desc" },
      },
    },
  });
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { id: true } });
  return categories.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return {};
  const siteUrl = getSiteUrl();
  return {
    title: `Best ${category.name} AI Tools`,
    description: category.description,
    alternates: { canonical: `${siteUrl}/browse/categories/${category.id}` },
    openGraph: { title: `Best ${category.name} AI Tools`, description: category.description },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();

  const Icon = (Icons[category.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Sparkles;
  const siteUrl = getSiteUrl();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Best ${category.name} AI Tools`,
          description: category.description,
          url: `${siteUrl}/browse/categories/${category.id}`,
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
