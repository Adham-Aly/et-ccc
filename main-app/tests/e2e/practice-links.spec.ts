// tests/e2e/practice-links.spec.ts — G-E2E: every rendered practice link's `href` equals
// `judgeUrl()` for its *canonical* registry id (R13/D-020 — a crossover problem is registered
// once under its Senior slug, so the Junior alias's link still points at the Senior URL), the
// judge badge/label match, the crossover "(same problem as …)" text renders, links open in a
// new tab (`target="_blank" rel="noopener noreferrer"`), and clicking one never actually
// navigates the browser context off-origin (plan §7 G-E2E "no request leaves the origin").
import { judgeUrl } from "../../lib/registry/judge-url";
import { expect, test } from "./support/fixtures";

const LESSON_URL = "/learn/fx/M90.2/technique";

test("WMOJ pick: href, badge and open-in-new-tab are all correct", async ({ page }) => {
  await page.goto(LESSON_URL);
  const practice = page.getByRole("region", { name: "Practice" });
  await expect(practice).toBeVisible();

  const row = practice.locator("li", { hasText: "Deliv-e-droid" });
  const link = row.getByRole("link", { name: /Deliv-e-droid/ });
  await expect(link).toHaveAttribute("href", judgeUrl("ccc23j1", 2023));
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(row.getByText("WMOJ", { exact: true })).toBeVisible();
});

test("DMOJ pick (older, justified with 'why'): href and badge are correct", async ({ page }) => {
  await page.goto(LESSON_URL);
  const practice = page.getByRole("region", { name: "Practice" });
  const row = practice.locator("li", { hasText: "Winning Score" });
  const link = row.getByRole("link", { name: /Winning Score/ });
  await expect(link).toHaveAttribute("href", judgeUrl("ccc19j1", 2019));
  await expect(row.getByText("DMOJ", { exact: true })).toBeVisible();
  await expect(row.getByText(/Extra practice once the WMOJ pick/)).toBeVisible();
});

test("crossover pick: links to the canonical Senior slug's URL, not the Junior alias, and shows 'same problem as'", async ({
  page,
}) => {
  await page.goto(LESSON_URL);
  const practice = page.getByRole("region", { name: "Practice" });
  const row = practice.locator("li", { hasText: "Good Groups" });
  const link = row.getByRole("link", { name: /Good Groups/ });
  // Registered once under ccc22s2 (Senior); ccc22j4 (the Junior alias used in module.yaml) must
  // never appear as a raw judge URL segment.
  await expect(link).toHaveAttribute("href", judgeUrl("ccc22s2", 2022));
  const href = await link.getAttribute("href");
  expect(href).not.toContain("ccc22j4");
  await expect(row.getByText(/same problem as 2022 S2/)).toBeVisible();
});

test("clicking a practice link opens the right judge URL in a new tab without this test suite making a real external request", async ({
  page,
  context,
}) => {
  // The link is real and correct (asserted above by href === judgeUrl()); actually letting the
  // browser reach wmoj.ca/dmoj.ca from an automated run would be slow, flaky, and a real
  // external request no test should make. Block the judge domains at the network layer instead
  // — the popup's navigation is still attempted (proving `target="_blank"` really opens a new
  // tab for the right URL) but never completes (plan §7 G-E2E "no request leaves the origin").
  let blockedUrl: string | null = null;
  await context.route(/^https:\/\/(wmoj|dmoj)\.ca\//, (route) => {
    blockedUrl = route.request().url();
    return route.abort();
  });

  await page.goto(LESSON_URL);
  const practice = page.getByRole("region", { name: "Practice" });
  const link = practice.getByRole("link", { name: /Deliv-e-droid/ });

  const pagesBefore = context.pages().length;
  const [popup] = await Promise.all([
    context.waitForEvent("page", { timeout: 5_000 }).catch(() => null),
    link.click(),
  ]);
  // This test's own page stays put; only a new tab/popup was targeted.
  await expect(page).toHaveURL(new RegExp(`${LESSON_URL.replace(/\./g, "\\.")}$`));
  if (popup) {
    expect(context.pages().length).toBeGreaterThan(pagesBefore);
    await popup.close();
  }
  expect(blockedUrl).toBe(judgeUrl("ccc23j1", 2023));
});
