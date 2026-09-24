// remarkFigureNumbers: numbers every <Figure> in a lesson in document order (1, 2, 3, …) by
// adding a `number` attribute, so "Figure 3" never has to be typed or kept in sync by hand.
// W1 adds it to the MDX compile's remarkPlugins. An author-set `number` is an error.

interface MdxAttribute {
  type: string;
  name?: string;
  value?: unknown;
}

interface MdNode {
  type: string;
  name?: string | null;
  attributes?: MdxAttribute[];
  children?: MdNode[];
}

export function numberFigures(tree: MdNode): number {
  let count = 0;
  const walk = (node: MdNode) => {
    if (
      (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
      node.name === "Figure"
    ) {
      count += 1;
      const attrs = node.attributes ?? [];
      if (attrs.some((a) => a.type === "mdxJsxAttribute" && a.name === "number")) {
        throw new Error("<Figure> numbers are automatic; remove the number attribute");
      }
      attrs.push({ type: "mdxJsxAttribute", name: "number", value: String(count) });
      node.attributes = attrs;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
  return count;
}

export function remarkFigureNumbers() {
  return (tree: MdNode) => {
    numberFigures(tree);
  };
}
