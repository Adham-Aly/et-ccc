import { describe, expect, it } from "vitest";
import { numberFigures } from "../../../lib/viz/remark-figure-numbers";

type MdNode = Parameters<typeof numberFigures>[0];
type Attr = { type: string; name: string; value: string };

const fig = (children: MdNode[] = []) => ({
  type: "mdxJsxFlowElement",
  name: "Figure",
  attributes: [{ type: "mdxJsxAttribute", name: "caption", value: "c" }] as Attr[],
  children,
});

describe("remarkFigureNumbers", () => {
  it("numbers figures in document order, including nested ones", () => {
    const a = fig();
    const b = fig();
    const c = fig();
    const tree = {
      type: "root",
      children: [a, { type: "paragraph", children: [b] }, { type: "blockquote", children: [c] }],
    };
    expect(numberFigures(tree)).toBe(3);
    const num = (n: typeof a) => n.attributes.find((x) => x.name === "number")?.value;
    expect([num(a), num(b), num(c)]).toEqual(["1", "2", "3"]);
  });

  it("ignores other elements", () => {
    const tree = {
      type: "root",
      children: [{ type: "mdxJsxFlowElement", name: "Callout", attributes: [], children: [] }],
    };
    expect(numberFigures(tree)).toBe(0);
  });

  it("rejects a hand-typed number", () => {
    const f = fig();
    f.attributes.push({ type: "mdxJsxAttribute", name: "number", value: "4" });
    expect(() => numberFigures({ type: "root", children: [f] })).toThrow(/automatic/);
  });
});
