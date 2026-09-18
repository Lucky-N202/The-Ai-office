import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import { MarkdownContent } from "@/components/markdown-content";
import { JsonLd } from "@/components/json-ld";
import { AdSlot } from "@/components/ad-slot";
import { Badge } from "@/components/ui/badge";
import { NewsletterForm } from "@/components/newsletter-form";

export const revalidate = 3600;

async function getArticle(slug: string) {
  return prisma.article.findUnique({ where: { slug, status: "PUBLISHED" } });
}

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
    return articles.map((a) => ({ slug: a.slug }));
  } catch (err) {
    console.error("generateStaticParams: failed to fetch articles, falling back to on-demand rendering", err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const siteUrl = getSiteUrl();
  const imageUrl = article.coverImage
    ? article.coverImage.startsWith("http") ? article.coverImage : `${siteUrl}${article.coverImage}`
    : undefined;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `${siteUrl}/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `${siteUrl}/blog/${article.slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const siteUrl = getSiteUrl();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          datePublished: article.publishedAt?.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          url: `${siteUrl}/blog/${article.slug}`,
          publisher: { "@type": "Organization", name: "The AI Office", url: siteUrl },
        }}
      />

      <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        <ArrowLeft size={14} /> Back to blog
      </Link>

      {article.coverImage && (
        <div className="relative mb-8 aspect-[1200/630] w-full overflow-hidden rounded-2xl">
          <Image src={article.coverImage} alt="" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 text-xs text-[var(--color-muted-2)]">
        <span>{article.publishedAt?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        {article.aiGenerated && <Badge>AI-assisted</Badge>}
      </div>

      <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>

      <MarkdownContent content={article.content} />

      <AdSlot slot="5454803935" />

      <div className="card-surface mt-12 p-6">
        <h2 className="mb-1 font-semibold">Enjoyed this?</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">Get next week&rsquo;s roundup straight to your inbox.</p>
        <NewsletterForm />
      </div>
    </div>
  );
}
