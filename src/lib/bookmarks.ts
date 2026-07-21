"use client";

const KEY = "ai-office:bookmarks";

export function getLocalBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleLocalBookmark(toolId: string): string[] {
  const current = getLocalBookmarks();
  const next = current.includes(toolId)
    ? current.filter((id) => id !== toolId)
    : [...current, toolId];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bookmarks:changed", { detail: next }));
  return next;
}

export function isBookmarked(toolId: string): boolean {
  return getLocalBookmarks().includes(toolId);
}

/** Sync any locally-stored bookmarks to the server once a user logs in. */
export async function syncLocalBookmarksToServer() {
  const local = getLocalBookmarks();
  if (local.length === 0) return;
  await fetch("/api/bookmarks/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolIds: local }),
  });
  window.localStorage.removeItem(KEY);
}
