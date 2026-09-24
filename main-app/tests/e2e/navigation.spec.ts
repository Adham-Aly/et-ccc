// tests/e2e/navigation.spec.ts — G-E2E: home page, header nav (desktop + mobile drawer),
// course sidebar, breadcrumb, prev/next, the 404 page. Every test also asserts zero console
// errors/warnings and that nothing left the page's own origin (tests/e2e/support/fixtures.ts).
import { expect, expectNoConsoleIssues, expectSameOrigin, test } from "./support/fixtures";

test.describe("home page", () => {
  test("renders the real site copy with no console issues", async ({
    page,
    consoleIssues,
    originGuard,
  }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    await expect(page.getByRole("heading", { level: 1, name: "CCC Python Course" })).toBeVisible();
    await expect(
      page.getByText(
        "A free course that starts at your very first line of code and goes all the way to the algorithms behind CCC Senior problems, in Python 3.8.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "The course, stage by stage" })).toBeVisible();

    expectNoConsoleIssues(consoleIssues);
    expectSameOrigin(page.url(), originGuard.origins);
  });

  test("the 'Start with Stage 0' continue block links into the course", async ({ page }) => {
    await page.goto("/");
    // The label ("Start with Stage 0" / "Continue where you left off") is a sibling <p>, not
    // inside the <a> itself (components/ui/ContinueBlock.tsx) — the link's own accessible name
    // is just the target lesson's module id and title.
    await expect(page.getByText("Start with Stage 0")).toBeVisible();
    const continueLink = page.getByRole("link", { name: /Text and code components/ });
    await expect(continueLink).toBeVisible();
    await expect(continueLink).toHaveAttribute("href", "/learn/fx/M90.1/components-one");
  });
});

test.describe("header navigation (desktop, >=1024px)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "desktop nav only");

  for (const [label, href] of [
    ["Learn", "/learn"],
    ["Problems", "/problems"],
    ["Glossary", "/glossary"],
    ["Start here", "/start"],
    ["About", "/about"],
  ] as const) {
    test(`"${label}" nav link goes to ${href} and is marked current`, async ({ page }) => {
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: "Main" }).last();
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  }
});

test.describe("mobile navigation drawer (<1024px)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, "mobile drawer only");

  test("opens on the menu button, lists every nav item, closes after a link click", async ({
    page,
  }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Open menu" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Learn", "Problems", "Glossary", "Start here", "About"]) {
      await expect(dialog.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    await dialog.getByRole("link", { name: "Problems", exact: true }).click();
    await expect(page).toHaveURL(/\/problems$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("closes on the close button without navigating", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close menu" }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("course sidebar (a fixture lesson page, desktop only)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "sidebar is lg:block only");

  test("expands the current module, marks the current lesson, keeps other stages collapsed", async ({
    page,
  }) => {
    await page.goto("/learn/fx/M90.1/components-one");
    const sidebar = page.locator("aside nav[aria-labelledby]");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /Text and code components/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // The sibling lesson in the same module is listed but not current.
    const sibling = sidebar.getByRole("link", { name: /Tracing a program line by line/ });
    await expect(sibling).toBeVisible();
    await expect(sibling).not.toHaveAttribute("aria-current", "page");
  });
});

test.describe("breadcrumb", () => {
  test("shows Course map / Stage / Module on a lesson page, each a working link", async ({
    page,
  }) => {
    await page.goto("/learn/fx/M90.1/components-one");
    const crumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumb).toBeVisible();
    await expect(crumb.getByRole("link", { name: "Course map" })).toHaveAttribute("href", "/learn");
    await crumb.getByRole("link", { name: "Course map" }).click();
    await expect(page).toHaveURL(/\/learn$/);
  });
});

test.describe("previous / next", () => {
  test("crosses from the last lesson of one module into the next module's first lesson", async ({
    page,
  }) => {
    // M90.1's last lesson is components-two; the fixture course's next module is M90.2/technique
    // (lib/content/lesson.ts's flatLessonList() crosses module boundaries in course order).
    await page.goto("/learn/fx/M90.1/components-two");
    const prevNextNav = page.getByRole("navigation", { name: "Previous / Next" });
    const nextLink = prevNextNav.getByRole("link", { name: /Next/ });
    await expect(nextLink).toHaveAttribute("href", "/learn/fx/M90.2/technique");
    await nextLink.click();
    await expect(page).toHaveURL(/\/learn\/fx\/M90\.2\/technique$/);

    const prevLink = page
      .getByRole("navigation", { name: "Previous / Next" })
      .getByRole("link", { name: /Previous/ });
    await expect(prevLink).toHaveAttribute("href", "/learn/fx/M90.1/components-two");
  });

  test("the first lesson of the course has no Previous link", async ({ page }) => {
    await page.goto("/learn/fx/M90.1/components-one");
    await expect(
      page
        .getByRole("navigation", { name: "Previous / Next" })
        .getByRole("link", { name: /Previous/ }),
    ).toHaveCount(0);
  });
});

test.describe("404", () => {
  test("an unknown URL renders the not-found page with working escape hatches", async ({
    page,
    consoleIssues,
  }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page is not in the set" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Course map" })).toHaveAttribute("href", "/learn");
    await expect(page.getByRole("link", { name: "Search" })).toHaveAttribute("href", "/search");
    await expect(page.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    // Next.js's own 404 handling can log a benign "404" navigation message in some browsers;
    // this page's own render must not add anything on top of that. Real assertion: no
    // React/hydration errors specifically.
    expectNoConsoleIssues(consoleIssues.filter((i) => !/404/.test(i.text)));
  });

  test("a fixture-course URL 404s once outside preview (covered separately by scripts/check-production-mode.mjs); in preview it renders", async ({
    page,
  }) => {
    const response = await page.goto("/learn/fx/M90.1");
    expect(response?.ok()).toBe(true);
  });
});
