import type { NextConfig } from "next";

// Security headers (plan §4.1): no request leaves the origin except a learner clicking an
// external judge/CEMC link; the app has no API routes, no cookies, no server state to protect,
// so the CSP only needs to stop framing and plugin content, not script origins.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets scripts/check-production-mode.mjs (batch 3, G-E2E production-mode proof) build a
  // production-env build into its own directory, so it never clobbers the preview `.next` the
  // e2e/visual/a11y suites' `next start` needs. Unset (the default) keeps the normal `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // No `output: 'export'` (plan §4.1): a regular Vercel build keeps next.config headers working.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
