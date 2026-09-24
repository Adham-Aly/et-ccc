// tests/unit/scripts/deployed-url.test.ts — regression tests for scripts/deployed-url.mjs
// (batch 3: "must match the current HEAD sha and wait for readiness with a timeout"). Drives the
// pure functions against recorded-shape JSON fixtures (tests/fixtures/deployed-url/) — the actual
// response shape GitHub's Deployments API returns for a Vercel-integrated repo — with an injected
// fake clock and instant `sleep`, so polling (still-pending, eventual success, hard failure and
// timeout) is verified with no real network and no real waiting.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  findMatchingDeployment,
  findSuccessStatus,
  isFailedTerminalState,
  parseGitHubRemote,
  waitForDeployedUrl,
} from "../../../scripts/deployed-url.mjs";

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(testFileDir, "..", "..", "fixtures", "deployed-url");

function loadFixture(name: string) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), "utf8"));
}

const HEAD_SHA = "cafe0000000000000000000000000000000feed";

describe("parseGitHubRemote", () => {
  it("parses an HTTPS remote URL", () => {
    expect(parseGitHubRemote("https://github.com/Adham-Aly/et-ccc.git")).toEqual({
      owner: "Adham-Aly",
      repo: "et-ccc",
    });
  });

  it("parses an HTTPS remote URL with no .git suffix", () => {
    expect(parseGitHubRemote("https://github.com/Adham-Aly/et-ccc")).toEqual({
      owner: "Adham-Aly",
      repo: "et-ccc",
    });
  });

  it("parses an SSH remote URL", () => {
    expect(parseGitHubRemote("git@github.com:Adham-Aly/et-ccc.git")).toEqual({
      owner: "Adham-Aly",
      repo: "et-ccc",
    });
  });

  it("throws on a non-GitHub remote", () => {
    expect(() => parseGitHubRemote("https://gitlab.com/someone/somewhere.git")).toThrow();
  });
});

describe("findMatchingDeployment", () => {
  it("picks the newest deployment among duplicates for the same sha, ignoring an older sha", () => {
    const deployments = loadFixture("deployments-multi.json");
    const match = findMatchingDeployment(deployments, HEAD_SHA);
    expect(match?.id).toBe(5551003); // the later of the two 5551002/5551003 duplicates
  });

  it("returns null when nothing matches the sha", () => {
    const deployments = loadFixture("deployments-multi.json");
    expect(
      findMatchingDeployment(deployments, "0000000000000000000000000000000000dead"),
    ).toBeNull();
  });
});

describe("findSuccessStatus / isFailedTerminalState", () => {
  it("finds the success status among older pending/queued entries", () => {
    const statuses = loadFixture("statuses-pending-then-success.json");
    const success = findSuccessStatus(statuses);
    expect(success?.environment_url).toBe(
      "https://et-ccc-git-phase-04-app-adham-alys-projects.vercel.app",
    );
  });

  it("returns null when no status has succeeded yet", () => {
    const statuses = loadFixture("statuses-pending-then-success.json").filter(
      (s: { state: string }) => s.state !== "success",
    );
    expect(findSuccessStatus(statuses)).toBeNull();
  });

  it("recognizes failure/error/inactive as terminal, and pending/queued/in_progress as not", () => {
    expect(isFailedTerminalState("failure")).toBe(true);
    expect(isFailedTerminalState("error")).toBe(true);
    expect(isFailedTerminalState("inactive")).toBe(true);
    expect(isFailedTerminalState("queued")).toBe(false);
    expect(isFailedTerminalState("in_progress")).toBe(false);
    expect(isFailedTerminalState("success")).toBe(false);
  });
});

// A tiny fake clock: now() advances only when the injected sleep() is awaited, so the timeout
// path exercises real loop iterations without a single real millisecond of wall-clock wait.
function fakeClock(startMs = 0) {
  let current = startMs;
  return {
    now: () => current,
    sleep: async (ms: number) => {
      current += ms;
    },
  };
}

describe("waitForDeployedUrl", () => {
  it("resolves immediately when the first poll already finds a success status", async () => {
    const deployments = loadFixture("deployments-multi.json");
    const successStatuses = loadFixture("statuses-pending-then-success.json");
    const clock = fakeClock();
    const result = await waitForDeployedUrl({
      sha: HEAD_SHA,
      listDeployments: async () => deployments,
      listStatuses: async () => successStatuses,
      sleep: clock.sleep,
      now: clock.now,
      timeoutMs: 60_000,
    });
    expect(result.url).toBe("https://et-ccc-git-phase-04-app-adham-alys-projects.vercel.app");
  });

  it("polls through pending states before succeeding", async () => {
    const deployments = loadFixture("deployments-multi.json");
    const pending = loadFixture("statuses-pending-then-success.json").filter(
      (s: { state: string }) => s.state !== "success",
    );
    const success = loadFixture("statuses-pending-then-success.json");
    let calls = 0;
    const clock = fakeClock();
    const result = await waitForDeployedUrl({
      sha: HEAD_SHA,
      listDeployments: async () => deployments,
      listStatuses: async () => {
        calls += 1;
        return calls < 3 ? pending : success;
      },
      sleep: clock.sleep,
      now: clock.now,
      timeoutMs: 60_000,
      pollIntervalMs: 1000,
    });
    expect(calls).toBe(3);
    expect(result.url).toBe("https://et-ccc-git-phase-04-app-adham-alys-projects.vercel.app");
  });

  it("throws immediately on a terminal failure state, without waiting for the timeout", async () => {
    const deployments = loadFixture("deployments-multi.json");
    const failureStatuses = loadFixture("statuses-failure.json");
    const clock = fakeClock();
    await expect(
      waitForDeployedUrl({
        sha: HEAD_SHA,
        listDeployments: async () => deployments,
        listStatuses: async () => failureStatuses,
        sleep: clock.sleep,
        now: clock.now,
        timeoutMs: 60_000,
      }),
    ).rejects.toThrow(/terminal state "failure"/);
  });

  it("times out with a clear message when nothing ever succeeds", async () => {
    const deployments = loadFixture("deployments-multi.json");
    const pending = loadFixture("statuses-pending-then-success.json").filter(
      (s: { state: string }) => s.state !== "success",
    );
    const clock = fakeClock();
    await expect(
      waitForDeployedUrl({
        sha: HEAD_SHA,
        listDeployments: async () => deployments,
        listStatuses: async () => pending,
        sleep: clock.sleep,
        now: clock.now,
        timeoutMs: 5000,
        pollIntervalMs: 2000,
      }),
    ).rejects.toThrow(/timed out after 5000ms/);
  });

  it("times out with a distinct message when no deployment ever matches the sha", async () => {
    const clock = fakeClock();
    await expect(
      waitForDeployedUrl({
        sha: "0000000000000000000000000000000000dead",
        listDeployments: async () => loadFixture("deployments-multi.json"),
        listStatuses: async () => {
          throw new Error("must not be called: no matching deployment");
        },
        sleep: clock.sleep,
        now: clock.now,
        timeoutMs: 3000,
        pollIntervalMs: 1000,
      }),
    ).rejects.toThrow(/no deployment found for sha/);
  });
});
