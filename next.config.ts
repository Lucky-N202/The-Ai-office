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

export default nextConfig;
