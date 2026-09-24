#!/usr/bin/env node
// scripts/port-lease.mjs — leases a port in 4100-4199 for local servers (plan brief "Servers";
// implementation-plan §4.10 "Local servers ... run on ports from scripts/port-lease.mjs").
//
// CLI:
//   node scripts/port-lease.mjs lease <name>    prints the leased port on stdout, writes a lock
//                                                file under .tooling/locks/ports/ that survives
//                                                this process exiting (the caller releases it
//                                                explicitly once the server it started stops)
//   node scripts/port-lease.mjs release <name>  releases every lock held under <name>
//
// Importable API (for a script that leases, runs a server, and releases within one process):
//   import { leasePort, releasePortByName } from "./port-lease.mjs"
//   const { port, release } = await leasePort("e2e", { releaseOnExit: true });

import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..", "..");
const lockDir = path.join(workspaceRoot, ".tooling", "locks", "ports");

const MIN_PORT = 4100;
const MAX_PORT = 4199;

function ensureLockDir() {
  fs.mkdirSync(lockDir, { recursive: true });
}

function lockPath(port) {
  return path.join(lockDir, `${port}.lock`);
}

function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// A server bound to "127.0.0.1" alone doesn't conflict with one already bound to "::" (IPv6 any)
// at the socket-API level, even though — unless the other process set IPV6_V6ONLY — that other
// server IS already answering on this exact port over IPv4 too, on macOS and Linux both. Binding
// only 127.0.0.1 therefore used to report a port "free" that a `::`-bound server already
// occupied (regression test: tests/unit/scripts/port-lease.test.ts). Trying every host a real
// server here is realistically started on — including a plain bind with no host, which Node
// defaults to "::" — and requiring all of them to succeed closes that gap.
const PROBE_HOSTS = ["127.0.0.1", "::1", "0.0.0.0", "::"];

function tryListen(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    if (host) server.listen(port, host);
    else server.listen(port);
  });
}

export async function checkPortFree(port) {
  for (const host of PROBE_HOSTS) {
    // eslint-disable-next-line no-await-in-loop
    const free = await tryListen(port, host);
    if (!free) return false;
  }
  return true;
}

/**
 * @param {string} name
 * @param {{ releaseOnExit?: boolean }} [options]
 */
export async function leasePort(name, options = {}) {
  const { releaseOnExit = false } = options;
  ensureLockDir();
  for (let port = MIN_PORT; port <= MAX_PORT; port += 1) {
    const file = lockPath(port);
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        if (isPidAlive(data.pid)) continue; // still leased by a live process
        fs.unlinkSync(file); // stale lock from a dead process, reclaim
      } catch {
        fs.unlinkSync(file); // unreadable lock file, reclaim
      }
    }
    // eslint-disable-next-line no-await-in-loop
    const free = await checkPortFree(port);
    if (!free) continue;
    fs.writeFileSync(
      file,
      JSON.stringify({ name, pid: process.pid, leasedAt: new Date().toISOString() }, null, 2),
    );
    const release = () => {
      try {
        if (fs.existsSync(file)) {
          const current = JSON.parse(fs.readFileSync(file, "utf8"));
          if (current.pid === process.pid) fs.unlinkSync(file);
        }
      } catch {
        // best-effort cleanup only
      }
    };
    if (releaseOnExit) {
      process.once("exit", release);
    }
    return { port, release };
  }
  throw new Error(`No free port in ${MIN_PORT}-${MAX_PORT} for "${name}"`);
}

export function releasePortByName(name) {
  ensureLockDir();
  for (const entry of fs.readdirSync(lockDir)) {
    const full = path.join(lockDir, entry);
    try {
      const data = JSON.parse(fs.readFileSync(full, "utf8"));
      if (data.name === name) fs.unlinkSync(full);
    } catch {
      // ignore malformed lock files
    }
  }
}

async function main() {
  const [, , cmd, name] = process.argv;
  if (cmd === "lease") {
    if (!name) {
      console.error("Usage: port-lease.mjs lease <name>");
      process.exit(1);
    }
    const { port } = await leasePort(name, { releaseOnExit: false });
    console.log(port);
    return;
  }
  if (cmd === "release") {
    if (!name) {
      console.error("Usage: port-lease.mjs release <name>");
      process.exit(1);
    }
    releasePortByName(name);
    return;
  }
  console.error("Usage: port-lease.mjs <lease|release> <name>");
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
