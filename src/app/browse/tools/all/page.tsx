import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ToolBrowser } from "@/components/tool-browser";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Browse All AI Tools",
  description: "Filter and search every AI tool in our directory by category, pricing, and rating.",
};

export default async function AllToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [tools, categories] = await Promise.all([
    prisma.tool.findMany({
      include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
      orderBy: { rating: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse All AI Tools</h1>
        <p className="mt-1 text-[var(--color-muted)]">{tools.length} tools across {categories.length} categories.</p>
      </div>
      <ToolBrowser tools={tools} categories={categories} initialQuery={params.q} initialCategory={params.category} />
    </div>
  );
}
