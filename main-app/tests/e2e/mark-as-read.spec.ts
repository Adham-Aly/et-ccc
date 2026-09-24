// tests/e2e/mark-as-read.spec.ts — G-E2E: marking a lesson read (toggle + undo), the sidebar/
// module-page check marks updating live from the same `localStorage`-backed store, "Continue
// where you left off" picking the right next lesson, and the blocked-`localStorage` case (an
// init script makes every access throw — plan §4.8/A9: the app must work the same, minus the
// check marks, never crash).
//
// No `beforeEach` storage reset is needed: Playwright gives every test its own browser context
// with fresh, empty storage (no shared state between tests) — an `addInitScript`-based reset was
// tried and removed, since `addInitScript` re-runs on *every* navigation within a test, not just
// the first, and so silently wiped out a lesson marked read right before a same-test
// `page.goto()` to a second page (caught by two of this file's own tests failing until this was
// found and removed).
import { expect, expectNoConsoleIssues, test } from "./support/fixtures";

test("mark as read, then undo, round-trips correctly with no console issues", async ({
  page,
  consoleIssues,
}) => {
  await page.goto("/learn/fx/M90.1/components-one");
  const markButton = page.getByRole("button", { name: "Mark as read" });
  await markButton.click();

  await expect(page.getByText(/Marked on/)).toBeVisible();
  const undoButton = page.getByRole("button", { name: "Undo" });
  await expect(undoButton).toBeVisible();
  await expect(undoButton).toBeFocused();

  await undoButton.click();
  await expect(page.getByRole("button", { name: "Mark as read" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark as read" })).toBeFocused();

  expectNoConsoleIssues(consoleIssues);
});

test("marking a lesson read updates its sidebar check mark on the same page, live", async ({
  page,
}) => {
  await page.goto("/learn/fx/M90.1/components-one");
  const sidebarLink = page
    .locator("aside nav[aria-labelledby]")
    .getByRole("link", { name: /Text and code components/ });
  await expect(sidebarLink.getByText("Not read yet")).toHaveCount(0);

  await page.getByRole("button", { name: "Mark as read" }).click();
  await expect(sidebarLink.getByText("Read", { exact: true })).toBeVisible();
});

test("the module page's lesson list shows the read check mark after a reload", async ({ page }) => {
  await page.goto("/learn/fx/M90.1/components-one");
  await page.getByRole("button", { name: "Mark as read" }).click();

  await page.goto("/learn/fx/M90.1");
  const lessonRow = page.locator("[data-ui]").filter({ hasText: "Text and code components" });
  await expect(lessonRow.getByText("Read", { exact: true })).toBeVisible();
});

test("home page 'Continue where you left off' points at the next unread lesson", async ({
  page,
}) => {
  await page.goto("/learn/fx/M90.1/components-one");
  await page.getByRole("button", { name: "Mark as read" }).click();

  await page.goto("/");
  // The "Continue where you left off" label is a sibling <p>, not inside the <a> itself
  // (components/ui/ContinueBlock.tsx) — see the same note on the home-page spec in
  // navigation.spec.ts.
  await expect(page.getByText("Continue where you left off")).toBeVisible();
  // The next lesson after components-one in course order is components-two (same module).
  const continueLink = page.getByRole("link", { name: /Tracing a program line by line/ });
  await expect(continueLink).toBeVisible();
  await expect(continueLink).toHaveAttribute("href", "/learn/fx/M90.1/components-two");
});

test.describe("blocked localStorage", () => {
  test.use({
    // Every localStorage access throws, simulating Safari private mode / a blocked-storage
    // browser setting (plan §4.8, A9: "when storage is blocked or cleared the app works the
    // same, minus the check marks").
    storageState: undefined,
  });

  test("marking a lesson read still works optimistically for this page view, with no crash or console error", async ({
    page,
    consoleIssues,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new Error("storage blocked (simulated)");
        },
      });
    });

    await page.goto("/learn/fx/M90.1/components-one");
    const markButton = page.getByRole("button", { name: "Mark as read" });
    await markButton.click();
    await expect(page.getByText(/Marked on/)).toBeVisible();

    expectNoConsoleIssues(consoleIssues);

    // Nothing persisted (storage was blocked): a fresh load of the same page is unread again,
    // proving the app degraded gracefully rather than silently caching in a way that would
    // desync from a real blocked-storage browser.
    await page.reload();
    await expect(page.getByRole("button", { name: "Mark as read" })).toBeVisible();
    expectNoConsoleIssues(consoleIssues);
  });
});
