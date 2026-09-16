"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — the email
      // is already visible as plain text right next to this button, so the
      // person can still just select and copy it manually.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-[var(--color-primary)] hover:underline"
    >
      {email}
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}
