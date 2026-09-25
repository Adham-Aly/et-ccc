import { defineConfig } from "@playwright/test";
import {
  fullDeviceProjects,
  resolveBaseUrl,
  webServerFor,
} from "./tests/support/playwright-shared";

// G-PAGE (plan §7): axe WCAG 2.2 AA, zero violations, on every built page (players in initial and
// mid-step state once W3's player exists); no horizontal overflow at 390px. Runs on WebKit too
// (W2 request, requests.md): axe's own violation set is document-level, but assistive-tech
// rendering (focus order, computed roles/names from the engine's own accessibility tree) can
// genuinely differ between engines, so G-PAGE is not Chromium-only.
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
  projects: fullDeviceProjects(),
  webServer: webServerFor(info),
});
