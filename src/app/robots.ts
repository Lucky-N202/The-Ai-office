import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/bookmarks", "/login"] },
      // Explicitly allow known AI crawlers/agents rather than relying on the
      // wildcard rule above — some crawlers specifically look for a named
      // entry rather than trusting "*", and being explicit here is what AI
      // discovery tools (e.g. Vercel's agent-readability checks) look for.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
