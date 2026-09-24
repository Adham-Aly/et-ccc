// tests/a11y/routes.ts: the page list G-PAGE (tests/a11y) and G-VISUAL pages
// (tests/visual/pages) walk. Static routes come from W1's tests/support/smoke-routes.ts; module
// and lesson routes come from the same content functions generateStaticParams uses, so the list
// follows the built content and never goes stale.
import { getAllLessonRouteParams, getAllModuleRouteParams } from "../../lib/content/course";
import { STATIC_ROUTES } from "../support/smoke-routes";

/** A path that is guaranteed not to exist (renders app/not-found.tsx). */
export const NOT_FOUND_PATH = "/this-page-does-not-exist";

export function moduleRoutes(): string[] {
  return getAllModuleRouteParams().map((m) => `/learn/${m.stage}/${m.module}`);
}

export function lessonRoutes(): string[] {
  return getAllLessonRouteParams().map((l) => `/learn/${l.stage}/${l.module}/${l.lesson}`);
}

/** Every built page: static routes (dev-only ones included; local builds are previews), every
 * module and lesson, and the 404 page. */
export function allPages(): string[] {
  return [
    ...STATIC_ROUTES.map((r) => r.path),
    ...moduleRoutes(),
    ...lessonRoutes(),
    NOT_FOUND_PATH,
  ];
}

/** The localStorage key and value shape of lib/read-state (one key, id -> ISO date). */
export const READ_KEY = "etccc:read:v1";

/** A fixed "marked read" date so screenshots never depend on today's date. */
export const FIXED_READ_AT = "2026-09-01T12:00:00.000Z";

/** The fixture lesson used for every lesson-state check. */
export const STATE_LESSON = "/learn/fx/M90.1/components-one";
export const STATE_LESSON_ID = "M90.1/components-one";
