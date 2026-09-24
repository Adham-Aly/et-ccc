// tests/unit/routes.test.ts — route-list completeness (batch 3 item 2, plan §7 G-E2E): fails
// the build if `app/`'s actual static page tree and tests/support/smoke-routes.ts's maintained
// list drift apart, in either direction — a route removed from `app/` without updating the list,
// or a route added to `app/` without adding it to the list (so it would silently never get an
// E2E/visual/a11y pass). Dynamic `[segment]` routes are checked separately, against the same
// content-driven source of truth the app itself uses (lib/content/course.ts), not a hardcoded
// list — see smoke-routes.ts's header.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllLessonRouteParams, getAllModuleRouteParams } from "../../lib/content/course";
import { DYNAMIC_ROUTE_SHAPES, STATIC_ROUTES } from "../support/smoke-routes";

const appDir = path.join(process.cwd(), "app");

/** Every `page.tsx` under app/, as a route-shape string (`[stage]` segments kept literal). */
function walkPages(dir: string, base = ""): string[] {
  const out: string[] = [];
  if (base === "" && fs.existsSync(path.join(dir, "page.tsx"))) {
    out.push("/"); // app/page.tsx itself — the root, not caught by the loop below
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    const routeSegment = `${base}/${entry.name}`;
    if (fs.existsSync(path.join(full, "page.tsx"))) {
      out.push(routeSegment);
    }
    out.push(...walkPages(full, routeSegment));
  }
  return out;
}

describe("route-list completeness (STATIC_ROUTES vs app/)", () => {
  it("every STATIC_ROUTES entry's file actually exists", () => {
    for (const route of STATIC_ROUTES) {
      const full = path.join(process.cwd(), route.file);
      expect(fs.existsSync(full), `${route.file} (for ${route.path}) does not exist`).toBe(true);
    }
  });

  it("every non-dynamic app/**/page.tsx is listed in STATIC_ROUTES", () => {
    const actualStaticShapes = walkPages(appDir).filter((shape) => !shape.includes("["));
    const listedShapes = STATIC_ROUTES.map((r) => r.path);
    const missing = actualStaticShapes.filter((shape) => !listedShapes.includes(shape));
    expect(
      missing,
      `app/ has static page(s) not listed in tests/support/smoke-routes.ts: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("every STATIC_ROUTES path corresponds to a real static app/**/page.tsx", () => {
    const actualStaticShapes = new Set(walkPages(appDir).filter((shape) => !shape.includes("[")));
    const stale = STATIC_ROUTES.map((r) => r.path).filter((p) => !actualStaticShapes.has(p));
    expect(
      stale,
      `tests/support/smoke-routes.ts lists route(s) with no matching app/**/page.tsx: ${stale.join(", ")}`,
    ).toEqual([]);
  });

  it("every dynamic app/**/page.tsx route shape is one of DYNAMIC_ROUTE_SHAPES", () => {
    const actualDynamicShapes = walkPages(appDir).filter((shape) => shape.includes("["));
    const missing = actualDynamicShapes.filter(
      (shape) => !(DYNAMIC_ROUTE_SHAPES as readonly string[]).includes(shape),
    );
    expect(
      missing,
      `app/ has dynamic page(s) not listed in DYNAMIC_ROUTE_SHAPES: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("home, glossary, problems, about, start, search and both dev pages are all present", () => {
    // A deliberately explicit, human-checkable list (plan §4.10) — belt-and-suspenders on top of
    // the structural walk above, so a future refactor that keeps *a* page.tsx under the right
    // directory but renames the directory itself still gets caught here.
    const required = [
      "/",
      "/learn",
      "/problems",
      "/glossary",
      "/start",
      "/about",
      "/search",
      "/dev/design",
      "/dev/viz",
    ];
    const listed = STATIC_ROUTES.map((r) => r.path);
    for (const p of required) {
      expect(listed, `${p} is missing from STATIC_ROUTES`).toContain(p);
    }
  });

  it("the fixture course's module and lesson routes resolve through the content-driven source of truth", () => {
    // Sanity check that the dynamic-route generators actually run and produce something (in
    // preview mode, the fixture course mounts as stage "fx" — lib/content/course.ts) rather than
    // silently returning []; the real per-content routes aren't hardcoded here (see module
    // header) since P5 authors them.
    const modules = getAllModuleRouteParams();
    const lessons = getAllLessonRouteParams();
    expect(modules.length, "getAllModuleRouteParams() returned no routes at all").toBeGreaterThan(
      0,
    );
    expect(lessons.length, "getAllLessonRouteParams() returned no routes at all").toBeGreaterThan(
      0,
    );
    expect(modules.some((m) => m.stage === "fx")).toBe(true);
    expect(lessons.some((l) => l.stage === "fx")).toBe(true);
  });
});
