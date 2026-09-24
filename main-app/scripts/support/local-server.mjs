#!/usr/bin/env node
// scripts/support/local-server.mjs — shared build+serve+teardown for every local script that
// needs a real running instance of the app (scripts/check-production-mode.mjs, links-internal.mjs,
// perf-budgets.mjs). Factored out once these three needed near-identical logic, rather than
// duplicating it three times.
//
// Always builds into its own dist directory (ETCCC_DIST_DIR, next.config.ts) — never the plain
// `.next` a developer's `next dev` might be using (orchestrator relay, W3's finding: a `next
// build` into a shared `.next` kills a running `next dev`). Kills the whole process group on
// teardown, not just the launcher, since `next start` forks its own server process and a plain
// `child.kill()` only kills the launcher, leaving an orphan bound to the port (found empirically
// while building scripts/check-production-mode.mjs).
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leasePort } from "../port-lease.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const appRoot = path.resolve(scriptDir, "..", "..");

async function waitForServer(url, timeoutMs, child) {
  const deadline = Date.now() + timeoutMs;
  let exited = false;
  let exitInfo = "";
  child.once("exit", (code, signal) => {
    exited = true;
    exitInfo = `exited early (code=${code}, signal=${signal}) — see its output above`;
  });
  for (;;) {
    if (exited) throw new Error(`server ${exitInfo}`);
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) throw new Error(`server did not come up at ${url} in time`);
    await new Promise((r) => setTimeout(r, 300));
  }
}

/**
 * Builds (under the build lock, into `distDir`) and starts `next start`, with `extraEnv` applied
 * to both. Returns `{ base, distPath, stop() }`; the caller must always call `stop()`.
 * @param {{ distDir: string, leaseName: string, extraEnv?: Record<string,string>, log?: (msg: string) => void }} opts
 */
export async function buildAndServe({ distDir, leaseName, extraEnv = {}, log = console.log }) {
  const distPath = path.join(appRoot, distDir);
  fs.rmSync(distPath, { recursive: true, force: true });

  const env = { ...process.env, ...extraEnv, ETCCC_DIST_DIR: distDir };

  log(`building into ${distDir} ...`);
  const build = spawnSync(
    process.execPath,
    [path.join(appRoot, "scripts", "build-lock.mjs"), "--", "next", "build"],
    { cwd: appRoot, stdio: "inherit", env, shell: false },
  );
  if (build.status !== 0) {
    throw new Error("build failed");
  }

  const leased = await leasePort(leaseName, { releaseOnExit: true });
  const base = `http://127.0.0.1:${leased.port}`;
  log(`starting server on ${base} ...`);
  const child = spawn(
    process.execPath,
    [
      path.join(appRoot, "node_modules", "next", "dist", "bin", "next"),
      "start",
      "-p",
      String(leased.port),
    ],
    { cwd: appRoot, stdio: "inherit", env, detached: true },
  );

  function killServer() {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      // already gone
    }
  }

  let ready = false;
  try {
    await waitForServer(base, 60_000, child);
    ready = true;
  } finally {
    if (!ready) {
      killServer();
      await new Promise((r) => setTimeout(r, 500));
      leased.release();
      fs.rmSync(distPath, { recursive: true, force: true });
    }
  }

  async function stop() {
    killServer();
    await new Promise((r) => setTimeout(r, 500));
    leased.release();
    fs.rmSync(distPath, { recursive: true, force: true });
  }

  return { base, distPath, stop };
}
