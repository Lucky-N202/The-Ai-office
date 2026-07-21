"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@prisma/client";

export function CategoryGrid({ categories }: { categories: (Category & { _count?: { tools: number } })[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category, i) => {
        const Icon = (Icons[category.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Sparkles;
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
          >
            <Link
              href={`/browse/categories/${category.id}`}
              className="card-surface flex h-full flex-col items-start gap-3 p-5"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${category.color}1a`, color: category.color }}
              >
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{category.name}</h3>
                {category._count && (
                  <p className="mt-0.5 text-xs text-[var(--color-muted-2)]">{category._count.tools} tools</p>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
