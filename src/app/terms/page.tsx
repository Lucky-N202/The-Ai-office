import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mb-8 text-sm text-[var(--color-muted-2)]">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="space-y-8 leading-relaxed text-[var(--color-muted)]">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">Use of the directory</h2>
          <p>
            The AI Office provides information about third-party AI tools for informational purposes. We are not
            affiliated with the tools listed unless explicitly stated, and pricing, features, and availability may
            change without notice on the vendor&rsquo;s side. Always confirm current details on the tool&rsquo;s own website
            before making a purchasing decision.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">Accounts</h2>
          <p>
            You may sign in via GitHub to bookmark tools and leave reviews. You&rsquo;re responsible for the accuracy of
            reviews you submit and agree not to post false, defamatory, or spam content.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">Submissions</h2>
          <p>
            Tool submissions are reviewed before being published. We reserve the right to decline, edit, or remove
            any listing at our discretion.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">Disclaimer</h2>
          <p>
            The directory is provided &ldquo;as is&rdquo; without warranty of any kind. We make reasonable efforts to keep
            listings accurate but cannot guarantee completeness or accuracy at all times.
          </p>
        </section>
        <p className="text-xs text-[var(--color-muted-2)]">
          This is a template terms document provided for launch purposes — have it reviewed by counsel before
          relying on it for a live product.
        </p>
      </div>
    </div>
  );
}
