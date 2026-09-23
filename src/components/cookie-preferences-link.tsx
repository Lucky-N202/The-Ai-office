"use client";

import { CONSENT_REOPEN_EVENT } from "@/lib/consent";

export function CookiePreferencesLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_REOPEN_EVENT))}
      className="hover:text-[var(--color-foreground)]"
    >
      Cookie preferences
    </button>
  );
}
