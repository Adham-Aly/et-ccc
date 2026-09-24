// tests/visual/pages/pages.spec.ts: G-VISUAL for routes and components (plan §7). Full-page and
// above-the-fold shots of every route template, element shots of every /dev/design section, and
// the key interactive states, on every project in playwright.visual.config.ts (Chromium and
// WebKit at 390, 768 and 1440). Read state is set explicitly in each test, fonts are ready and
// transitions are finished before any shot (tests/a11y/settle.ts), and the config disables CSS
// animations. Baselines live in tests/visual/__screenshots__ and are accepted only after the
// orchestrator's review.
import { expect, type Page, test } from "@playwright/test";
import { NOT_FOUND_PATH, STATE_LESSON, STATE_LESSON_ID } from "../../a11y/routes";
import { gotoSettled, seedReadState, settle } from "../../a11y/settle";

/** One route per page template (the other fixture pages repeat these templates). */
const TEMPLATES: { name: string; path: string }[] = [
  { name: "home", path: "/" },
  { name: "course-map", path: "/learn" },
  { name: "module", path: "/learn/fx/M90.2" },
  { name: "lesson", path: STATE_LESSON },
  { name: "lesson-practice", path: "/learn/fx/M90.2/technique" },
  { name: "problems", path: "/problems" },
  { name: "glossary", path: "/glossary" },
  { name: "search", path: "/search" },
  { name: "start", path: "/start" },
  { name: "about", path: "/about" },
  { name: "not-found", path: NOT_FOUND_PATH },
];

// settle() has already finished every time-based transition. The config default
// (animations: "disabled") would also jump the scroll-driven code fade to its end and hide the
// scroll affordance, so these shots keep animations as they are.
const SHOT = { animations: "allow" } as const;

async function shotPage(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}-top.png`, SHOT);
  await expect(page).toHaveScreenshot(`${name}-full.png`, { ...SHOT, fullPage: true });
}

test.describe("route templates, nothing read", () => {
  for (const t of TEMPLATES) {
    test(t.name, async ({ page }) => {
      await seedReadState(page, []);
      await gotoSettled(page, t.path);
      await shotPage(page, t.name);
    });
  }
});

test.describe("/dev/design sections", () => {
  test("every section", async ({ page }) => {
    await seedReadState(page, []);
    await gotoSettled(page, "/dev/design");
    const sections = page.locator("main section:not([data-ui]):has(> h2)");
    const count = await sections.count();
    expect(count).toBeGreaterThan(5);
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      const title = (await section.locator("> h2").innerText())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      await expect(section).toHaveScreenshot(`design-${title}.png`, SHOT);
    }
  });
});

test.describe("key states", () => {
  test("lesson marked read: closing title block", async ({ page }) => {
    await seedReadState(page, [STATE_LESSON_ID]);
    await gotoSettled(page, STATE_LESSON);
    const undo = page.getByRole("button", { name: "Undo" });
    await expect(undo).toBeVisible();
    await undo.scrollIntoViewIfNeeded();
    await settle(page);
    await expect(page).toHaveScreenshot("state-lesson-read.png", SHOT);
  });

  test("home: continue where you left off", async ({ page }) => {
    await seedReadState(page, [STATE_LESSON_ID]);
    await gotoSettled(page, "/");
    await expect(page).toHaveScreenshot("state-home-continue.png", SHOT);
  });

  test("course map: read marks", async ({ page }) => {
    await seedReadState(page, [STATE_LESSON_ID]);
    await gotoSettled(page, "/learn");
    const stage = page.locator("main section").filter({ hasText: "M90.1" }).last();
    await expect(stage).toHaveScreenshot("state-map-read.png", SHOT);
  });

  test("search dialog open with results", async ({ page }) => {
    await seedReadState(page, []);
    await gotoSettled(page, "/start");
    await page.getByRole("button", { name: "Open search" }).click();
    await page.getByRole("combobox", { name: "Search the course" }).fill("algo");
    await expect(page.getByRole("option").first()).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot("state-search-dialog.png", SHOT);
  });

  test("mobile drawer open on a lesson", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) >= 1024, "the drawer exists below 1024 px only");
    await seedReadState(page, [STATE_LESSON_ID]);
    await gotoSettled(page, "/learn/fx/M90.1/components-two");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot("state-drawer.png", SHOT);
  });

  test("Term popover open", async ({ page }) => {
    await seedReadState(page, []);
    await gotoSettled(page, STATE_LESSON);
    const trigger = page.locator(".term-trigger").first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(page.locator(".term-pop:popover-open")).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot("state-term-popover.png", SHOT);
  });

  test("Details open", async ({ page }) => {
    await seedReadState(page, []);
    await gotoSettled(page, STATE_LESSON);
    const details = page.locator("details").first();
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await settle(page);
    await expect(details).toHaveScreenshot("state-details-open.png", SHOT);
  });
});
