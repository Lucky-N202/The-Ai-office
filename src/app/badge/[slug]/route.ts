import { prisma } from "@/lib/prisma";

export const revalidate = 86400;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Embeddable "Listed on The AI Office" badge for vendors. The embed snippet on
 * each tool page links the badge back to that tool's listing, so every vendor
 * who adds it gives the site a backlink (and sends their visitors here).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({
    where: { slug },
    select: { name: true, rating: true, reviewCount: true },
  });
  if (!tool) return new Response("Not found", { status: 404 });

  const name = tool.name.length > 24 ? `${tool.name.slice(0, 23)}…` : tool.name;
  const rating = tool.reviewCount > 0 ? `★ ${tool.rating.toFixed(1)} · ` : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="56" viewBox="0 0 220 56" role="img" aria-label="${esc(tool.name)} is listed on The AI Office">
  <rect width="220" height="56" rx="14" fill="#111113"/>
  <rect x="0.5" y="0.5" width="219" height="55" rx="13.5" fill="none" stroke="#7C3AED" stroke-opacity="0.6"/>
  <circle cx="28" cy="28" r="12" fill="#7C3AED"/>
  <path d="M22.5 28.5l3.8 3.8 7.2-7.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="50" y="23" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="10.5" fill="#A1A1AA">Listed on The AI Office</text>
  <text x="50" y="40" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="13" font-weight="600" fill="#FAFAFA">${esc(rating + name)}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
