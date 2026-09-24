import { describe, expect, it } from "vitest";
import { readingMinutes } from "../../../lib/content/reading-time";

describe("readingMinutes", () => {
  it("returns a minimum of 1 for very short prose", () => {
    expect(readingMinutes("A short lesson.")).toBe(1);
  });

  it("rounds word count / 200", () => {
    const words = Array.from({ length: 450 }, () => "word").join(" ");
    expect(readingMinutes(words)).toBe(Math.round(450 / 200));
  });

  it("excludes frontmatter and fenced code from the word count", () => {
    const mdx = `---\ntitle: X\n---\n\nOne two three.\n\n\`\`\`python\nfor i in range(1000):\n    print(i)\n\`\`\`\n`;
    // Only "One two three." should count (3 words) -> min 1 minute either way, but the fence
    // shouldn't be able to push a short lesson over its natural minute count.
    expect(readingMinutes(mdx)).toBe(1);
  });
});
