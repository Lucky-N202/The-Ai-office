"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";
import { formatPrice, pricingLabel, formatNumber } from "@/lib/utils";
import type { ToolSummary } from "@/types";

export function ToolCard({ tool, index = 0 }: { tool: ToolSummary; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="card-surface group relative flex h-full flex-col p-5"
    >
      <Link href={`/browse/tools/${tool.slug}`} className="flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white/5">
              <Image src={tool.logoUrl} alt={`${tool.name} logo`} fill sizes="44px" className="object-cover" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{tool.name}</h3>
              <span className="text-xs text-[var(--color-muted-2)]">{tool.category.name}</span>
            </div>
          </div>
          <BookmarkButton toolId={tool.id} toolName={tool.name} />
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-[var(--color-muted)]">{tool.tagline}</p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <StarRating rating={tool.rating} />
            <span className="text-xs text-[var(--color-muted-2)]">({formatNumber(tool.reviewCount)})</span>
          </div>
          <span className="text-xs font-medium text-[var(--color-primary)]">
            {tool.startingPrice != null ? formatPrice(tool.startingPrice) : pricingLabel(tool.pricingModel)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
