import { getSiteUrl } from "@/lib/site";

/**
 * Pings the IndexNow endpoint so Bing (and other participating engines —
 * Yandex, Naver, Seznam) can crawl changed URLs immediately instead of
 * waiting for their next scheduled crawl. Google does not participate in
 * IndexNow as of 2026 — this has no effect on Google indexing, only
 * Bing-family search engines.
 *
 * Requires INDEXNOW_KEY to be set (see /[key]/route.ts for how the key is
 * served at the root, which Bing requires to verify you own the domain).
 * Silently no-ops if the key isn't configured, and never throws — a failed
 * ping should never break a publish/save action.
 */
export async function pingIndexNow(paths: string[]) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || paths.length === 0) return;

  const siteUrl = getSiteUrl();
  const host = new URL(siteUrl).host;

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${siteUrl}/${key}.txt`,
        urlList: paths.map((p) => `${siteUrl}${p}`),
      }),
    });
  } catch (err) {
    // Best-effort only — log and move on, never block the caller.
    console.error("IndexNow ping failed:", err);
  }
}
