import { defineConfig } from "@playwright/test";
import {
  fullDeviceProjects,
  resolveBaseUrl,
  webServerFor,
} from "./tests/support/playwright-shared";

// G-E2E (plan §7): navigation, course map, module/lesson pages, practice links, search,
// mark-as-read, players (once W3's player exists), 404, console errors, same-origin. Dual-mode
// base URL and WebKit containment live in tests/support/playwright-shared.ts, shared with
// playwright.visual.config.ts and playwright.a11y.config.ts.
const info = resolveBaseUrl(4100);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: info.baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: fullDeviceProjects(),
  webServer: webServerFor(info),
});
