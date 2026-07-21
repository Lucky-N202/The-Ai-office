"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tool-card";
import { cn } from "@/lib/utils";
import { createToolFuse } from "@/lib/fuse";
import type { Category } from "@prisma/client";
import type { ToolSummary } from "@/types";

const pricingOptions = ["ALL", "FREE", "FREEMIUM", "PAID", "ENTERPRISE", "OPEN_SOURCE"] as const;

export function ToolBrowser({
  tools,
  categories,
  initialQuery,
  initialCategory,
}: {
  tools: ToolSummary[];
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [categoryId, setCategoryId] = useState<string>(initialCategory ?? "ALL");
  const [pricing, setPricing] = useState<(typeof pricingOptions)[number]>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const fuse = useMemo(() => createToolFuse(tools), [tools]);

  const filtered = useMemo(() => {
    let result = query.trim() ? fuse.search(query).map((r) => r.item) : tools;
    if (categoryId !== "ALL") result = result.filter((t) => t.categoryId === categoryId);
    if (pricing !== "ALL") result = result.filter((t) => t.pricingModel === pricing);
    return result;
  }, [query, categoryId, pricing, fuse, tools]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools…" className="pl-10" />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)} className="sm:w-auto">
          <SlidersHorizontal size={14} /> Filters
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryId("ALL")}
            className={cn("rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs", categoryId === "ALL" && "border-[var(--color-primary)] text-[var(--color-primary)]")}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={cn("rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs", categoryId === c.id && "border-[var(--color-primary)] text-[var(--color-primary)]")}
            >
              {c.name}
            </button>
          ))}
          <span className="mx-1 self-center text-[var(--color-border-hover)]">|</span>
          {pricingOptions.map((p) => (
            <button
              key={p}
              onClick={() => setPricing(p)}
              className={cn("rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs capitalize", pricing === p && "border-[var(--color-primary)] text-[var(--color-primary)]")}
            >
              {p.toLowerCase().replace("_", " ")}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[var(--color-muted)]">No tools matched your filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      )}
    </div>
  );
}
