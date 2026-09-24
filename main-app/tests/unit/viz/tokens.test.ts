// The library colours only through CSS custom properties; this keeps components/viz/tokens.ts in
// step with the token block in app/globals.css (DESIGN.md → Visual Language).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEGEND_ORDER, STATE_META, VIZ_CSS_VARS } from "../../../components/viz/tokens";
import { STATE_CODES } from "../../../lib/viz/schema";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const globals = fs.readFileSync(path.join(appRoot, "app", "globals.css"), "utf8");
const vizCss = fs.readFileSync(path.join(appRoot, "components", "viz", "viz.css"), "utf8");

/** Requested from W2 (work/04-app/requests.md); until then viz.css falls back to another token. */
const PENDING = new Set(["--color-viz-changed"]);

describe("viz tokens", () => {
  it("every custom property the library reads is defined in globals.css", () => {
    for (const name of VIZ_CSS_VARS) {
      if (PENDING.has(name) && !globals.includes(`${name}:`)) {
        expect(vizCss).toMatch(new RegExp(`var\\(${name}, var\\(--[a-z-]+\\)\\)`));
        continue;
      }
      expect(globals, name).toContain(`${name}:`);
    }
  });

  it("viz.css and the SVG primitives use no literal colours", () => {
    const stripped = vizCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(stripped).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/i);
    const prims = fs.readFileSync(
      path.join(appRoot, "components", "viz", "primitives", "index.tsx"),
      "utf8",
    );
    expect(prims).not.toMatch(/["']#[0-9a-f]{3,8}["']|rgba?\(/i);
  });

  it("every state has a legend label, a non-colour cue and a legend position", () => {
    const states = [...Object.values(STATE_CODES).filter((s) => s !== "none"), "changed"];
    for (const s of states) {
      expect(STATE_META[s as keyof typeof STATE_META]?.cue, s).toBeTruthy();
      expect(LEGEND_ORDER).toContain(s);
    }
    expect(new Set(LEGEND_ORDER).size).toBe(LEGEND_ORDER.length);
  });

  it("stays light mode only", () => {
    expect(vizCss).not.toMatch(/prefers-color-scheme:\s*dark/);
  });
});
