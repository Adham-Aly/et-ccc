// lib/content/toc.ts — a lesson's on-page table of contents: every level-2 heading (the lesson
// title itself is level-1, plan §4.6.3 "objectives, then sections that each introduce one idea").
// Slug ids match rehype-slug's github-slugger closely enough for ASCII headings (our style guide
// keeps headings plain); this is a known approximation for punctuation-heavy edge cases.
import { slugify } from "./slug";
import type { TocItem } from "./types";

export function extractToc(mdxBody: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  for (const line of mdxBody.split("\n")) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (!m?.[1]) continue;
    const text = m[1].replace(/[`*_]/g, "");
    let id = slugify(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ id, text });
  }
  return items;
}
