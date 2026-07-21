"use client";

import Image from "next/image";
import { Check, X } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { formatPrice, pricingLabel } from "@/lib/utils";
import type { ToolSummary } from "@/types";

const featureUniverse = (tools: ToolSummary[]) =>
  Array.from(new Set(tools.flatMap((t) => t.features))).slice(0, 10);

export function CompareTable({ tools }: { tools: ToolSummary[] }) {
  if (tools.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center justify-center gap-2 p-16 text-center text-[var(--color-muted)]">
        <p>Select up to 4 tools above to compare features, pricing, and ratings side by side.</p>
      </div>
    );
  }

  const features = featureUniverse(tools);

  return (
    <div className="card-surface overflow-x-auto p-0">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 w-48 bg-[var(--color-card)] p-4 text-left text-[var(--color-muted-2)]">Tool</th>
            {tools.map((tool) => (
              <th key={tool.id} className="p-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-[var(--color-border)] bg-white/5">
                    <Image src={tool.logoUrl} alt={tool.name} fill sizes="32px" className="object-cover" />
                  </div>
                  <span className="font-semibold">{tool.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr]:border-t [&_tr]:border-[var(--color-border)]">
          <tr>
            <td className="sticky left-0 bg-[var(--color-card)] p-4 text-[var(--color-muted)]">Rating</td>
            {tools.map((tool) => (
              <td key={tool.id} className="p-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={tool.rating} /> <span className="text-xs text-[var(--color-muted-2)]">{tool.rating.toFixed(1)}</span>
                </div>
              </td>
            ))}
          </tr>
          <tr>
            <td className="sticky left-0 bg-[var(--color-card)] p-4 text-[var(--color-muted)]">Pricing</td>
            {tools.map((tool) => (
              <td key={tool.id} className="p-4">
                <span className="font-medium text-[var(--color-primary)]">
                  {tool.startingPrice != null ? formatPrice(tool.startingPrice) : pricingLabel(tool.pricingModel)}
                </span>
                <span className="ml-1 text-xs text-[var(--color-muted-2)]">({pricingLabel(tool.pricingModel)})</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="sticky left-0 bg-[var(--color-card)] p-4 text-[var(--color-muted)]">Category</td>
            {tools.map((tool) => (
              <td key={tool.id} className="p-4">{tool.category.name}</td>
            ))}
          </tr>
          {features.map((feature) => (
            <tr key={feature}>
              <td className="sticky left-0 bg-[var(--color-card)] p-4 text-[var(--color-muted)]">{feature}</td>
              {tools.map((tool) => (
                <td key={tool.id} className="p-4">
                  {tool.features.includes(feature) ? (
                    <Check size={16} className="text-[var(--color-primary)]" />
                  ) : (
                    <X size={16} className="text-[var(--color-muted-2)]" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
