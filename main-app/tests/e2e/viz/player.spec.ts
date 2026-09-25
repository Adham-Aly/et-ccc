// tests/e2e/viz/player.spec.ts: G-E2E for the shared visual player (plan §7; DESIGN.md → Player
// chrome, Motion choreography). Every control, the keyboard contract (keys work inside the
// player's group only, never as page-wide shortcuts), presets, reduced motion, lazy loading, the
// first frame without JavaScript, the live caption and the text alternative. Runs on every
// project of playwright.config.ts (Chromium and WebKit at 390, 768 and 1440 px), and every test
// ends with no console error or warning (W1's fixture).
import { expect, expectNoConsoleIssues, test } from "../support/fixtures";
import {
  caption,
  counter,
  ctl,
  dijkstra,
  expectStep,
  freezeClock,
  group,
  hydrate,
  PLAYER_CHUNK_MARKER,
  playerScripts,
  pushFiguresBelowTheFold,
  recordScripts,
  settled,
  TRACE_LESSON,
  VISUAL_LESSONS,
  VISUALS_LESSON,
} from "./player-helpers";

test.describe("player controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(VISUALS_LESSON);
    await hydrate(dijkstra(page));
  });

  test("next and previous step one at a time and stop at the ends", async ({
    page,
    consoleIssues,
  }) => {
    const fig = dijkstra(page);
    const [, total] = await counter(fig);
    await expectStep(fig, 1);
    await expect(ctl(fig, "prev")).toHaveAttribute("aria-disabled", "true");
    await ctl(fig, "next").click();
    await expectStep(fig, 2);
    await ctl(fig, "next").click();
    await expectStep(fig, 3);
    await ctl(fig, "prev").click();
    await expectStep(fig, 2);
    for (let i = 2; i < total; i += 1) await ctl(fig, "next").click();
    await expectStep(fig, total);
    await expect(ctl(fig, "next")).toHaveAttribute("aria-disabled", "true");
    // aria-disabled keeps the button focusable and clickable; clicking it does nothing.
    await ctl(fig, "next").dispatchEvent("click");
    await expectStep(fig, total);
    expectNoConsoleIssues(consoleIssues);
  });

  test("the scrubber seeks with its own keys", async ({ page, consoleIssues }) => {
    const fig = dijkstra(page);
    const [, total] = await counter(fig);
    const scrub = ctl(fig, "scrub");
    await scrub.focus();
    await page.keyboard.press("ArrowRight");
    await expectStep(fig, 2);
    await page.keyboard.press("End");
    await expectStep(fig, total);
    await expect(scrub).toHaveAttribute("aria-valuetext", `Step ${total} of ${total}`);
    await page.keyboard.press("Home");
    await expectStep(fig, 1);
    expectNoConsoleIssues(consoleIssues);
  });

  test("restart goes back to step 1 and pauses", async ({ page, consoleIssues }) => {
    const fig = dijkstra(page);
    for (let i = 0; i < 4; i += 1) await ctl(fig, "next").click();
    await expectStep(fig, 5);
    await ctl(fig, "restart").click();
    await expectStep(fig, 1);
    await expect(ctl(fig, "restart")).toHaveAttribute("aria-disabled", "true");
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play");
    expectNoConsoleIssues(consoleIssues);
  });

  test("play advances on its own, pause stops it, and it stops at the last step", async ({
    page,
    consoleIssues,
  }) => {
    const fig = dijkstra(page);
    const [, total] = await counter(fig);
    await freezeClock(page);
    await ctl(fig, "play").click();
    await settled(page);
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Pause");
    await page.clock.runFor(1200);
    await expectStep(fig, 2);
    await page.clock.runFor(1200);
    await expectStep(fig, 3);
    await ctl(fig, "play").click();
    await settled(page);
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play");
    await page.clock.runFor(5000);
    await expectStep(fig, 3);
    // Play again runs to the end and stops there (no loop).
    await ctl(fig, "play").click();
    await settled(page);
    await page.clock.runFor(1200 * (total + 2));
    await expectStep(fig, total);
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play from the start");
    // At the end, play starts over from step 1.
    await ctl(fig, "play").click();
    await settled(page);
    await expectStep(fig, 1);
    expectNoConsoleIssues(consoleIssues);
  });

  test("speed sets the time per step: 0.5× 2.4 s, 1× 1.2 s, 2× 0.6 s", async ({
    page,
    consoleIssues,
  }) => {
    const fig = dijkstra(page);
    await expect(ctl(fig, "speed-1")).toBeChecked();
    await freezeClock(page);
    const timing: [string, number][] = [
      ["2", 600],
      ["0.5", 2400],
      ["1", 1200],
    ];
    for (const [speed, ms] of timing) {
      await ctl(fig, `speed-${speed}`).check();
      await expect(ctl(fig, `speed-${speed}`)).toBeChecked();
      await expect(group(fig)).toHaveAttribute("data-speed", speed);
      await ctl(fig, "restart").click({ force: true });
      await expectStep(fig, 1);
      await ctl(fig, "play").click();
      await settled(page);
      await page.clock.runFor(ms - 50);
      await expectStep(fig, 1);
      await page.clock.runFor(50);
      await expectStep(fig, 2);
      await ctl(fig, "play").click();
      await settled(page);
      await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play");
    }
    expectNoConsoleIssues(consoleIssues);
  });

  test("switching presets resets to step 1, paused", async ({ page, consoleIssues }) => {
    const fig = dijkstra(page);
    for (let i = 0; i < 4; i += 1) await ctl(fig, "next").click();
    await expectStep(fig, 5);
    const [, fiveNodes] = await counter(fig);
    await ctl(fig, "preset-1").check();
    await expect(ctl(fig, "preset-1")).toBeChecked();
    await expectStep(fig, 1);
    const [, sixNodes] = await counter(fig);
    expect(sixNodes).not.toBe(fiveNodes);
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play");
    await ctl(fig, "next").click();
    await ctl(fig, "preset-0").check();
    await expectStep(fig, 1);
    expect((await counter(fig))[1]).toBe(fiveNodes);
    expectNoConsoleIssues(consoleIssues);
  });
});

test.describe("keyboard", () => {
  test("←/→, Space, Home and End work inside the player only", async ({ page, consoleIssues }) => {
    await page.goto(VISUALS_LESSON);
    const fig = dijkstra(page);
    await hydrate(fig);
    const [, total] = await counter(fig);
    // The group itself is the tab stop just before its first control.
    await ctl(fig, "preset-0").focus();
    await page.keyboard.press("Shift+Tab");
    await expect(group(fig)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expectStep(fig, 2);
    await page.keyboard.press("ArrowRight");
    await expectStep(fig, 3);
    await page.keyboard.press("ArrowLeft");
    await expectStep(fig, 2);
    await page.keyboard.press("End");
    await expectStep(fig, total);
    await page.keyboard.press("Home");
    await expectStep(fig, 1);
    await freezeClock(page);
    await page.keyboard.press(" ");
    await settled(page);
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Pause");
    await page.keyboard.press(" ");
    await settled(page);
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play");
    await expectStep(fig, 1);
    // Space on a focused button acts once (the group handles it; the button's click is held).
    await ctl(fig, "next").focus();
    await page.keyboard.press(" ");
    await settled(page);
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Pause");
    await page.keyboard.press(" ");
    await settled(page);
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play");
    // Enter on a button is the button's own action.
    await page.keyboard.press("Enter");
    await expectStep(fig, 2);

    // Outside the player the same keys belong to the page: no global shortcuts.
    await page.locator("main h1").click();
    await expect(group(fig)).not.toBeFocused();
    for (const key of ["ArrowRight", "ArrowLeft", "End", "Home", " "]) {
      await page.keyboard.press(key);
      await expectStep(fig, 2);
    }
    await expect(ctl(fig, "play")).toHaveAttribute("aria-label", "Play");
    expectNoConsoleIssues(consoleIssues);
  });

  test("the code trace steps from the keyboard and names the next line", async ({
    page,
    consoleIssues,
  }) => {
    await page.goto(TRACE_LESSON);
    const fig = page.locator('figure.vz-figure[data-viz="code-trace"]');
    await hydrate(fig);
    const code = fig.locator(".vz-trace-code");
    const first = await code.getAttribute("aria-label");
    await group(fig).focus();
    await page.keyboard.press("ArrowRight");
    await expectStep(fig, 2);
    await expect(code).not.toHaveAttribute("aria-label", first ?? "");
    await expect(code).toHaveAttribute("aria-label", /^Code, line \d+ is next$/);
    // The code pane keeps its own scroll keys.
    await code.focus();
    await page.keyboard.press("ArrowRight");
    await expectStep(fig, 2);
    expectNoConsoleIssues(consoleIssues);
  });
});

test.describe("caption and text alternative", () => {
  test("the caption is a polite live region that follows the step", async ({
    page,
    consoleIssues,
  }) => {
    await page.goto(VISUALS_LESSON);
    const fig = dijkstra(page);
    await hydrate(fig);
    const live = fig.locator(".vz-caption");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await expect(live).toHaveAttribute("aria-atomic", "true");
    const one = await caption(fig);
    expect(one.length).toBeGreaterThan(20);
    await ctl(fig, "next").click();
    await expect(live).not.toHaveText(one);
    expectNoConsoleIssues(consoleIssues);
  });

  test("“Read the steps as text” lists every caption of every preset", async ({
    page,
    consoleIssues,
  }) => {
    await page.goto(VISUALS_LESSON);
    const fig = dijkstra(page);
    await hydrate(fig);
    const [, five] = await counter(fig);
    await ctl(fig, "preset-1").check();
    const [, six] = await counter(fig);
    await ctl(fig, "preset-0").check();
    const details = fig.locator("details");
    await details.locator("summary", { hasText: "Read the steps as text" }).click();
    await expect(details).toHaveAttribute("open", "");
    const lists = details.locator("ol");
    await expect(lists).toHaveCount(2);
    await expect(lists.nth(0).locator("li")).toHaveCount(five);
    await expect(lists.nth(1).locator("li")).toHaveCount(six);
    await expect(details.locator(".vz-alt-preset")).toHaveText(["Five nodes", "Six nodes"]);
    // The list says what the player says, step by step.
    const firstCaption = await caption(fig);
    await expect(lists.nth(0).locator("li").first()).toHaveText(firstCaption);
    expectNoConsoleIssues(consoleIssues);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("every change snaps; stepping and playing still work", async ({ page, consoleIssues }) => {
    await page.goto(VISUALS_LESSON);
    const fig = dijkstra(page);
    await hydrate(fig);
    const dur = await group(fig).evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--vz-dur").trim(),
    );
    expect(Number.parseFloat(dur)).toBe(0);
    await ctl(fig, "next").click();
    await expectStep(fig, 2);
    const running = await fig.evaluate(
      (el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
    );
    expect(running).toBe(0);
    await freezeClock(page);
    await ctl(fig, "play").click();
    await settled(page);
    await page.clock.runFor(1200);
    await expectStep(fig, 3);
    expectNoConsoleIssues(consoleIssues);
  });
});

test.describe("motion by default", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("without the preference, steps animate", async ({ page, consoleIssues }) => {
    await page.goto(VISUALS_LESSON);
    const fig = dijkstra(page);
    await hydrate(fig);
    const dur = await group(fig).evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--vz-dur").trim(),
    );
    expect(Number.parseFloat(dur)).toBeGreaterThan(0);
    expectNoConsoleIssues(consoleIssues);
  });
});

test.describe("loading", () => {
  test("the player chunk loads only when a visual comes near the viewport", async ({
    page,
    consoleIssues,
  }) => {
    await pushFiguresBelowTheFold(page);
    const scripts = recordScripts(page);
    await page.goto(VISUALS_LESSON);
    await page.waitForLoadState("networkidle");
    // Give an eager loader every chance to show itself.
    await page.waitForTimeout(500);
    expect(await playerScripts(scripts)).toEqual([]);
    await expect(page.locator("[data-player][data-ready]")).toHaveCount(0);
    // The server-rendered first frame is already complete and readable.
    const fig = dijkstra(page);
    await expect(fig.locator(".vz-counter")).toHaveText(/^\s*1\s*\/\s*\d+\s*$/);
    await hydrate(fig);
    await expect
      .poll(async () => (await playerScripts(scripts)).length, {
        message: `a script containing "${PLAYER_CHUNK_MARKER}" once the visual is near`,
      })
      .toBeGreaterThan(0);
    expectNoConsoleIssues(consoleIssues);
  });

  test("a click before the player loads is not lost", async ({ page, consoleIssues }) => {
    await pushFiguresBelowTheFold(page);
    await page.goto(VISUALS_LESSON);
    await page.waitForLoadState("networkidle");
    // Hold every script fetched from now on (the player chunk) until the click has happened, so
    // the click certainly lands on the server-rendered first frame.
    let release = () => {};
    const held = new Promise<void>((r) => {
      release = r;
    });
    await page.route("**/_next/static/**/*.js", async (route) => {
      await held;
      await route.continue();
    });
    const fig = dijkstra(page);
    await fig.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await ctl(fig, "next").click();
    await expect(fig.locator("[data-player][data-ready]")).toHaveCount(0);
    await expectStep(fig, 1);
    release();
    await expect(fig.locator("[data-player][data-ready]")).toBeVisible();
    await expectStep(fig, 2);
    expectNoConsoleIssues(consoleIssues);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const path of VISUAL_LESSONS) {
    test(`every visual on ${path} shows a meaningful first frame`, async ({ page }) => {
      await page.goto(path);
      const figs = page.locator("figure.vz-figure");
      const n = await figs.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i += 1) {
        const fig = figs.nth(i);
        await fig.scrollIntoViewIfNeeded();
        // The drawing: an SVG with laid-out, labelled items and a title naming the step (a call
        // tree may start as a single node).
        const svg = fig.locator("svg.vz-svg").first();
        await expect(svg).toBeVisible();
        expect(await svg.locator("[data-k]").count()).toBeGreaterThan(0);
        expect((await svg.locator("text").allTextContents()).join("").trim()).not.toBe("");
        await expect(svg.locator("title").first()).not.toHaveText("");
        const box = await svg.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThan(100);
        expect(box?.height ?? 0).toBeGreaterThan(40);
        const isPlayer = (await fig.locator("[data-player]").count()) > 0;
        if (isPlayer) {
          await expect(fig.locator(".vz-counter")).toHaveText(/^\s*1\s*\/\s*\d+\s*$/);
          expect((await caption(fig)).length).toBeGreaterThan(20);
          await expect(fig.locator("[data-player][data-ready]")).toHaveCount(0);
        }
        // The text alternative is native <details>: it opens without JavaScript.
        const details = fig.locator("figcaption details");
        await details.locator("summary").click();
        await expect(details).toHaveAttribute("open", "");
        expect((await details.innerText()).length).toBeGreaterThan(40);
      }
    });
  }
});
