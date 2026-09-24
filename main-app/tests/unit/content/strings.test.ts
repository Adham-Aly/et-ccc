import { describe, expect, it } from "vitest";
import { getUiStrings } from "../../../lib/content/strings";

describe("getUiStrings", () => {
  it("loads and validates content/ui/strings.yaml", () => {
    const strings = getUiStrings();
    expect(strings.siteName).toBe("CCC Python Course");
    expect(strings.home.lede.length).toBeGreaterThan(0);
    expect(strings.home.how.length).toBeGreaterThan(0);
    expect(strings.notFound.cell).toBeTruthy();
    expect(strings.practice.judgeHome).toBeTruthy();
  });
});
