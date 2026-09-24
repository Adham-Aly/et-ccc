#!/usr/bin/env node
// scripts/deployed-url.mjs — resolves the Vercel preview URL for the current HEAD commit, so
// `verify:preview` can point Playwright at a real deployed preview instead of a local server
// (plan §7's G-E2E/G-VISUAL/G-PAGE "full, against the local production build and the Vercel
// preview at phase exit"; batch 3's "scripts/deployed-url.mjs" item).
//
// How it works: GitHub's Deployments API (which Vercel's GitHub integration writes to on every
// push) records one deployment per commit sha, each with a timeline of statuses. This script:
//   1. Reads the current HEAD sha and the GitHub owner/repo from `origin`'s remote URL, via the
//      contained `.tooling/bin/git` wrapper (never a bare `git`, plan §9.2).
//   2. Lists deployments for that sha via `.tooling/bin/gh api` (the contained `gh` wrapper —
//      read-only "api" calls are not blocked by its login/config guard).
//   3. Polls that deployment's statuses until one reaches `state: "success"` with an
//      `environment_url` (Vercel's convention), or `timeoutMs` elapses.
//
// CLI: `node scripts/deployed-url.mjs [--timeout=<ms>] [--sha=<sha>] [--ref=<branch>]`
//   Prints the resolved URL to stdout on success (nothing else — safe to capture:
//   `PLAYWRIGHT_BASE_URL=$(npm run -s deployed-url)`), and exits non-zero with a message on
//   stderr if no HEAD deployment succeeds before the timeout, or none exists at all — never a
//   silent fallback to guessing a URL.
//
// Importable API (for tests: pure functions, no process/child_process/network) —
//   parseGitHubRemote(remoteUrl), findMatchingDeployment(deployments, sha),
//   findSuccessStatus(statuses), isFailedTerminalState(state), waitForDeployedUrl(options).
// tests/unit/scripts/deployed-url.test.ts drives these against recorded JSON fixtures
// (tests/fixtures/deployed-url/) with an injected fake clock/sleep, so the polling logic (success,
// still-pending-then-success, and hard-failure/timeout paths) is verified with no real network
// and no real waiting.

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..", "..");
const GIT_BIN = path.join(workspaceRoot, ".tooling", "bin", "git");
const GH_BIN = path.join(workspaceRoot, ".tooling", "bin", "gh");

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 5000;

/** "https://github.com/Adham-Aly/et-ccc.git" (or the SSH form) -> { owner: "Adham-Aly", repo: "et-ccc" }. */
export function parseGitHubRemote(remoteUrl) {
  const m = remoteUrl.trim().match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?$/);
  if (!m) throw new Error(`"${remoteUrl}" does not look like a GitHub remote URL`);
  return { owner: m[1], repo: m[2] };
}

/**
 * Deployments for a sha, newest first, may include duplicates (re-deploys, retried builds).
 * Picks the one with the latest `created_at` — the deployment actually worth polling.
 */
export function findMatchingDeployment(deployments, sha) {
  const matches = deployments.filter((d) => d.sha === sha);
  if (matches.length === 0) return null;
  return matches.reduce((latest, d) =>
    new Date(d.created_at).getTime() > new Date(latest.created_at).getTime() ? d : latest,
  );
}

const FAILED_STATES = new Set(["failure", "error", "inactive"]);

/** True for a deployment status state that will never become "success" on its own. */
export function isFailedTerminalState(state) {
  return FAILED_STATES.has(state);
}

/** The newest "success" status with a usable environment_url, or null if not there yet. */
export function findSuccessStatus(statuses) {
  const success = statuses
    .filter((s) => s.state === "success" && s.environment_url)
    .reduce(
      (latest, s) =>
        !latest || new Date(s.created_at).getTime() > new Date(latest.created_at).getTime()
          ? s
          : latest,
      null,
    );
  return success;
}

/** The newest status of any kind, for a clear timeout/failure message. */
function newestStatus(statuses) {
  if (statuses.length === 0) return null;
  return statuses.reduce((latest, s) =>
    new Date(s.created_at).getTime() > new Date(latest.created_at).getTime() ? s : latest,
  );
}

/**
 * Polls until a deployment matching `sha` has a "success" status with an environment_url, a
 * terminal failure state, or `timeoutMs` elapses. All I/O is injected so this is unit-testable
 * with no real network and no real waiting:
 *   listDeployments(): Promise<Deployment[]>
 *   listStatuses(deploymentId): Promise<Status[]>
 *   sleep(ms): Promise<void>
 *   now(): number (ms)
 */
export async function waitForDeployedUrl({
  sha,
  listDeployments,
  listStatuses,
  sleep,
  now,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  pollIntervalMs = POLL_INTERVAL_MS,
}) {
  const deadline = now() + timeoutMs;
  let lastDeployment = null;
  let lastStatuses = [];
  for (;;) {
    const deployments = await listDeployments();
    const deployment = findMatchingDeployment(deployments, sha);
    if (deployment) {
      lastDeployment = deployment;
      const statuses = await listStatuses(deployment.id);
      lastStatuses = statuses;
      const success = findSuccessStatus(statuses);
      if (success) return { url: success.environment_url, deployment, status: success };
      const latest = newestStatus(statuses);
      if (latest && isFailedTerminalState(latest.state)) {
        throw new Error(
          `deployment ${deployment.id} for ${sha} reached terminal state "${latest.state}" (never became "success")`,
        );
      }
    }
    if (now() >= deadline) {
      const detail = lastDeployment
        ? `deployment ${lastDeployment.id} found, last status: ${newestStatus(lastStatuses)?.state ?? "none"}`
        : `no deployment found for sha ${sha}`;
      throw new Error(
        `timed out after ${timeoutMs}ms waiting for a deployed preview URL (${detail})`,
      );
    }
    await sleep(pollIntervalMs);
  }
}

// ---------------------------------------------------------------------------------------------
// CLI (real git/gh I/O) — not imported by tests.
// ---------------------------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const flag = (name) => {
    const prefix = `--${name}=`;
    const found = args.find((a) => a.startsWith(prefix));
    return found ? found.slice(prefix.length) : undefined;
  };

  const sha =
    flag("sha") ??
    execFileSync(GIT_BIN, ["rev-parse", flag("ref") ?? "HEAD"], {
      cwd: workspaceRoot,
      encoding: "utf8",
    }).trim();
  const remoteUrl = execFileSync(GIT_BIN, ["remote", "get-url", "origin"], {
    cwd: workspaceRoot,
    encoding: "utf8",
  }).trim();
  const { owner, repo } = parseGitHubRemote(remoteUrl);
  const timeoutMs = flag("timeout") ? Number(flag("timeout")) : DEFAULT_TIMEOUT_MS;

  console.error(`deployed-url: resolving the deployed preview for ${owner}/${repo}@${sha}...`);

  function ghApiJson(route) {
    const out = execFileSync(GH_BIN, ["api", route], { encoding: "utf8" });
    return JSON.parse(out);
  }

  try {
    const result = await waitForDeployedUrl({
      sha,
      listDeployments: async () =>
        ghApiJson(`repos/${owner}/${repo}/deployments?sha=${sha}&per_page=20`),
      listStatuses: async (deploymentId) =>
        ghApiJson(`repos/${owner}/${repo}/deployments/${deploymentId}/statuses?per_page=20`),
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      now: () => Date.now(),
      timeoutMs,
    });
    console.error(`deployed-url: ready — ${result.url}`);
    process.stdout.write(`${result.url}\n`);
  } catch (e) {
    console.error(`deployed-url: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
