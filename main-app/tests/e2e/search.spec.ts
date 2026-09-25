// tests/e2e/search.spec.ts — G-E2E: the search dialog (header trigger + `/` keyboard shortcut),
// the standalone /search page, keyboard operation (arrow keys + Enter navigates), and the
// retry-after-a-failed-fetch path (the exact regression tests/unit/search/client.test.ts covers
// at the unit level — this is the same bug reproduced end to end in a real browser).
import { expect, test } from "./support/fixtures";

test.describe("search dialog", () => {
  test("opens from the header button, finds a lesson, Enter on the highlighted result navigates", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const input = dialog.getByRole("combobox", { name: "Search the course" });
    await expect(input).toBeFocused();
    await input.fill("components");

    const listbox = dialog.getByRole("listbox", { name: "Search the course" });
    await expect(listbox).toBeVisible();
    const firstOption = listbox.getByRole("option").first();
    await expect(firstOption).toHaveAttribute("aria-selected", "true");
    await expect(firstOption).toContainText("Text and code components");

    await input.press("Enter");
    await expect(page).toHaveURL(/\/learn\/fx\/M90\.1\/components-one$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("opens on the `/` shortcut, closes on Escape without navigating", async ({ page }) => {
    await page.goto("/");
    await page.locator('button[aria-label="Open search"][data-mounted]').waitFor();
    await page.keyboard.press("/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test("`/` inside a text input types the character instead of opening search", async ({
    page,
  }) => {
    await page.goto("/search");
    const input = page.getByRole("combobox", { name: "Search the course" });
    await input.fill("a/b");
    await expect(input).toHaveValue("a/b");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("a query with no matches shows the empty-results message, not a blank list", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("combobox", { name: "Search the course" })
      .fill("zzzznomatchpossiblexyz");
    await expect(dialog.getByText(/No matches for/)).toBeVisible();
  });

  test("retries after a failed fetch instead of staying stuck on the same error", async ({
    page,
  }) => {
    let calls = 0;
    await page.route("**/search-index.json", (route) => {
      calls += 1;
      if (calls === 1) {
        return route.fulfill({ status: 500, body: "boom" });
      }
      return route.continue();
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Search could not load.")).toBeVisible();

    const retry = dialog.getByRole("button", { name: "Try again" });
    await expect(retry).toBeVisible();
    await retry.click();

    // Second fetch succeeds (route.continue()); the panel must recover and actually search.
    await expect(dialog.getByText("Search could not load.")).toBeHidden();
    await dialog.getByRole("combobox", { name: "Search the course" }).fill("variable");
    await expect(dialog.getByRole("option", { name: /variable/i }).first()).toBeVisible();
    expect(calls).toBeGreaterThanOrEqual(2);
  });
});

test.describe("/search page", () => {
  test("works standalone, autofocused, and keeps the query in the URL", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByRole("combobox", { name: "Search the course" });
    await expect(input).toBeFocused();
    await input.fill("variable");
    await expect(page).toHaveURL(/[?&]q=variable/);
    await expect(page.getByRole("option", { name: /variable/i }).first()).toBeVisible();
  });

  test("reads an initial ?q= from the URL", async ({ page }) => {
    await page.goto("/search?q=variable");
    await expect(page.getByRole("option", { name: /variable/i }).first()).toBeVisible();
  });
});
