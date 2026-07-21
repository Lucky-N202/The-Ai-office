"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CompareTable } from "@/components/compare-table";
import { cn } from "@/lib/utils";
import type { ToolSummary } from "@/types";

const MAX_COMPARE = 4;

export function CompareClient({ tools }: { tools: ToolSummary[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  const selectedTools = tools.filter((t) => selected.includes(t.id));

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tools.map((tool) => {
          const active = selected.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => toggle(tool.id)}
              disabled={!active && selected.length >= MAX_COMPARE}
              className={cn(
                "focus-ring flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                active && "border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
              )}
            >
              {tool.name}
              {active && <X size={12} />}
            </button>
          );
        })}
      </div>

      <CompareTable tools={selectedTools} />
    </div>
  );
}
