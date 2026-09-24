#!/usr/bin/env node
// scripts/check-dist-dir-isolation.mjs — regression guard for a real incident (orchestrator
// relay, 2026-09-24): `main-app/.next-local/` was not gitignored, so Tailwind v4's automatic
// content detection (no explicit `content: []` in app/globals.css's plain `@import "tailwindcss"`
// — v4 scans everything not gitignored) scanned its compiled JS chunks as if they were source,
// picked up mangled class-like tokens from minified output, and corrupted the generated CSS
// shared by every page — every `next dev` page 500'd. Fixed by gitignoring every local dist dir
// (`.next-*/`, both .gitignore files). This script reproduces the exact scenario end to end: a
// `next dev` server stays up on the plain `.next` dist dir while a *separate* local build runs
// into `.next-local` (scripts/support/local-server.mjs), and checks the dev server is still
// healthy afterwards — the same live check the incident would have failed.
//
// Next 16 allows only one `next dev` per dist dir workspace, and this workspace routinely has
// one already running (another agent's). Rather than fight that, this script reuses whichever
// `next dev` is already up when one is (parsed from Next's own "Another next dev server is
// already running" message) and only starts (and later stops) its own when none is running.
import { spawn } from "node:child_process";
import path from "node:path";
import { leasePort } from "./port-lease.mjs";
import { appRoot, buildAndServe } from "./support/local-server.mjs";

function log(msg) {
  console.log(`check-dist-dir-isolation: ${msg}`);
}

async function waitFor200(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return res;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) throw new Error(`${url} never returned 200 within ${timeoutMs}ms`);
    await new Promise((r) => setTimeout(r, 300));
  }
}

/**
 * Starts `next dev` on a leased port. If Next refuses because one is already running on this
 * dist dir, parses the existing server's URL from its own message and reuses that instead.
 * @returns {Promise<{ base: string, owned: boolean, child: import("node:child_process").ChildProcess | null }>}
 */
async function startOrReuseDev() {
  const leased = await leasePort("dist-dir-isolation-dev", { releaseOnExit: true });
  const port = leased.port;
  log(`starting a \`next dev\` server on http://127.0.0.1:${port} (plain .next) ...`);

  return new Promise((resolve, reject) => {
    let buffer = "";
    let settled = false;
    const child = spawn(
      process.execPath,
      [
        path.join(appRoot, "node_modules", "next", "dist", "bin", "next"),
        "dev",
        "-p",
        String(port),
      ],
      { cwd: appRoot, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env }, detached: true },
    );

    function onData(chunk) {
      const text = chunk.toString();
      process.stdout.write(text);
      buffer += text;

      if (!settled && /Ready in \d/.test(buffer)) {
        settled = true;
        leased.release(); // this lease only reserved the port for the race; ownership is the child now
        resolve({ base: `http://127.0.0.1:${port}`, owned: true, child });
      }
      const reuse = buffer.match(
        /Another next dev server is already running[\s\S]*?http:\/\/localhost:(\d+)/,
      );
      if (!settled && reuse) {
        settled = true;
        leased.release();
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {
          // already exiting on its own
        }
        resolve({ base: `http://localhost:${reuse[1]}`, owned: false, child: null });
      }
    }
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.once("error", (err) => {
      if (!settled) {
        settled = true;
        leased.release();
        reject(err);
      }
    });
    setTimeout(() => {
      if (!settled) {
        settled = true;
        leased.release();
        reject(new Error("next dev did not report readiness or a conflict within 60s"));
      }
    }, 60_000);
  });
}

async function main() {
  let dev;
  try {
    dev = await startOrReuseDev();
  } catch (err) {
    console.error(`check-dist-dir-isolation: ${err.message}`);
    process.exit(1);
    return;
  }

  function killDevIfOwned() {
    if (dev.owned && dev.child) {
      try {
        process.kill(-dev.child.pid, "SIGTERM");
      } catch {
        // already gone
      }
    }
  }

  let failed = false;
  try {
    await waitFor200(dev.base, 30_000);
    log(
      dev.owned
        ? "dev server is up; running an isolated local build into .next-local alongside it ..."
        : `reusing the already-running dev server at ${dev.base}; running an isolated local build into .next-local alongside it ...`,
    );

    const built = await buildAndServe({
      distDir: ".next-local",
      leaseName: "dist-dir-isolation-build",
    });
    await built.stop(); // the build succeeding and tearing down cleanly is itself meaningful

    log("local build finished and tore down; re-checking the dev server ...");
    const res = await waitFor200(dev.base, 15_000);
    const body = await res.text();
    // The incident's actual symptom: Tailwind's generated CSS gained control characters from
    // scanning compiled chunk names as source (e.g. "\19", "\2 \b" — see the corrupted rules in
    // the incident's server log). A clean page never contains raw control bytes in its markup.
    // biome-ignore lint/suspicious/noControlCharactersInRegex: this IS the corruption signature
    const hasControlChars = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body);
    if (hasControlChars) {
      failed = true;
      console.error(
        "check-dist-dir-isolation: the dev server's page contains control characters after the local build — Tailwind likely scanned build output again.",
      );
    }
  } catch (err) {
    failed = true;
    console.error(`check-dist-dir-isolation: ${err.message}`);
  } finally {
    killDevIfOwned();
    await new Promise((r) => setTimeout(r, 500));
  }

  if (failed) process.exit(1);
  log("clean — a local build into its own dist dir did not disturb a running `next dev`.");
}

main();
