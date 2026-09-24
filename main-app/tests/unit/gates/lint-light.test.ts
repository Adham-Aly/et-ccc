import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkUiLight } from "../../../scripts/gates/lint-light.mjs";

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const mainAppRoot = path.resolve(testFileDir, "..", "..", "..");

describe("G-UI-LIGHT", () => {
  it("fails on the fixture (dark: class, prefers-color-scheme: dark, dark theme import)", () => {
    const fixtureDir = path.join(mainAppRoot, "tests/fixtures/gates/G-UI-LIGHT");
    const violations = checkUiLight([fixtureDir]);

    const rules = violations.map((v) => v.rule).sort();
    expect(rules).toEqual(["dark-class", "dark-theme-import", "prefers-dark"].sort());
  });

  it("passes on the real tree (app, components, lib, content, tests/fixtures/content)", () => {
    const dirs = ["app", "components", "lib", "content", "tests/fixtures/content"].map((d) =>
      path.join(mainAppRoot, d),
    );
    const violations = checkUiLight(dirs);
    expect(violations).toEqual([]);
  });
});
