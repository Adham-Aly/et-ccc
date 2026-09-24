// tests/e2e/viz/perf.spec.ts: the player's part of G-PERF (plan §7; DESIGN.md → Performance).
//   1. No long task (> 50 ms) on the main thread while a reader steps through and plays a
//      player, measured unthrottled (the gate). The same run under a 4× CPU slowdown is recorded
//      as information only (test annotations), because the absolute numbers depend on the host.
//   2. The lazy player chunk (everything the page fetches because a player came near) stays at
//      or under 60 kB gzip. The bytes are read from the build output when this run's build is on
//      disk (local mode), else from the served files (a deployed preview).
// Chromium only: the Long Tasks API and CPU throttling are Chromium features. One viewport is
// enough for both measurements (1440 px, where the widest figures render).
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import type { Page } from "@playwright/test";
import { expect, expectNoConsoleIssues, test } from "../support/fixtures";
import {
  counter,
  ctl,
  dijkstra,
  group,
  hydrate,
  pushFiguresBelowTheFold,
  recordScripts,
  VISUALS_LESSON,
} from "./player-helpers";

const LONG_TASK_MS = 50;
const CHUNK_BUDGET_GZIP = 60 * 1024;
/** The dist dirs a local run may have built (tests/support/playwright-shared.ts, next.config). */
const DIST_DIRS = [process.env.ETCCC_DIST_DIR, ".next-local", ".next"].filter(Boolean) as string[];

test.skip(
  ({ browserName, viewport }) => browserName !== "chromium" || viewport?.width !== 1440,
  "Chromium at 1440 px only: Long Tasks API and CPU throttling",
);

async function watchLongTasks(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __longTasks: number[] };
    w.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) w.__longTasks.push(Math.round(e.duration));
    }).observe({ type: "longtask", buffered: true });
  });
}

/**
 * Prove the observer sees a long task at all: a deliberate 120 ms busy loop in a page task (a
 * timer; script evaluated from the test itself is not an event-loop task and is never counted).
 */
async function selfCheck(page: Page): Promise<void> {
  await page.evaluate(() => {
    setTimeout(() => {
      const end = performance.now() + 120;
      while (performance.now() < end) {
        // busy
      }
    }, 0);
  });
  await expect
    .poll(
      async () =>
        (
          await page.evaluate(() => (window as unknown as { __longTasks: number[] }).__longTasks)
        ).some((d) => d >= 100),
      {
        message: "the Long Tasks observer recorded the deliberate 120 ms task",
      },
    )
    .toBe(true);
}

const takeLongTasks = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __longTasks: number[] };
    const out = w.__longTasks;
    w.__longTasks = [];
    return out;
  });

/** Step through every step of both presets, then play at 2× to the end. */
async function exercise(page: Page): Promise<void> {
  const fig = dijkstra(page);
  for (const preset of ["preset-0", "preset-1"]) {
    await ctl(fig, preset).check();
    const [, total] = await counter(fig);
    await group(fig).focus();
    for (let i = 1; i < total; i += 1) {
      await page.keyboard.press("ArrowRight");
      await expect(fig.locator(".vz-counter")).toHaveText(new RegExp(`^\\s*${i + 1}\\s*/`));
    }
    await ctl(fig, "speed-2").check();
    await ctl(fig, "play").click();
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play from the start", {
      timeout: total * 1200,
    });
    await ctl(fig, "speed-1").check();
  }
}

test("no long tasks while stepping and playing", async ({ page, consoleIssues }) => {
  await watchLongTasks(page);
  await page.goto(VISUALS_LESSON);
  await hydrate(dijkstra(page));
  await page.waitForLoadState("networkidle");
  await selfCheck(page);
  await takeLongTasks(page); // loading and hydration are G-PERF's page budget, not this check
  await exercise(page);
  const tasks = await takeLongTasks(page);
  expect(
    tasks.filter((d) => d > LONG_TASK_MS),
    `long tasks over ${LONG_TASK_MS} ms while stepping/playing: ${tasks.join(", ")}`,
  ).toEqual([]);
  expectNoConsoleIssues(consoleIssues);
});

test("long tasks under a 4× CPU slowdown (information)", async ({ page }) => {
  await watchLongTasks(page);
  await page.goto(VISUALS_LESSON);
  await hydrate(dijkstra(page));
  await page.waitForLoadState("networkidle");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await selfCheck(page);
  await takeLongTasks(page);
  await exercise(page);
  const tasks = await takeLongTasks(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  test.info().annotations.push({
    type: "4× CPU long tasks",
    description: tasks.length
      ? `${tasks.length} over ${LONG_TASK_MS} ms: ${tasks.join(", ")} ms (max ${Math.max(...tasks)})`
      : "none",
  });
});

test("the lazy player chunk is at most 60 kB gzip", async ({ page }) => {
  await pushFiguresBelowTheFold(page);
  const scripts = recordScripts(page);
  await page.goto(VISUALS_LESSON);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const before = new Set(scripts.map((s) => s.url));
  await hydrate(dijkstra(page));
  await page.waitForLoadState("networkidle");
  const lazy = scripts.filter((s) => !before.has(s.url));
  expect(lazy.length, "the player fetched no script of its own").toBeGreaterThan(0);
  let total = 0;
  const parts: string[] = [];
  for (const s of lazy) {
    const rel = new URL(s.url).pathname.replace(/^\/_next\//, "");
    const onDisk = DIST_DIRS.map((d) => path.join(process.cwd(), d, rel)).find((f) =>
      fs.existsSync(f),
    );
    const bytes = onDisk ? fs.readFileSync(onDisk) : await s.body();
    const gz = gzipSync(bytes, { level: 9 }).length;
    total += gz;
    parts.push(`${path.basename(rel)} ${(gz / 1024).toFixed(1)} kB${onDisk ? "" : " (served)"}`);
  }
  test.info().annotations.push({
    type: "lazy player chunk",
    description: `${(total / 1024).toFixed(1)} kB gzip: ${parts.join("; ")}`,
  });
  expect(total, parts.join("; ")).toBeLessThanOrEqual(CHUNK_BUDGET_GZIP);
});
