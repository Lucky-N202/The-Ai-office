import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "About",
  description: "The AI Office is a curated directory for discovering, comparing, and bookmarking the best AI tools.",
};

export default async function AboutPage() {
  const [toolCount, categoryCount] = await Promise.all([prisma.tool.count(), prisma.category.count()]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">About The AI Office</h1>
      <div className="space-y-5 leading-relaxed text-[var(--color-muted)]">
        <p>
          The AI tools landscape moves fast — new models, editors, and agents launch every week, and it&rsquo;s
          become genuinely hard to tell which ones are worth your time. The AI Office exists to make that
          easier: a single, curated place to browse, compare, and bookmark the tools people actually use.
        </p>
        <p>
          We currently track {toolCount} tools across {categoryCount} categories, from writing and coding
          assistants to image, video, and audio generators. Every listing includes real pricing, features,
          and pros and cons.
        </p>
        <p>
          Tools are added and reviewed by our editorial team, with community ratings factored in over time.
          If you&rsquo;d like to see a tool added, use the{" "}
          <a href="/submit" className="text-[var(--color-primary)]">submission form</a>.
        </p>
        <p>
          <strong className="text-[var(--color-foreground)]">How we make money:</strong> some listings marked
          &ldquo;Featured&rdquo; are paid placements, and some outbound links are affiliate links that may earn
          us a commission at no extra cost to you — these are always disclosed on the tool&rsquo;s page. Paid
          placement never affects a tool&rsquo;s rating, reviews, or the accuracy of its pros and cons — those
          stay editorially independent regardless of whether a tool advertises with us.
        </p>
        <p>
          Interested in featuring your tool?{" "}
          <a href="/advertise" className="text-[var(--color-primary)]">See advertising options</a>.
        </p>
      </div>
    </div>
  );
}
