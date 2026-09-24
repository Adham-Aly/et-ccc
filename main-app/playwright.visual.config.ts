import { defineConfig } from "@playwright/test";
import {
  fullDeviceProjects,
  resolveBaseUrl,
  webServerFor,
} from "./tests/support/playwright-shared";

// G-VISUAL (plan §7): screenshots of every route template and key state at 3 viewports on
// Chromium and WebKit, element shots of every gallery entry, every content visual's first/
// middle/last step at 390px and 1440px. `maxDiffPixels` <= 50, animations settled, fonts ready.
// Baselines are NOT committed by this config running — see tests/visual/README.md: the
// orchestrator reviews new/changed snapshots (an Opus visual-review note) before any baseline is
// accepted into git.
const info = resolveBaseUrl(4101);

export default defineConfig({
  testDir: "./tests/visual",
  snapshotDir: "./tests/visual/__screenshots__",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: info.baseURL,
    trace: "retain-on-failure",
    // Settled animations, deterministic fonts (plan §7 G-VISUAL): every spec also explicitly
    // waits on document.fonts.ready and disables CSS animations/transitions before a shot, this
    // is the project-wide default for anything that doesn't.
  },
  expect: {
    toHaveScreenshot: { maxDiffPixels: 50, animations: "disabled" },
  },
  projects: fullDeviceProjects(),
  webServer: webServerFor(info),
});
