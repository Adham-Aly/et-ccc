import { describe, expect, it } from "vitest";
import {
  CCC_MAX_YEAR,
  CCC_MIN_YEAR,
  deriveSlug,
  judgeForYear,
  judgeLinkUrl,
  judgeUrl,
} from "../../../lib/registry/judge-url";

describe("judgeForYear", () => {
  it("routes 2014-2020 to DMOJ", () => {
    for (const year of [2014, 2015, 2018, 2020]) {
      expect(judgeForYear(year)).toBe("dmoj");
    }
  });

  it("routes 2021-2026 to WMOJ", () => {
    for (const year of [2021, 2023, 2026]) {
      expect(judgeForYear(year)).toBe("wmoj");
    }
  });

  it("the 2020/2021 boundary switches judges", () => {
    expect(judgeForYear(2020)).toBe("dmoj");
    expect(judgeForYear(2021)).toBe("wmoj");
  });

  it("throws for a year before 2014 (the 2013/2014 boundary)", () => {
    expect(() => judgeForYear(2013)).toThrow(RangeError);
    expect(() => judgeForYear(CCC_MIN_YEAR)).not.toThrow();
  });

  it("throws for a year after 2026 (the 2026/2027 boundary) — permanent, not a placeholder", () => {
    expect(() => judgeForYear(2027)).toThrow(RangeError);
    expect(() => judgeForYear(CCC_MAX_YEAR)).not.toThrow();
  });
});

describe("judgeUrl", () => {
  it("builds a WMOJ URL: plural path, no trailing slash", () => {
    expect(judgeUrl("ccc23s1", 2023)).toBe("https://wmoj.ca/problems/ccc23s1");
  });

  it("builds a DMOJ URL: singular path, trailing slash", () => {
    expect(judgeUrl("ccc19j4", 2019)).toBe("https://dmoj.ca/problem/ccc19j4/");
  });

  it("never emits a wmoj.ca URL for <=2020", () => {
    expect(judgeUrl("ccc20s2", 2020)).not.toContain("wmoj.ca");
  });

  it("never emits a dmoj.ca URL for 2021-2026", () => {
    expect(judgeUrl("ccc21s2", 2021)).not.toContain("dmoj.ca");
  });

  it("throws outside 2014-2026", () => {
    expect(() => judgeUrl("ccc13j1", 2013)).toThrow();
    expect(() => judgeUrl("ccc27j1", 2027)).toThrow();
  });
});

describe("judgeLinkUrl", () => {
  it("returns judge home and sign-up links", () => {
    expect(judgeLinkUrl("wmoj", "home")).toBe("https://wmoj.ca/");
    expect(judgeLinkUrl("dmoj", "home")).toBe("https://dmoj.ca/");
    expect(judgeLinkUrl("wmoj", "signup")).toContain("wmoj.ca");
    expect(judgeLinkUrl("dmoj", "signup")).toContain("dmoj.ca");
  });
});

describe("deriveSlug", () => {
  it("derives ccc<YY><level><number>", () => {
    expect(deriveSlug(2023, "S", 1)).toBe("ccc23s1");
    expect(deriveSlug(2014, "J", 4)).toBe("ccc14j4");
    expect(deriveSlug(2009, "J", 1)).toBe("ccc09j1");
  });
});
