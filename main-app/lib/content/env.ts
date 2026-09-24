// lib/content/env.ts — draft visibility environment (plan §4.1, brief A4/A6).
//
// Production (VERCEL_ENV === "production") renders only "accepted" modules and never mounts the
// fixture course. Everything else (local dev/build, Vercel previews) is "preview": it also
// renders "gated" and "reviewed" (with a Draft badge) and mounts the fixture course as stage
// "fx". Local builds count as preview unless ETCCC_ENV=production is set, for a production-mode
// test without an actual Vercel production deploy.

export type BuildEnv = "production" | "preview";

export function getBuildEnv(): BuildEnv {
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV) return "preview"; // any other Vercel env (preview, development)
  if (process.env.ETCCC_ENV === "production") return "production";
  return "preview"; // local dev/build, not on Vercel, ETCCC_ENV unset
}

export function isProduction(): boolean {
  return getBuildEnv() === "production";
}

/** Module statuses visible in this build (plan §4.1 draft visibility, brief A6). */
export function visibleStatuses(env: BuildEnv = getBuildEnv()): readonly string[] {
  return env === "production"
    ? (["accepted"] as const)
    : (["gated", "reviewed", "accepted"] as const);
}

/** Statuses that show a "Draft" badge (never in production, since only "accepted" ships there). */
export function isDraftStatus(status: string): boolean {
  return status === "gated" || status === "reviewed";
}
