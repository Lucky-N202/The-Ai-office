"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStoredConsent, setStoredConsent, CONSENT_REOPEN_EVENT } from "@/lib/consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);

    function handleReopen() {
      setVisible(true);
    }
    window.addEventListener(CONSENT_REOPEN_EVENT, handleReopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, handleReopen);
  }, []);

  if (!visible) return null;

  function choose(status: "granted" | "denied") {
    setStoredConsent(status);
    setVisible(false);
  }

  return (
    <div className="glass fixed inset-x-0 bottom-0 z-[100] mx-auto mb-4 max-w-3xl rounded-2xl border border-[var(--color-border)] p-5 sm:mb-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-muted)]">
          We use cookies for basic analytics and to show relevant ads. You can accept or decline —
          declining still lets you use the full site. See our{" "}
          <Link href="/privacy" className="text-[var(--color-primary)] hover:underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => choose("denied")}>
            Decline
          </Button>
          <Button size="sm" onClick={() => choose("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
