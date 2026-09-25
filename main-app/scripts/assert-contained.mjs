#!/usr/bin/env node
// scripts/assert-contained.mjs — prefixed to every npm script (plan §9.2 layer 2, brief §1.3).
// Fails unless every redirect variable from .tooling/env.sh points inside this workspace's
// .tooling/ directory and the running `node` binary is the workspace-local tarball, not
// Homebrew's or any other system Node. This is the second containment layer: it protects any
// script run via `npm run …` even if it was somehow reached without going through
// `.tooling/bin/npm` (the guard hook and the wrapper are the other two layers, plan §9.2).

import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
// scripts/ -> main-app -> workspace root
const workspaceRoot = path.resolve(scriptDir, "..", "..");
const toolingRoot = path.join(workspaceRoot, ".tooling");

// On Vercel (or any CI/ephemeral container), containment of local developer folders does not apply.
if (process.env.VERCEL) {
  process.exit(0);
}

const failures = [];

function insideTooling(p) {
  const resolved = path.resolve(p);
  return resolved === toolingRoot || resolved.startsWith(toolingRoot + path.sep);
}

function insideWorkspace(p) {
  const resolved = path.resolve(p);
  return resolved === workspaceRoot || resolved.startsWith(workspaceRoot + path.sep);
}

// 1. Node must be the workspace-local tarball.
const expectedNodeDir = path.join(toolingRoot, "node");
if (
  !insideTooling(process.execPath) ||
  !path.resolve(process.execPath).startsWith(expectedNodeDir + path.sep)
) {
  failures.push(
    `process.execPath (${process.execPath}) is not the workspace Node at ${expectedNodeDir}`,
  );
}

// 2. Every redirect variable .tooling/env.sh sets must resolve inside .tooling/.
const requiredInsideTooling = [
  "npm_config_userconfig",
  "npm_config_globalconfig",
  "npm_config_prefix",
  "npm_config_cache",
  "COREPACK_HOME",
  "NODE_REPL_HISTORY",
  "XDG_CACHE_HOME",
  "XDG_CONFIG_HOME",
  "XDG_DATA_HOME",
  "XDG_STATE_HOME",
  "PLAYWRIGHT_BROWSERS_PATH",
  "PIP_CACHE_DIR",
  "PYTHONUSERBASE",
  "PYTHONPYCACHEPREFIX",
  "PYTHONHISTORY",
  "RUFF_CACHE_DIR",
  "IMPECCABLE_HOME",
];

for (const name of requiredInsideTooling) {
  const value = process.env[name];
  if (!value) {
    failures.push(
      `${name} is not set — run this through ".tooling/bin/npm run …" (sources .tooling/env.sh), not a bare npm.`,
    );
    continue;
  }
  if (!insideTooling(value)) {
    failures.push(`${name}=${value} does not resolve inside ${toolingRoot}`);
  }
}

// 3. PATH must resolve a bare `node`/`npm` to the workspace toolchain before any system
//    location. npm itself prepends the local `node_modules/.bin` ahead of everything when it
//    runs a script (that's expected and harmless — those are pinned local devDependencies
//    inside the workspace), so this checks that nothing *outside* the workspace precedes the
//    workspace Node's bin directory, not that the workspace Node is literally PATH[0].
const toolingNodeBin = path.join(toolingRoot, "node", "bin");
const pathEntries = (process.env.PATH ?? "").split(path.delimiter);
const toolingIndex = pathEntries.indexOf(toolingNodeBin);
if (toolingIndex === -1) {
  failures.push(`PATH does not include ${toolingNodeBin}`);
} else {
  // npm also prepends every ancestor directory's node_modules/.bin (not just the workspace's
  // own), walking up from cwd — most of those don't exist and are harmless; only flag a
  // non-node_modules/.bin entry that isn't inside the workspace.
  const isNpmLocalBin = (entry) => /(^|\/)node_modules\/\.bin$/.test(entry);
  const earlierOutsideWorkspace = pathEntries
    .slice(0, toolingIndex)
    .find((entry) => entry !== "" && !insideWorkspace(entry) && !isNpmLocalBin(entry));
  if (earlierOutsideWorkspace) {
    failures.push(
      `PATH entry "${earlierOutsideWorkspace}" precedes the workspace Node (${toolingNodeBin}); a bare node/npm call could resolve outside the workspace`,
    );
  }
}

if (failures.length > 0) {
  console.error("assert-contained: containment check FAILED:");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error(
    'Call tools only through ".tooling/bin/*" or ".tooling/bin/npm run <script>" (plan §9.2, CLAUDE.md).',
  );
  process.exit(1);
}

process.exit(0);
