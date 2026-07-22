import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const siteUrl = getSiteUrl();
  const categories = await prisma.category.findMany({
    include: { tools: { orderBy: { rating: "desc" } } },
    orderBy: { name: "asc" },
  });

  const sections = categories
    .map((category) => {
      const links = category.tools
        .map((tool) => `- [${tool.name}](${siteUrl}/browse/tools/${tool.slug}): ${tool.tagline}`)
        .join("\n");
      return `## ${category.name}\n\n${category.description}\n\n${links}`;
    })
    .join("\n\n");

  const body = `# The AI Office

> A curated directory of AI tools for writing, coding, design, video, audio, and more — with real pricing, features, and pros/cons for each listing. No sponsored ranking.

## Key Pages

- [Browse all tools](${siteUrl}/browse/tools/all): Full directory, filterable by category and pricing
- [Compare tools](${siteUrl}/browse/compare): Side-by-side feature and pricing comparison
- [Submit a tool](${siteUrl}/submit): Suggest a tool for the directory

${sections}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
