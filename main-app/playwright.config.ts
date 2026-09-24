import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

// Port leased from scripts/port-lease.mjs (4100-4199, plan brief "Servers"). Playwright's own
// webServer block needs a fixed number at config-eval time, so the E2E npm script leases one
// port for the whole run; see tests/e2e/README.md (written with the suites) for the exact flow.
// For the scaffold's smoke test we lease and export the port via PLAYWRIGHT_PORT.
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4100);
const baseURL = `http://127.0.0.1:${port}`;

// WebKit containment (work/04-app/containment/webkit-storage.md): on macOS, Playwright's WebKit
// uses Apple's per-bundle-ID WKWebsiteDataStore, which otherwise writes to
// ~/Library/WebKit/org.webkit.Playwright, ~/Library/Caches/org.webkit.Playwright and
// ~/Library/Preferences/org.webkit.Playwright.plist — outside the workspace, with no CLI flag.
// CFFIXED_USER_HOME (a CoreFoundation env var, honoured by all Apple frameworks including
// WebKit's storage/preferences code) redirects "the user's home" for exactly the WebKit child
// process Playwright launches, without touching real HOME (which would break Keychain/gh/git,
// plan §9.2) and without being set globally in .tooling/env.sh (it must never apply outside a
// WebKit browser process).
const configDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(configDir, "..");
const webkitHome = path.join(workspaceRoot, ".tooling", "webkit-home");
const webkitLaunchEnv = { ...process.env, CFFIXED_USER_HOME: webkitHome };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
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
  ],
  webServer: {
    command: `node scripts/assert-contained.mjs && next start -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
