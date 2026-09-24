// tests/support/playwright-shared.ts — pieces every Playwright config in this app needs, so
// `playwright.config.ts` (tests/e2e), `playwright.visual.config.ts` (tests/visual) and
// `playwright.a11y.config.ts` (tests/a11y) share one definition instead of three drifting
// copies (plan §7 G-E2E/G-VISUAL/G-PAGE; brief "Servers").
//
// Dual-mode base URL (batch 3 item 1): with `PLAYWRIGHT_BASE_URL` set, every suite runs against
// that URL (a deployed preview, from `scripts/deployed-url.mjs`) and starts no local server —
// the same spec files, no network-dependent assertions either way (no external judge fetches,
// no live search backend: everything the specs check is already in the page). Otherwise each
// suite leases its own port (`scripts/run-playwright.mjs` sets `PLAYWRIGHT_PORT` before the
// config is evaluated) and starts `next start` against the already-built `.next`.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { devices } from "@playwright/test";

export const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
export const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// WebKit containment (work/04-app/containment/webkit-storage.md): see playwright.config.ts's
// original comment (preserved here, the one place it's now defined) — CFFIXED_USER_HOME
// redirects "the user's home" for exactly the WebKit child process Playwright launches, without
// touching real HOME and without being set globally in .tooling/env.sh.
const webkitHome = path.join(workspaceRoot, ".tooling", "webkit-home");
export const webkitLaunchEnv = { ...process.env, CFFIXED_USER_HOME: webkitHome };

export interface BaseUrlInfo {
  baseURL: string;
  /** Set only in local-server mode: the port to start `next start` on. */
  port?: number;
  deployed: boolean;
}

/** Resolves once per config evaluation: deployed preview (PLAYWRIGHT_BASE_URL) or a local port. */
export function resolveBaseUrl(defaultPort: number): BaseUrlInfo {
  const deployedUrl = process.env.PLAYWRIGHT_BASE_URL;
  if (deployedUrl) {
    return { baseURL: deployedUrl.replace(/\/$/, ""), deployed: true };
  }
  const port = Number(process.env.PLAYWRIGHT_PORT ?? defaultPort);
  return { baseURL: `http://127.0.0.1:${port}`, port, deployed: false };
}

/** The 6 chromium/webkit x 390/768/1440 projects every suite (e2e, visual) runs. */
export function fullDeviceProjects() {
  return [
    {
      name: "chromium-390x844",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "chromium-768x1024",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "chromium-1440x900",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "webkit-390x844",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 390, height: 844 },
        launchOptions: { env: webkitLaunchEnv },
      },
    },
    {
      name: "webkit-768x1024",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 768, height: 1024 },
        launchOptions: { env: webkitLaunchEnv },
      },
    },
    {
      name: "webkit-1440x900",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
        launchOptions: { env: webkitLaunchEnv },
      },
    },
  ];
}

/**
 * a11y only runs Chromium (axe's violation set doesn't meaningfully differ by engine, and G-PAGE
 * cares about the document, not engine quirks — see playwright.a11y.config.ts) but still needs
 * all 3 viewports for the "no horizontal overflow at 390px" check.
 */
export function chromiumOnlyProjects() {
  return fullDeviceProjects().filter((p) => p.name.startsWith("chromium-"));
}

// A dedicated dist dir for every local Playwright suite (ETCCC_DIST_DIR, next.config.ts):
// `next start` needs an already-built `.next`-equivalent directory, but the plain `.next` is
// also where a developer's `next dev` writes — starting a build there while a dev server is up
// kills it (orchestrator relay, W3's finding). `reuseExistingServer` means the build-then-start
// command below only actually runs once per still-running server: once `baseURL` answers,
// Playwright skips re-invoking the command on a second `npm run test:e2e` etc.
const LOCAL_DIST_DIR = ".next-local";

/** `webServer` block for local-server mode; omitted entirely in deployed mode (batch 3 item 1). */
export function webServerFor(info: BaseUrlInfo) {
  if (info.deployed) return undefined;
  return {
    command: [
      "node scripts/assert-contained.mjs",
      "node scripts/build-lock.mjs -- next build",
      `next start -p ${info.port}`,
    ].join(" && "),
    env: { ETCCC_DIST_DIR: LOCAL_DIST_DIR },
    url: info.baseURL,
    reuseExistingServer: !process.env.CI,
    // A cold run now builds first (build-lock also waits out any concurrent build), so this
    // needs real headroom beyond a bare `next start`'s near-instant readiness.
    timeout: 300_000,
  };
}
