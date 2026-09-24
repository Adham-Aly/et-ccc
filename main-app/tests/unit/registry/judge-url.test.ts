import { describe, expect, it } from "vitest";
import { getExternalLink } from "../../../lib/content/registry";
import {
  CCC_MAX_YEAR,
  CCC_MIN_YEAR,
  deriveSlug,
  judgeForYear,
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

// Judge home/sign-up links live only in content/registry/external-links.yaml (design-review.md
// A1-2, plan §4.7) — lib/registry/judge-url.ts builds problem URLs only, so there's no second
// copy of these to drift out of sync (design-review.md A1-1's broken WMOJ sign-up URL was found
// exactly because it had one).
describe("getExternalLink (judge home/sign-up, the only source for these)", () => {
  it("returns judge home and sign-up links, each on its own domain", () => {
    expect(getExternalLink("wmoj-home").url).toBe("https://wmoj.ca/");
    expect(getExternalLink("dmoj-home").url).toBe("https://dmoj.ca/");
    expect(getExternalLink("wmoj-signup").url).toContain("wmoj.ca");
    expect(getExternalLink("dmoj-signup").url).toContain("dmoj.ca");
  });

  it("the WMOJ sign-up URL is the live-confirmed path, not the 404ing guess (design-review.md A1-1)", () => {
    expect(getExternalLink("wmoj-signup").url).toBe("https://wmoj.ca/auth/signup");
  });
});

describe("deriveSlug", () => {
  it("derives ccc<YY><level><number>", () => {
    expect(deriveSlug(2023, "S", 1)).toBe("ccc23s1");
    expect(deriveSlug(2014, "J", 4)).toBe("ccc14j4");
    expect(deriveSlug(2009, "J", 1)).toBe("ccc09j1");
  });
});
