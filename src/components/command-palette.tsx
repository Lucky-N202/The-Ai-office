"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createToolFuse } from "@/lib/fuse";
import type { ToolSummary } from "@/types";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tools, setTools] = useState<ToolSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (e.key === "/" && (e.target as HTMLElement)?.tagName === "INPUT") return;
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const openHandler = () => setOpen(true);
    document.addEventListener("keydown", down);
    window.addEventListener("command-palette:open", openHandler);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("command-palette:open", openHandler);
    };
  }, []);

  useEffect(() => {
    if (open && !loaded) {
      fetch("/api/tools?limit=200")
        .then((res) => res.json())
        .then((data: ToolSummary[]) => {
          setTools(data);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }
  }, [open, loaded]);

  const fuse = useMemo(() => createToolFuse(tools), [tools]);
  const results = useMemo(() => {
    if (!query.trim()) return tools.slice(0, 8);
    return fuse.search(query, { limit: 8 }).map((r) => r.item);
  }, [query, fuse, tools]);

  function go(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/browse/tools/${slug}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-xl overflow-hidden rounded-[24px] shadow-2xl"
          >
            <Command shouldFilter={false} className="flex flex-col">
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3.5">
                <Search size={16} className="text-[var(--color-muted-2)]" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search AI tools by name, category, or use case…"
                  className="focus-ring w-full bg-transparent text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-2)]"
                />
                <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted-2)]">ESC</kbd>
              </div>
              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="flex flex-col items-center gap-2 py-10 text-sm text-[var(--color-muted)]">
                  <Sparkles size={18} className="text-[var(--color-muted-2)]" />
                  {loaded ? "No tools matched your search." : "Loading tools…"}
                </Command.Empty>
                {results.map((tool) => (
                  <Command.Item
                    key={tool.id}
                    value={tool.id}
                    onSelect={() => go(tool.slug)}
                    className="flex cursor-pointer items-center justify-between rounded-[14px] px-3 py-2.5 text-sm data-[selected=true]:bg-white/[0.06]"
                  >
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-xs text-[var(--color-muted-2)]">{tool.category.name}</p>
                    </div>
                    <ArrowRight size={14} className="text-[var(--color-muted-2)]" />
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
