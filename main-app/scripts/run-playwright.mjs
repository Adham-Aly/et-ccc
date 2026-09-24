#!/usr/bin/env node
// scripts/run-playwright.mjs — leases a port (scripts/port-lease.mjs, plan brief "Servers": every
// local server "runs on ports from scripts/port-lease.mjs") for one Playwright suite, runs
// `playwright test -c <config>`, then releases it. Skips leasing entirely when
// PLAYWRIGHT_BASE_URL is set (deployed-preview mode, tests/support/playwright-shared.ts): no
// local server, so no port to lease.
//
// Usage: node scripts/run-playwright.mjs <lease-name> <config-file> [default-port] [-- extra playwright args...]
//   node scripts/run-playwright.mjs e2e playwright.config.ts 4100
//   node scripts/run-playwright.mjs e2e playwright.config.ts 4100 -- --repeat-each 10 --retries 0

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leasePort } from "./port-lease.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");

const argv = process.argv.slice(2);
const sepIndex = argv.indexOf("--");
const positional = sepIndex === -1 ? argv : argv.slice(0, sepIndex);
const extra = sepIndex === -1 ? [] : argv.slice(sepIndex + 1);
const [leaseName, configFile, defaultPortRaw] = positional;

if (!leaseName || !configFile) {
  console.error(
    "Usage: run-playwright.mjs <lease-name> <config-file> [default-port] [-- extra playwright args...]",
  );
  process.exit(1);
}

async function main() {
  const deployed = Boolean(process.env.PLAYWRIGHT_BASE_URL);
  let release = () => {};
  const env = { ...process.env };

  if (!deployed) {
    void defaultPortRaw; // accepted for documentation/CLI symmetry; leasePort finds the real one
    const leased = await leasePort(leaseName, { releaseOnExit: true });
    release = leased.release;
    env.PLAYWRIGHT_PORT = String(leased.port);
  }

  const playwrightBin = path.join(appRoot, "node_modules", ".bin", "playwright");
  const result = spawnSync(playwrightBin, ["test", "-c", configFile, ...extra], {
    cwd: appRoot,
    stdio: "inherit",
    env,
    shell: false,
  });

  release();

  if (result.error) {
    console.error(`run-playwright: failed to run playwright: ${result.error.message}`);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

main();
