import { getSiteUrl } from "@/lib/site";

/**
 * Per-page `alternates` for static routes.
 *
 * Why this exists: Next.js metadata merges shallowly per top-level key. The
 * root layout used to set `alternates.canonical` to the homepage URL, which
 * every page without its own `alternates` silently inherited — so /about,
 * /blog, /browse/tools/all, /browse/compare, /advertise etc. all declared the
 * HOMEPAGE as their canonical, telling Google to drop them from the index.
 *
 * Because a child's `alternates` replaces the parent's wholesale, the RSS
 * autodiscovery link is repeated here so it isn't lost on these pages.
 */
export function pageAlternates(path: string) {
  const siteUrl = getSiteUrl();
  return {
    canonical: `${siteUrl}${path === "/" ? "" : path}`,
    types: { "application/rss+xml": `${siteUrl}/rss.xml` },
  };
}
