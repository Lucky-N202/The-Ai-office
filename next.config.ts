import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal .next/standalone build with only the files needed to run
  // in production (traced dependencies + a small server.js) — this is what makes
  // the Docker production image small instead of shipping the whole node_modules tree.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      // Serves the LobeHub AI-brand icon set used for tool logos — see
      // prisma/upgrade-tool-logos.ts
      { protocol: "https", hostname: "unpkg.com" },
      // Doc Translator's own hosted logo
      { protocol: "https", hostname: "www.doctranslator.io" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  reactCompiler: true,
  async headers() {
    const csp = [
      "default-src 'self'",
      // 'unsafe-inline'/'unsafe-eval' are required by Next.js's own dev/runtime scripts
      // and Framer Motion; tighten with nonces if you need a stricter policy later.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
          // Legacy fallback for the CSP frame-ancestors directive above, for
          // older browsers/tools that check this header specifically instead
          // of (or in addition to) parsing CSP. Set to DENY rather than
          // SAMEORIGIN to match frame-ancestors 'none' — nothing on this site
          // needs to be framed, including by itself.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "the-ai-office",

  project: "javascript-nextjs-uh",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
