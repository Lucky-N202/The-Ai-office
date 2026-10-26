"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const field =
  "w-full rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]";

export function ClaimForm({ tools }: { tools: { id: string; name: string }[] }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Something went wrong.");
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="card-surface p-6 text-center">
        <h3 className="font-semibold">Request received</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          We&rsquo;ll confirm you&rsquo;re connected to the tool, then email you a secure payment link — usually within
          one business day. Nothing is charged until you use that link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-surface space-y-4 p-6">
      {/* Honeypot — hidden from people, bots fill it in. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label htmlFor="toolId" className="mb-1 block text-sm text-[var(--color-muted)]">Your tool</label>
        <select id="toolId" name="toolId" required defaultValue="" className={field}>
          <option value="" disabled>Select your listing…</option>
          {tools.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <p className="mt-1 text-xs text-[var(--color-muted-2)]">
          Not listed yet? <a href="/submit" className="text-[var(--color-primary)]">Submit your tool</a> first.
        </p>
      </div>
      <div>
        <label htmlFor="plan" className="mb-1 block text-sm text-[var(--color-muted)]">Plan</label>
        <select id="plan" name="plan" defaultValue="featured" className={field}>
          <option value="featured">Featured — $99/month</option>
          <option value="verified">Verified — $49 one-time</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-[var(--color-muted)]">Your name</label>
          <input id="name" name="name" required maxLength={80} className={field} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-[var(--color-muted)]">Work email</label>
          <input id="email" name="email" type="email" required maxLength={120} placeholder="you@yourtool.com" className={field} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending…" : "Request my payment link"}
      </Button>
      <p className="text-xs text-[var(--color-muted-2)]">
        Use an email on your tool&rsquo;s own domain for the fastest approval. No payment is taken on this form.
      </p>
    </form>
  );
}
