/**
 * Resolves the canonical base URL for the site, used for canonical tags,
 * Open Graph/Twitter URLs, JSON-LD, and sitemap/robots generation.
 *
 * Priority order:
 * 1. NEXT_PUBLIC_SITE_URL — explicit override. Always set this once you have
 *    a real custom domain, so canonical URLs point at it instead of whatever
 *    Vercel deployment URL happens to be live.
 * 2. VERCEL_PROJECT_PRODUCTION_URL — Vercel automatically provides this in
 *    production deployments; it's the project's assigned production domain
 *    (e.g. "the-ai-office-chi.vercel.app"), without needing to set anything
 *    manually. This is what saves you from the exact bug that happened here:
 *    forgetting to set NEXT_PUBLIC_SITE_URL meant every canonical/OG tag
 *    silently fell back to a hardcoded placeholder domain that isn't this
 *    site at all.
 * 3. VERCEL_URL — set on preview/branch deployments too, so preview builds
 *    get correct self-referential URLs rather than pointing at production.
 * 4. localhost:3000 — local dev fallback.
 *
 * Note: this file is server-only (no "use client"). It reads non-NEXT_PUBLIC_
 * env vars (VERCEL_URL, VERCEL_PROJECT_PRODUCTION_URL), which are only
 * available server-side — that's fine here since every current caller
 * (layout metadata, sitemap.ts, robots.ts, per-page generateMetadata) runs
 * on the server.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
