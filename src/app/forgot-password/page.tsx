"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
      setStatus("idle");
      return;
    }

    // The API always returns the same generic response on success,
    // regardless of whether the email exists — that's intentional (see
    // the route's comments), so the UI just reflects that same message.
    setStatus("done");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Reset your password</h1>

      {status === "done" ? (
        <p className="text-sm text-[var(--color-muted)]">
          If an account exists for <span className="text-[var(--color-foreground)]">{email}</span>, a reset link
          is on its way. Check your inbox — it expires in 1 hour.
        </p>
      ) : (
        <>
          <p className="mb-8 text-sm text-[var(--color-muted)]">
            Enter the email on your account and we&apos;ll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 text-left">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </>
      )}

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
