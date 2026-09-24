// tests/e2e/support/fixtures.ts — shared Playwright fixtures for every G-E2E spec (plan §7
// G-E2E: "zero console errors" on every page, "no request leaves the origin").
//
// `consoleIssues`: every `console.error`/`console.warn` message and every uncaught `pageerror`
// collected from the moment the page is created. Specs that need to allow a specific,
// intentional message (e.g. the search-retry spec, which deliberately breaks a fetch) filter the
// array explicitly and say why, rather than this fixture silently swallowing anything — a spec
// that doesn't touch it at all gets a hard implicit expectation via `expectNoConsoleIssues()`.
//
// `originGuard`: records every network request's URL; `expectSameOrigin()` asserts none crossed
// origin. Judge/registry links are real external URLs (wmoj.ca, dmoj.ca) that must render as
// correct `href`s but must never actually be *navigated to* in a test — specs assert `target`/
// `href` and intercept/block the click's navigation instead of letting it leave the browser
// context (plan §7 G-E2E "no request leaves the origin").
import { test as base, expect } from "@playwright/test";

export interface ConsoleIssue {
  kind: "console-error" | "console-warning" | "pageerror";
  text: string;
}

export const test = base.extend<{
  consoleIssues: ConsoleIssue[];
  originGuard: { origins: Set<string> };
}>({
  consoleIssues: async ({ page }, use) => {
    const issues: ConsoleIssue[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") issues.push({ kind: "console-error", text: msg.text() });
      else if (msg.type() === "warning") issues.push({ kind: "console-warning", text: msg.text() });
    });
    page.on("pageerror", (err) => {
      issues.push({ kind: "pageerror", text: err.message });
    });
    await use(issues);
  },
  originGuard: async ({ page }, use) => {
    const origins = new Set<string>();
    page.on("request", (req) => {
      try {
        origins.add(new URL(req.url()).origin);
      } catch {
        // opaque/blob/data URLs — not a cross-origin HTTP request
      }
    });
    await use({ origins });
  },
});

export { expect };

/** Every page's default bar: no console error/warning, no uncaught exception. */
export function expectNoConsoleIssues(issues: ConsoleIssue[]) {
  expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
}

/** Every request this page made must share the page's own origin. */
export function expectSameOrigin(pageUrl: string, origins: Set<string>) {
  const pageOrigin = new URL(pageUrl).origin;
  const foreign = [...origins].filter((o) => o !== pageOrigin);
  expect(foreign, `requests left the origin: ${foreign.join(", ")}`).toEqual([]);
}
