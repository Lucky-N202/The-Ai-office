/**
 * Loads the base AdSense script site-wide — including on the homepage, tool
 * pages, and /advertise. This is deliberate and doesn't contradict the
 * "no ads on money pages" decision: this script alone doesn't render any
 * visible ad — only <AdSlot> (used on /about, /contact, /privacy, /terms)
 * actually renders an <ins class="adsbygoogle"> unit.
 *
 * Deliberately a plain native <script> tag, NOT next/script. next/script —
 * even with strategy="beforeInteractive" — doesn't render a literal <script>
 * tag into the server-sent HTML in the App Router; it inserts a <link
 * rel="preload"> plus a JS array, then constructs the real script element
 * client-side at runtime. That's fine for real browsers, but if AdSense's
 * verification crawler does anything less than full JS execution, it never
 * sees an actual <script src="pagead2.googlesyndication.com..."> tag to
 * find. A plain native <script> element, by contrast, is just normal HTML —
 * React's server rendering outputs it literally in the response, exactly
 * like any other DOM element, no client-side construction required.
 *
 * Renders nothing if NEXT_PUBLIC_ADSENSE_CLIENT_ID isn't set.
 */
export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!clientId) return null;

  return (
    <>
      {/*
       * Google Consent Mode: sets ad/analytics cookie consent to "denied"
       * by DEFAULT, before the adsbygoogle script below ever loads — this
       * is what actually stops Google from setting tracking cookies for a
       * new visitor, not just whether the banner below is visible. If a
       * choice was already stored from a previous visit, it's applied
       * immediately too, so returning visitors who accepted aren't
       * defaulted back to denied for a moment.
       *
       * Plain inline script (not next/script) so it runs synchronously,
       * before the async adsbygoogle.js request fires.
       */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
});
try {
  var stored = localStorage.getItem('cookie-consent');
  if (stored === 'granted') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
} catch (e) {}
`,
        }}
      />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
      />
    </>
  );
}
