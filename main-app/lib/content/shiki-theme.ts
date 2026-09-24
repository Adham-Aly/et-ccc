// The one Shiki light theme (plan §4.4, brief A7/A10), built from the syntax tokens in
// main-app/DESIGN.md ("Colors → Syntax", "Components → Code block") and app/globals.css
// (`--color-syn-*`). Change a colour there first, then here; the design review checks they match.
// Every foreground meets WCAG AA on sheet-sunk (#f3f6f8) and on check-soft (#fef5c7) highlights:
// lowest is the comment colour at 5.44:1. No italics anywhere in code.
import type { ThemeRegistration } from "shiki";

export const SYNTAX = {
  background: "#f3f6f8", // --color-paper-sunk
  foreground: "#172127", // --color-ink
  keyword: "#29519f", // --color-syn-keyword
  string: "#1f6538", // --color-syn-string
  number: "#954717", // --color-syn-number
  builtin: "#156165", // --color-syn-builtin
  comment: "#5b656b", // --color-syn-comment
  punct: "#414c53", // --color-syn-punct
  invalid: "#b72725", // --color-redline
} as const;

export const shikiTheme: ThemeRegistration = {
  name: "drafting-light",
  type: "light",
  colors: {
    "editor.background": SYNTAX.background,
    "editor.foreground": SYNTAX.foreground,
  },
  fg: SYNTAX.foreground,
  bg: SYNTAX.background,
  tokenColors: [
    { settings: { foreground: SYNTAX.foreground } },
    {
      scope: ["comment", "punctuation.definition.comment", "string.quoted.docstring"],
      settings: { foreground: SYNTAX.comment, fontStyle: "" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "keyword.control",
        "keyword.operator.logical.python",
        "keyword.operator.logical",
        "keyword.operator.in",
        "keyword.operator.is",
        "keyword.operator.new",
        "constant.character.format.placeholder",
        "punctuation.definition.template-expression",
        "meta.fstring.python punctuation.definition.fstring",
        "storage.type.format",
      ],
      settings: { foreground: SYNTAX.keyword, fontStyle: "" },
    },
    {
      scope: ["string", "string.quoted", "punctuation.definition.string", "storage.type.string"],
      settings: { foreground: SYNTAX.string },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.other"],
      settings: { foreground: SYNTAX.number },
    },
    {
      scope: [
        "support.function.builtin",
        "support.function",
        "support.type",
        "support.type.exception",
        "entity.name.type",
        "support.variable.magic",
      ],
      settings: { foreground: SYNTAX.builtin },
    },
    {
      scope: ["entity.name.function", "meta.function.python entity.name.function"],
      settings: { foreground: SYNTAX.foreground, fontStyle: "bold" },
    },
    {
      scope: [
        "meta.function-call.generic",
        "meta.function-call entity.name.function",
        "variable",
        "variable.parameter",
        "variable.language.special.self",
      ],
      settings: { foreground: SYNTAX.foreground, fontStyle: "" },
    },
    {
      scope: ["keyword.operator", "punctuation", "meta.brace", "punctuation.separator"],
      settings: { foreground: SYNTAX.punct },
    },
    {
      scope: ["meta.fstring.python", "meta.format.brace"],
      settings: { foreground: SYNTAX.string },
    },
    {
      scope: [
        "meta.fstring.python meta.embedded",
        "meta.fstring.python source",
        "meta.embedded.expression",
      ],
      settings: { foreground: SYNTAX.foreground },
    },
    {
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: SYNTAX.invalid, fontStyle: "underline" },
    },
  ],
};
