// tests/visual/viz/viz.spec.ts: G-VISUAL for the visualization library (plan §7). Element shots
// of every /dev/viz gallery entry, and of every fixture visual at its first, middle and last
// step, on Chromium and WebKit (playwright.visual.config.ts: maxDiffPixels 50, animations
// disabled). Gallery entries are shot at every project width; lesson visuals at 390 and 1440 px.
// Before each shot the player has hydrated, focus is cleared (no focus ring), fonts are ready
// and every transition has finished (reduced motion makes every step change a snap).
// Baselines live in tests/visual/__screenshots__ and are accepted only after the orchestrator's
// review.
import { expect, type Locator, type Page, test } from "@playwright/test";
import { settle } from "../../a11y/settle";
import { blur, counter, VISUAL_LESSONS } from "../../e2e/viz/player-helpers";

test.use({ contextOptions: { reducedMotion: "reduce" } });

/** Players that run (not the gallery's frozen pictures) hydrate before any shot. */
async function ready(fig: Locator): Promise<boolean> {
  await fig.scrollIntoViewIfNeeded();
  const frozen = (await fig.locator(".vz-mount[data-frozen]").count()) > 0;
  if (frozen || (await fig.locator("[data-player]").count()) === 0) return false;
  await expect(fig.locator("[data-player][data-ready]")).toBeVisible();
  return true;
}

async function goStep(page: Page, fig: Locator, key: "Home" | "End" | number): Promise<void> {
  const g = fig.locator('[role="group"][data-player]');
  await g.focus();
  await page.keyboard.press("Home");
  if (key === "End") await page.keyboard.press("End");
  else if (typeof key === "number")
    for (let i = 0; i < key; i += 1) await page.keyboard.press("ArrowRight");
  await blur(page);
  await settle(page);
}

test.describe("/dev/viz gallery", () => {
  test("every entry", async ({ page }) => {
    await page.goto("/dev/viz");
    await settle(page);
    const entries = page.locator("[data-gallery]");
    const n = await entries.count();
    expect(n).toBeGreaterThan(30);
    for (let i = 0; i < n; i += 1) {
      const entry = entries.nth(i);
      const id = await entry.getAttribute("data-gallery");
      await entry.scrollIntoViewIfNeeded();
      const fig = entry.locator("figure.vz-figure");
      if ((await fig.count()) === 1) {
        if (await ready(fig)) await goStep(page, fig, "Home");
      }
      await blur(page);
      await settle(page);
      await expect(entry).toHaveScreenshot(`viz-gallery-${id}.png`);
    }
  });
});

test.describe("lesson visuals, first, middle and last step", () => {
  test.skip(
    ({ viewport }) => viewport?.width === 768,
    "lesson visuals are shot at 390 and 1440 px (plan §7 G-VISUAL)",
  );

  for (const lesson of VISUAL_LESSONS) {
    const slug = lesson.replace(/^\/learn\//, "").replace(/\//g, "-");
    test(slug, async ({ page }) => {
      await page.goto(lesson);
      await settle(page);
      const figs = page.locator("figure.vz-figure");
      const n = await figs.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i += 1) {
        const fig = figs.nth(i);
        const name = `viz-${slug}-${i + 1}-${await fig.getAttribute("data-viz")}`;
        if (!(await ready(fig))) {
          await blur(page);
          await settle(page);
          await expect(fig).toHaveScreenshot(`${name}.png`);
          continue;
        }
        const [, total] = await counter(fig);
        const steps: [string, "Home" | "End" | number][] = [["first", "Home"]];
        if (total > 2) steps.push(["middle", Math.floor((total - 1) / 2)]);
        if (total > 1) steps.push(["last", "End"]);
        for (const [label, key] of steps) {
          await goStep(page, fig, key);
          await expect(fig).toHaveScreenshot(`${name}-${label}.png`);
        }
      }
    });
  }
});
