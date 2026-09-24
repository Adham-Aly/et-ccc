// tests/support/smoke-routes.ts — the maintained route list G-E2E's specs walk and
// tests/unit/routes.test.ts checks against the actual `app/` tree (batch 3 item 2: "a route-list
// completeness check — the build fails if a route is missing"). Two kinds of route:
//
//   - STATIC_ROUTES / DEV_ROUTES: every fixed top-level page (brief §4.10), each mapped to the
//     `app/**/page.tsx` file that must exist for it. tests/unit/routes.test.ts walks `app/` and
//     fails if a static page.tsx exists that isn't listed here, or if a listed file doesn't
//     exist — either direction of drift is a bug.
//   - Dynamic module/lesson routes are NOT hardcoded here: they come from the content-driven
//     source of truth (lib/content/course.ts's getAllModuleRouteParams/getAllLessonRouteParams),
//     since content grows in P5 and a hardcoded list would immediately go stale. G-E2E specs
//     iterate those functions directly instead.
export interface StaticRoute {
  /** URL path, relative to the app root. */
  path: string;
  /** `app/` file that must exist for this route (relative to main-app/). */
  file: string;
  /** Mounted only outside a production build (lib/content/env.ts getBuildEnv()). */
  devOnly?: boolean;
}

export const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", file: "app/page.tsx" },
  { path: "/learn", file: "app/learn/page.tsx" },
  { path: "/problems", file: "app/problems/page.tsx" },
  { path: "/glossary", file: "app/glossary/page.tsx" },
  { path: "/start", file: "app/start/page.tsx" },
  { path: "/about", file: "app/about/page.tsx" },
  { path: "/search", file: "app/search/page.tsx" },
  { path: "/dev/design", file: "app/dev/design/page.tsx", devOnly: true },
  { path: "/dev/viz", file: "app/dev/viz/page.tsx", devOnly: true },
];

/** Dynamic route *shapes* (not the routes themselves — see the module header). */
export const DYNAMIC_ROUTE_SHAPES = [
  "/learn/[stage]/[module]",
  "/learn/[stage]/[module]/[lesson]",
] as const;
