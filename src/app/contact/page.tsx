import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with The AI Office team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Contact Us</h1>
      <div className="space-y-5 leading-relaxed text-[var(--color-muted)]">
        <p>
          Questions, corrections, partnership inquiries, or found a bug? We&rsquo;d like to hear from you.
        </p>
        <div className="card-surface flex items-center gap-3 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-sm text-[var(--color-muted-2)]">Email us at</p>
            <a href="mailto:hello@theaioffice.app" className="font-medium text-[var(--color-foreground)]">hello@theaioffice.app</a>
          </div>
        </div>
        <p>
          Want a specific tool added to the directory? Use the{" "}
          <a href="/submit" className="text-[var(--color-primary)]">submission form</a> instead — it goes
          straight to our review queue.
        </p>
      </div>
    </div>
  );
}
