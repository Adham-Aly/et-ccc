#!/usr/bin/env node
// scripts/gates/verify-build.mjs — G-BUILD for verify:full (plan §7: "next build succeeds with
// every route prerendered"). Only proves the build succeeds; nothing downstream consumes its
// output (test:e2e/test:visual/test:a11y each build their own server separately, via
// scripts/support/local-server.mjs). Builds into its own `.next-verify-build` dist dir — never
// the plain `.next` `npm run build` uses (that script stays byte-for-byte what Vercel runs), so
// this never collides with a developer's running `next dev` (orchestrator relay, W3's finding).
// Removes the dist dir afterward either way.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..", "..");
const DIST_DIR = ".next-verify-build";
const distPath = path.join(appRoot, DIST_DIR);

fs.rmSync(distPath, { recursive: true, force: true });

const result = spawnSync(
  process.execPath,
  [path.join(appRoot, "scripts", "build-lock.mjs"), "--", "next", "build"],
  {
    cwd: appRoot,
    stdio: "inherit",
    env: { ...process.env, ETCCC_DIST_DIR: DIST_DIR },
    shell: false,
  },
);

fs.rmSync(distPath, { recursive: true, force: true });

process.exit(result.status ?? 1);
