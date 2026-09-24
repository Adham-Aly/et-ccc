import { describe, expect, it } from "vitest";
import { captionParts, plainCaption } from "../../../lib/viz/caption";

describe("caption code spans", () => {
  it("splits backtick pairs into code parts and nothing else", () => {
    expect(captionParts("Line 15 calls `total_of` with `values = [3, 1]`.")).toEqual([
      { code: false, text: "Line 15 calls " },
      { code: true, text: "total_of" },
      { code: false, text: " with " },
      { code: true, text: "values = [3, 1]" },
      { code: false, text: "." },
    ]);
  });

  it("leaves unpaired backticks, markup look-alikes and HTML as literal text", () => {
    expect(captionParts("a ` b")).toEqual([{ code: false, text: "a ` b" }]);
    expect(captionParts("**bold** <b>x</b>")).toEqual([{ code: false, text: "**bold** <b>x</b>" }]);
    expect(captionParts("`<script>`")).toEqual([{ code: true, text: "<script>" }]);
  });

  it("gives G-VIZ and labels the plain text", () => {
    expect(plainCaption("The entry `(0, A)` goes into the heap.")).toBe(
      "The entry (0, A) goes into the heap.",
    );
  });
});
