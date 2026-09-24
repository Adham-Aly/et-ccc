// scripts/gates/print-build-env.ts — design-review.md A1-5: `lib/content/env.ts`'s
// `getBuildEnv()` relies on Vercel exposing `VERCEL_ENV` at *build* time (it reads
// `process.env.VERCEL_ENV`/`ETCCC_ENV`, not a request-time value) — if that assumption is ever
// wrong (Vercel changes what it injects, or a project setting is misconfigured), a production
// deploy could silently render draft content and the fixture course. Printed first in
// `prebuild.mjs`, so the very first Vercel build log line proves which env draft-visibility
// resolved to, instead of that only being discoverable by clicking through the live site.
import { getBuildEnv } from "../../lib/content/env";

const env = getBuildEnv();
console.log(
  `prebuild: resolved build env = "${env}" (VERCEL_ENV=${JSON.stringify(process.env.VERCEL_ENV ?? null)}, ETCCC_ENV=${JSON.stringify(process.env.ETCCC_ENV ?? null)}) — ${
    env === "production"
      ? "only accepted modules render; the fixture course does not mount"
      : "gated/reviewed modules render with a Draft badge; the fixture course mounts as stage fx"
  }`,
);
