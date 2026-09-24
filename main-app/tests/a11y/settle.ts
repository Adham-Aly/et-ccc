// tests/a11y/settle.ts: shared page-settling steps for G-PAGE and G-VISUAL (pages).
import type { Page } from "@playwright/test";
import { FIXED_READ_AT, READ_KEY } from "./routes";

/** Load a page and wait until it can no longer change on its own: network idle, web fonts
 * loaded, two animation frames so hydration-time client state has painted, and every running CSS
 * transition or animation finished. */
export async function gotoSettled(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await settle(page);
}

export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // Finish any CSS transition still running (dialog fade/scale, drawer slide, ink-in).
    // Scroll-driven animations (the code-region fade) never "finish", so only time-based ones
    // are awaited.
    await Promise.all(
      document
        .getAnimations()
        .filter((an) => an.timeline instanceof DocumentTimeline)
        .map((an) => an.finished.catch(() => undefined)),
    );
  });
}

/** Seed read state before any page script runs. `ids` read at FIXED_READ_AT; [] = nothing read.
 * Idempotent, so it is safe that init scripts re-run on every navigation. */
export async function seedReadState(page: Page, ids: string[]): Promise<void> {
  const value = JSON.stringify(Object.fromEntries(ids.map((id) => [id, FIXED_READ_AT])));
  await page.addInitScript(
    ([key, v]) => {
      window.localStorage.setItem(key, v);
    },
    [READ_KEY, value] as const,
  );
}
