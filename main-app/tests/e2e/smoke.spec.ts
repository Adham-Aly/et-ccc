import { expect, test } from "@playwright/test";

// Smoke test for the scaffold (plan §12 P4 step 2): the home page renders and produces no
// console errors, on both engines. Extended with the real routes and flows once the reading app
// exists (plan §7 G-E2E).
test("home page renders with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);

  await expect(page.getByRole("heading", { level: 1, name: "et-ccc" })).toBeVisible();
  await expect(
    page.getByText("A free reading course from zero to CCC Senior, in Python 3.8."),
  ).toBeVisible();

  expect(consoleErrors).toEqual([]);
});
