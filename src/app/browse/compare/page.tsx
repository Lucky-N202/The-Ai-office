import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CompareClient } from "@/components/compare-client";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Compare AI Tools Side by Side",
  description: "Compare features, pricing, and ratings across AI tools to find the best fit for your workflow.",
};

export default async function ComparePage() {
  const tools = await prisma.tool.findMany({
    include: { category: { select: { id: true, name: true, slug: true, color: true, icon: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Compare AI Tools</h1>
        <p className="mt-1 text-[var(--color-muted)]">Pick up to 4 tools to compare features, pricing, and ratings side by side.</p>
      </div>
      <CompareClient tools={tools} />
    </div>
  );
}
