// tests/e2e/viz/player-helpers.ts: shared steps for the player suites (G-E2E players in
// tests/e2e/viz, G-PERF in tests/e2e/viz/perf.spec.ts, G-VISUAL viz in tests/visual/viz). They
// drive the player the way a reader does (buttons, keys, the range) and read its state from what
// is on screen (the step counter, the play button's name), never from React internals. The DOM
// contract they rely on is in work/04-app/requests.md ("player DOM contract").
import { expect, type Locator, type Page } from "@playwright/test";

/** The lesson with the most players: a scene, a diagram and six step-throughs. */
export const VISUALS_LESSON = "/learn/fx/M90.3/visuals";
/** The lesson with the code trace. */
export const TRACE_LESSON = "/learn/fx/M90.1/components-two";
/** Every fixture lesson that shows a visual. */
export const VISUAL_LESSONS = [VISUALS_LESSON, "/learn/fx/M90.2/technique", TRACE_LESSON];

/** A string that only the lazy player chunk contains (PlayerView's play button name at the end). */
export const PLAYER_CHUNK_MARKER = "Play from the start";

/** The Dijkstra step-through: two presets ("Five nodes", "Six nodes"). */
export function dijkstra(page: Page): Locator {
  return page
    .locator("figure.vz-figure")
    .filter({ has: page.locator('input[data-ctl="preset-1"]') })
    .filter({ hasText: "Five nodes" });
}

export function group(fig: Locator): Locator {
  return fig.locator('[role="group"][data-player]');
}

/** Scroll the figure into view and wait for the interactive player to replace the first frame. */
export async function hydrate(fig: Locator): Promise<void> {
  await fig.scrollIntoViewIfNeeded();
  await expect(fig.locator("[data-player][data-ready]")).toBeVisible();
}

/** "3 / 15" → [3, 15]. */
export async function counter(fig: Locator): Promise<[number, number]> {
  const text = (await fig.locator(".vz-counter").innerText()).trim();
  const m = /^(\d+)\s*\/\s*(\d+)$/.exec(text);
  if (!m) throw new Error(`unexpected step counter "${text}"`);
  return [Number(m[1]), Number(m[2])];
}

export async function expectStep(fig: Locator, step: number): Promise<void> {
  await expect(fig.locator(".vz-counter")).toHaveText(new RegExp(`^\\s*${step}\\s*/\\s*\\d+\\s*$`));
}

export function ctl(fig: Locator, name: string): Locator {
  return fig.locator(`[data-ctl="${name}"]`);
}

export async function caption(fig: Locator): Promise<string> {
  return (await fig.locator(".vz-caption").innerText()).trim();
}

/**
 * Serve every visual far below the fold (4000 px of margin above each figure), so nothing is
 * within the player's 600 px look-ahead when the page loads. The page itself is unchanged.
 */
export async function pushFiguresBelowTheFold(page: Page): Promise<void> {
  await page.route(
    (url) => VISUAL_LESSONS.some((p) => url.pathname === p),
    async (route) => {
      const res = await route.fetch();
      const html = (await res.text()).replace(
        "</head>",
        "<style>figure.vz-figure{margin-top:4000px!important}</style></head>",
      );
      const headers = { ...res.headers() };
      delete headers["content-length"];
      delete headers["content-encoding"];
      await route.fulfill({ status: res.status(), headers, body: html });
    },
  );
}

/** Every script response of the page, with its body, in arrival order. */
export function recordScripts(page: Page): { url: string; body: () => Promise<Buffer> }[] {
  const seen: { url: string; body: () => Promise<Buffer> }[] = [];
  page.on("response", (res) => {
    if (res.request().resourceType() !== "script" && !res.url().endsWith(".js")) return;
    seen.push({ url: res.url(), body: () => res.body() });
  });
  return seen;
}

/** The scripts in `list` that are (part of) the lazy player chunk. */
export async function playerScripts(
  list: { url: string; body: () => Promise<Buffer> }[],
): Promise<{ url: string; body: Buffer }[]> {
  const out: { url: string; body: Buffer }[] = [];
  for (const s of list) {
    const body = await s.body().catch(() => null);
    if (body?.includes(PLAYER_CHUNK_MARKER)) out.push({ url: s.url, body });
  }
  return out;
}

/**
 * Take over the page's timers: a fake clock that does not move on its own (an installed clock
 * keeps flowing in real time until paused), so playback advances only through clock.runFor.
 */
export async function freezeClock(page: Page): Promise<void> {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1000);
}

/**
 * Let the page finish the work a click or key queued (React runs effects such as starting the
 * playback timer from a MessageChannel task, which a fake clock does not control): two round
 * trips through the page's own task queue.
 */
export async function settled(page: Page): Promise<void> {
  for (let i = 0; i < 2; i += 1) {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const ch = new MessageChannel();
          ch.port1.onmessage = () => resolve();
          ch.port2.postMessage(0);
        }),
    );
  }
}

/** Leave keyboard focus nowhere, so no focus ring lands in a screenshot. */
export async function blur(page: Page): Promise<void> {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}
