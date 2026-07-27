"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Renders a single visible AdSense ad unit. Deliberately only used on
 * low-stakes informational pages (/about, /contact, /privacy, /terms) — NOT
 * on the homepage, tool pages, category pages, compare, submit, or
 * /advertise. Those are the pages that actually earn money (Featured
 * placement, affiliate clicks) and the whole point of paying for Featured is
 * that a vendor's listing isn't sitting next to a programmatic ad for a
 * competitor.
 *
 * Assumes the base AdSense script is already loaded — see <AdSenseScript />
 * in the root layout, which loads site-wide (including on money pages, where
 * this component is just never rendered) since that's what AdSense's
 * verification crawler checks for.
 *
 * No-ops entirely (renders nothing) if NEXT_PUBLIC_ADSENSE_CLIENT_ID isn't set.
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
