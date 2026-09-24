// Build-time Python highlighting with the one custom light theme (plan §4.4). Server only:
// imported by the CodeBlock server component; nothing here ships to the browser.

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import python from "shiki/langs/python.mjs";
import { shikiTheme } from "@/lib/content/shiki-theme";

export interface CodeToken {
  content: string;
  color?: string;
  bold?: boolean;
}

let highlighter: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [shikiTheme],
    langs: [python],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Tokenise code into lines of coloured tokens. `lang: "text"` returns plain lines. */
export async function highlightLines(
  code: string,
  lang: "python" | "text",
): Promise<CodeToken[][]> {
  const source = code.replace(/\n$/, "");
  if (lang === "text") {
    return source.split("\n").map((line) => [{ content: line }]);
  }
  const hl = await getHighlighter();
  const lines = hl.codeToTokensBase(source, { lang: "python", theme: shikiTheme.name ?? "" });
  return lines.map((line) =>
    line.map((t) => ({
      content: t.content,
      color: t.color,
      // FontStyle.Bold === 2 in @shikijs/types
      bold: typeof t.fontStyle === "number" && (t.fontStyle & 2) === 2,
    })),
  );
}
