#!/usr/bin/env node
// scripts/build-lock.mjs — serializes `next build` runs through .tooling/locks/build.lock (plan
// brief §1.3: "next build only under the build lock"). Usage:
//   node scripts/build-lock.mjs -- <command> [args...]

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..", "..");
const lockDir = path.join(workspaceRoot, ".tooling", "locks");
const lockFile = path.join(lockDir, "build.lock");

const rawArgs = process.argv.slice(2);
const sepIndex = rawArgs.indexOf("--");
const command = sepIndex === -1 ? rawArgs : rawArgs.slice(sepIndex + 1);
if (command.length === 0) {
  console.error("Usage: build-lock.mjs -- <command> [args...]");
  process.exit(1);
}

fs.mkdirSync(lockDir, { recursive: true });

const POLL_MS = 2000;
const MAX_WAIT_MS = 10 * 60 * 1000; // 10 minutes
let waited = 0;
let fd;
for (;;) {
  try {
    fd = fs.openSync(lockFile, "wx");
    break;
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
    if (waited === 0) {
      console.error(`build-lock: waiting for ${lockFile} (held by another build) ...`);
    }
    if (waited >= MAX_WAIT_MS) {
      console.error(`build-lock: timed out after ${MAX_WAIT_MS}ms waiting for ${lockFile}`);
      process.exit(1);
    }
    // Synchronous sleep without a dependency: block this thread on Atomics.wait.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, POLL_MS);
    waited += POLL_MS;
  }
}

fs.writeSync(
  fd,
  JSON.stringify({
    pid: process.pid,
    startedAt: new Date().toISOString(),
    command: command.join(" "),
  }),
);
fs.closeSync(fd);

function release() {
  try {
    fs.unlinkSync(lockFile);
  } catch {
    // already gone
  }
}

process.once("exit", release);
process.once("SIGINT", () => {
  release();
  process.exit(130);
});
process.once("SIGTERM", () => {
  release();
  process.exit(143);
});

const result = spawnSync(command[0], command.slice(1), { stdio: "inherit", shell: false });
if (result.error) {
  console.error(`build-lock: failed to run "${command.join(" ")}": ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
