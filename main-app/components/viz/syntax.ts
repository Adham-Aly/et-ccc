// Map the Shiki theme's hex colours back to the syntax tokens, so the code pane uses
// var(--color-syn-…) like everything else in the library (no literal colours here).
import { SYNTAX } from "@/lib/content/shiki-theme";

const VARS: Record<string, string> = {
  [SYNTAX.foreground.toLowerCase()]: "var(--color-ink)",
  [SYNTAX.keyword.toLowerCase()]: "var(--color-syn-keyword)",
  [SYNTAX.string.toLowerCase()]: "var(--color-syn-string)",
  [SYNTAX.number.toLowerCase()]: "var(--color-syn-number)",
  [SYNTAX.builtin.toLowerCase()]: "var(--color-syn-builtin)",
  [SYNTAX.comment.toLowerCase()]: "var(--color-syn-comment)",
  [SYNTAX.punct.toLowerCase()]: "var(--color-syn-punct)",
  [SYNTAX.invalid.toLowerCase()]: "var(--color-redline)",
};

export function syntaxVar(hex: string | undefined): string | undefined {
  if (hex === undefined) return undefined;
  return VARS[hex.toLowerCase()] ?? "var(--color-ink)";
}
