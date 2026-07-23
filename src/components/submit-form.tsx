"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name") as string,
      tagline: form.get("tagline") as string,
      description: form.get("description") as string,
      websiteUrl: form.get("websiteUrl") as string,
      submitterEmail: form.get("submitterEmail") as string,
      company: form.get("company") as string, // honeypot, left empty by real users
    };

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setStatus("success");
    } else if (res.status === 429) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Too many submissions from you recently. Please try again later.");
      setStatus("error");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ? "Please check your inputs and try again." : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 size={28} className="text-[var(--color-primary)]" />
        <p className="font-medium">Thanks — we&rsquo;ve got it!</p>
        <p className="text-sm text-[var(--color-muted)]">Our team will review your submission and follow up by email if we have questions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Tool name"><Input name="name" required maxLength={80} /></Field>
      <Field label="One-line tagline"><Input name="tagline" required maxLength={140} placeholder="What does it do, in one sentence?" /></Field>
      <Field label="Description">
        <textarea name="description" required maxLength={2000} rows={4} className="focus-ring w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] p-3.5 text-sm" />
      </Field>
      <Field label="Website URL"><Input name="websiteUrl" type="url" required placeholder="https://" /></Field>
      <Field label="Your email"><Input name="submitterEmail" type="email" required placeholder="So we can follow up if needed" /></Field>

      {/* Honeypot — hidden from real users via CSS, bots that auto-fill every field will trip it. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? "Submitting…" : "Submit for Review"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}
