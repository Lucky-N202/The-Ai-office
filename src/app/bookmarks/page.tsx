"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getLocalBookmarks } from "@/lib/bookmarks";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import type { ToolSummary } from "@/types";

export default function BookmarksPage() {
  const [tools, setTools] = useState<ToolSummary[] | null>(null);

  useEffect(() => {
    async function load() {
      // Signed-in users: server bookmarks are the source of truth (they may span devices).
      const serverRes = await fetch("/api/bookmarks");
      if (serverRes.ok) {
        const serverBookmarks = (await serverRes.json()) as { tool: ToolSummary }[];
        if (serverBookmarks.length > 0) {
          setTools(serverBookmarks.map((b) => b.tool));
          return;
        }
      }
      // Anonymous (or signed-in with nothing synced yet): fall back to this device's localStorage.
      const ids = getLocalBookmarks();
      if (ids.length === 0) {
        setTools([]);
        return;
      }
      const res = await fetch(`/api/tools?ids=${ids.join(",")}&limit=${ids.length}`);
      setTools(res.ok ? await res.json() : []);
    }
    load();
    window.addEventListener("bookmarks:changed", load);
    return () => window.removeEventListener("bookmarks:changed", load);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your Saved Tools</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          {tools === null ? "Loading…" : `${tools.length} tool${tools.length === 1 ? "" : "s"} bookmarked on this device.`}
        </p>
      </div>

      {tools?.length === 0 && (
        <div className="card-surface flex flex-col items-center gap-4 p-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
            <Bookmark size={20} />
          </div>
          <div>
            <p className="font-medium">No bookmarks yet</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Tap the bookmark icon on any tool to save it here.</p>
          </div>
          <Link href="/browse/tools/all"><Button variant="outline">Browse Tools</Button></Link>
        </div>
      )}

      {tools && tools.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      )}
    </div>
  );
}
