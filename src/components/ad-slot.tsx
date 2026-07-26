"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Renders a single AdSense ad unit. Deliberately only used on low-stakes
 * informational pages (/about, /contact, /privacy, /terms) — NOT on the
 * homepage, tool pages, category pages, compare, submit, or /advertise.
 * Those are the pages that actually earn money (Featured placement,
 * affiliate clicks) and the whole point of paying for Featured is that a
 * vendor's listing isn't sitting next to a programmatic ad for a competitor.
 *
 * No-ops entirely (renders nothing) if NEXT_PUBLIC_ADSENSE_CLIENT_ID isn't
 * set — safe to leave this component in the tree even before you've set up
 * an AdSense account.
 */
export function AdSlot({ slot }: { slot: string }) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not finished loading yet, or blocked by the user's browser —
      // either way, failing quietly here is correct; this is decorative
      // revenue, not core functionality.
    }
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="my-8">
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
