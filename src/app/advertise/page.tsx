import type { Metadata } from "next";
import { Check, Star, ShieldCheck, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Advertise Your AI Tool",
  description: "Get your AI tool featured in front of a curated, high-intent audience actively comparing tools.",
};

export const revalidate = 3600;

// Placeholder pricing — tune these to whatever the market bears once you have
// real signal from the first few vendor conversations. Nothing else in the
// codebase depends on these exact numbers.
const plans = [
  {
    name: "Verified",
    price: "$49",
    period: "one-time",
    description: "For legitimate tools that want the trust signal.",
    features: [
      "\"Verified\" badge on your listing",
      "Priority review of your submission",
      "Listed in the standard directory position",
    ],
  },
  {
    name: "Featured",
    price: "$99",
    period: "/month",
    description: "For tools that want visibility, not just a listing.",
    features: [
      "Everything in Verified",
      "Placement in the homepage \"Featured Tools\" section",
      "Boosted position within your category page",
      "Monthly click report for your listing",
    ],
    highlight: true,
  },
];

async function getStats() {
  const [toolCount, categoryCount] = await Promise.all([prisma.tool.count(), prisma.category.count()]);
  return { toolCount, categoryCount };
}

export default async function AdvertisePage() {
  const { toolCount, categoryCount } = await getStats();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Get Your Tool in Front of Real Buyers</h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
          The AI Office is a curated directory of {toolCount}+ tools across {categoryCount} categories, built
          for people actively comparing and choosing AI tools — not casual browsers.
        </p>
      </div>

      <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-surface p-5 text-center">
          <TrendingUp size={20} className="mx-auto mb-2 text-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-muted)]">High-intent traffic — visitors here are actively comparing tools, not idly scrolling.</p>
        </div>
        <div className="card-surface p-5 text-center">
          <ShieldCheck size={20} className="mx-auto mb-2 text-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-muted)]">Editorial trust — ratings and reviews stay independent of who advertises with us.</p>
        </div>
        <div className="card-surface p-5 text-center">
          <Star size={20} className="mx-auto mb-2 text-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-muted)]">Clear disclosure — every paid or affiliate placement is labeled, nothing hidden.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card-surface flex flex-col p-6 ${plan.highlight ? "border-[var(--color-primary)]" : ""}`}
          >
            {plan.highlight && (
              <span className="mb-3 w-fit rounded-full bg-[var(--color-primary-muted)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                Most popular
              </span>
            )}
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{plan.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-[var(--color-muted-2)]">{plan.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                  <Check size={15} className="mt-0.5 shrink-0 text-[var(--color-primary)]" /> {f}
                </li>
              ))}
            </ul>
            {/* Swap this mailto for a real Stripe Payment Link once you've created
                one in your Stripe dashboard — zero backend changes needed, just
                replace the href. E.g.:
                href="https://buy.stripe.com/your-payment-link-here" */}
            <a href={`mailto:hello@the-ai-office.com?subject=${encodeURIComponent(`${plan.name} placement — `)}`} className="mt-6">
              <Button className="w-full" variant={plan.highlight ? "primary" : "outline"}>
                Get {plan.name}
              </Button>
            </a>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-[var(--color-muted)]">
        Already listed and want to upgrade? Or have a custom request?{" "}
        <a href="mailto:hello@the-ai-office.com" className="text-[var(--color-primary)]">Email us</a> — happy to
        talk specifics.
      </p>
    </div>
  );
}
