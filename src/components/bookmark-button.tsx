"use client";

import { Bookmark } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getLocalBookmarks, toggleLocalBookmark } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function subscribe(callback: () => void) {
  window.addEventListener("bookmarks:changed", callback);
  return () => window.removeEventListener("bookmarks:changed", callback);
}

export function BookmarkButton({ toolId, toolName, className }: { toolId: string; toolName: string; className?: string }) {
  const bookmarked = useSyncExternalStore(
    subscribe,
    () => getLocalBookmarks().includes(toolId),
    () => false // server snapshot: nothing is bookmarked pre-hydration
  );

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleLocalBookmark(toolId);
    toast(next.includes(toolId) ? `Saved ${toolName}` : `Removed ${toolName}`);

    // Best-effort sync for logged-in users; fails silently if unauthenticated.
    try {
      await fetch("/api/bookmarks", {
        method: next.includes(toolId) ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      });
    } catch {
      /* offline or logged out — localStorage remains source of truth */
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      className={cn(
        "focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] transition-all hover:border-[var(--color-border-hover)]",
        bookmarked && "border-[var(--color-primary)] bg-[var(--color-primary-muted)]",
        className
      )}
    >
      <Bookmark size={15} className={cn(bookmarked ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-muted)]")} />
    </button>
  );
}
