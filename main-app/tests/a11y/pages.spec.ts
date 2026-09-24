// tests/a11y/pages.spec.ts: G-PAGE (plan §7). axe with the WCAG 2.2 AA rule set reports zero
// violations on every built page and on the interactive states (search dialog, mobile drawer,
// Term popover, Details, a lesson marked read); no page scrolls horizontally at 390 px.
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { allPages, STATE_LESSON, STATE_LESSON_ID } from "./routes";
import { gotoSettled, seedReadState, settle } from "./settle";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
  );
  expect(summary, `${label}: axe violations`).toEqual([]);
}

for (const path of allPages()) {
  test(`${path}: axe WCAG 2.2 AA, zero violations`, async ({ page }) => {
    await gotoSettled(page, path);
    await expectNoViolations(page, path);
  });

  test(`${path}: no horizontal overflow at 390 px`, async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) !== 390, "overflow is checked at the 390 px viewport");
    await gotoSettled(page, path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${path} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(0);
  });
}

test.describe("interactive states", () => {
  test("search dialog open, with results", async ({ page }) => {
    await gotoSettled(page, "/start");
    await page.getByRole("button", { name: "Open search" }).click();
    const input = page.getByRole("combobox", { name: "Search the course" });
    await expect(input).toBeFocused();
    await input.fill("algo");
    await expect(page.getByRole("option").first()).toBeVisible();
    await settle(page);
    await expectNoViolations(page, "search dialog");
  });

  test("mobile drawer open", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) >= 1024, "the drawer exists below 1024 px only");
    await gotoSettled(page, STATE_LESSON);
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await settle(page);
    await expectNoViolations(page, "mobile drawer");
  });

  test("Term popover open", async ({ page }) => {
    await gotoSettled(page, STATE_LESSON);
    const trigger = page.locator(".term-trigger").first();
    await trigger.click();
    await expect(page.locator(".term-pop:popover-open")).toBeVisible();
    await expectNoViolations(page, "Term popover");
  });

  test("Details open", async ({ page }) => {
    await gotoSettled(page, STATE_LESSON);
    const details = page.locator("details").first();
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expectNoViolations(page, "Details open");
  });

  test("lesson marked read", async ({ page }) => {
    await seedReadState(page, [STATE_LESSON_ID]);
    await gotoSettled(page, STATE_LESSON);
    await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
    await expectNoViolations(page, "lesson marked read");
  });
});
