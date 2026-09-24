import { defineConfig, devices } from "@playwright/test";

// Port leased from scripts/port-lease.mjs (4100-4199, plan brief "Servers"). Playwright's own
// webServer block needs a fixed number at config-eval time, so the E2E npm script leases one
// port for the whole run; see tests/e2e/README.md (written with the suites) for the exact flow.
// For the scaffold's smoke test we lease and export the port via PLAYWRIGHT_PORT.
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4100);
const baseURL = `http://127.0.0.1:${port}`;

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
      use: { ...devices["Desktop Safari"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "webkit-768x1024",
      use: { ...devices["Desktop Safari"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "webkit-1440x900",
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `node scripts/assert-contained.mjs && next start -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
