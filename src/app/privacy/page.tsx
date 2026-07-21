import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-8 text-sm text-[var(--color-muted-2)]">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="space-y-8 leading-relaxed text-[var(--color-muted)]">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">Information we collect</h2>
          <p>
            When you sign in with GitHub, we store your name, email address, and avatar as provided by GitHub&rsquo;s
            OAuth flow. When you bookmark tools, we store the association between your account and the tools you&rsquo;ve
            saved. If you&rsquo;re not signed in, bookmarks are stored only in your browser&rsquo;s local storage and never
            leave your device.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">How we use it</h2>
          <p>
            Account data is used solely to provide the service: syncing your bookmarks across devices, attributing
            reviews you write, and gating access to the admin dashboard for authorized team members. We do not
            sell personal data to third parties, and we do not use your data for advertising.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">Cookies</h2>
          <p>
            We use a session cookie to keep you signed in. We don&rsquo;t use third-party advertising or tracking
            cookies.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">Your rights</h2>
          <p>
            You can request deletion of your account and associated data at any time by contacting us at{" "}
            <a href="mailto:hello@theaioffice.app" className="text-[var(--color-primary)]">hello@theaioffice.app</a>.
          </p>
        </section>
        <p className="text-xs text-[var(--color-muted-2)]">
          This is a template policy provided for launch purposes — have it reviewed by counsel before relying on
          it for a live product handling real user data, particularly if you operate in the EU/UK (GDPR) or
          California (CCPA).
        </p>
      </div>
    </div>
  );
}
