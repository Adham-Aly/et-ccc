import { defineConfig } from "@playwright/test";
import {
  chromiumOnlyProjects,
  resolveBaseUrl,
  webServerFor,
} from "./tests/support/playwright-shared";

// G-PAGE (plan §7): axe WCAG 2.2 AA, zero violations, on every built page (players in initial and
// mid-step state once W3's player exists); no horizontal overflow at 390px. Chromium only — axe's
// violation set is about the document (roles, contrast, structure), not engine quirks, and this
// suite runs on every page in the app, so halving the browser matrix keeps it fast without losing
// coverage (WebKit-specific rendering bugs are G-VISUAL's job).
const info = resolveBaseUrl(4102);

export default defineConfig({
  testDir: "./tests/a11y",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: info.baseURL,
    trace: "retain-on-failure",
  },
  projects: chromiumOnlyProjects(),
  webServer: webServerFor(info),
});
