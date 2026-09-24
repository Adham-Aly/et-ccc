// tests/e2e/all-pages-clean.spec.ts — G-E2E's two blanket requirements, checked on every route
// the app currently builds (tests/support/smoke-routes.ts's STATIC_ROUTES plus every fixture
// module/lesson from lib/content/course.ts — the same content-driven source generateStaticParams
// itself uses, so this list can never go stale relative to what's actually built): zero console
// errors/warnings, and no request leaves the page's own origin.
import { getAllLessonRouteParams, getAllModuleRouteParams } from "../../lib/content/course";
import { STATIC_ROUTES } from "../support/smoke-routes";
import { expect, expectNoConsoleIssues, expectSameOrigin, test } from "./support/fixtures";

function allRoutes(): string[] {
  const routes = STATIC_ROUTES.map((r) => r.path);
  for (const m of getAllModuleRouteParams()) routes.push(`/learn/${m.stage}/${m.module}`);
  for (const l of getAllLessonRouteParams())
    routes.push(`/learn/${l.stage}/${l.module}/${l.lesson}`);
  return routes;
}

for (const route of allRoutes()) {
  test(`${route}: loads clean (no console errors/warnings, no cross-origin requests)`, async ({
    page,
    consoleIssues,
    originGuard,
  }) => {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} did not respond ok()`).toBe(true);
    // Let any deferred hydration/client work settle before judging the console.
    await page.waitForLoadState("networkidle");
    expectNoConsoleIssues(consoleIssues);
    expectSameOrigin(page.url(), originGuard.origins);
  });
}
