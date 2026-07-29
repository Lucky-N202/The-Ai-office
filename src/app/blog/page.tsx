import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewsletterForm } from "@/components/newsletter-form";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Weekly roundups of what's new and changed across the AI tools landscape.",
  openGraph: {
    title: "Blog — The AI Office",
    description: "Weekly roundups of what's new and changed across the AI tools landscape.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — The AI Office",
    description: "Weekly roundups of what's new and changed across the AI tools landscape.",
  },
};

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-3 text-[var(--color-muted)]">
          What&rsquo;s new and what changed across the AI tools we track — published weekly.
        </p>
      </div>

      <div className="card-surface mb-12 p-6">
        <h2 className="mb-1 font-semibold">Get it in your inbox</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">One email a week. Unsubscribe anytime.</p>
        <NewsletterForm />
      </div>

      {articles.length === 0 ? (
        <p className="text-[var(--color-muted)]">No articles published yet — check back soon.</p>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`} className="card-surface card-interactive block p-6">
              <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-muted-2)]">
                <span>{article.publishedAt?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                {article.aiGenerated && <Badge>AI-assisted</Badge>}
              </div>
              <h2 className="mb-2 text-xl font-semibold">{article.title}</h2>
              <p className="text-sm text-[var(--color-muted)]">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
