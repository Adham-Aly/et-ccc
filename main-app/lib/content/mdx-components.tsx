// lib/content/mdx-components.tsx — the fixed MDX component map (plan §4.6.1, brief §4). Authors
// never import: every name below is all that is available inside a lesson .mdx file. Anything
// else fails the build (unresolved MDX component references throw at render time, which SSG hits
// during `next build` since every route is static, plan §4.1) — and, before that, fails
// content:check's static G-SCHEMA check (design-review.md A1-4), which reads the same key list
// from ./mdx-component-names.ts (a plain-data module, kept in sync with the object below by
// tests/unit/content/mdx-component-names.test.ts) since it cannot load this file's JSX.
import fs from "node:fs";
import type { ReactNode } from "react";
import {
  Callout,
  JudgeLink as JudgeLinkImpl,
  OutputPanel,
  Practice as PracticeImpl,
  ProblemLink as ProblemLinkImpl,
  Term as TermImpl,
} from "../../components/content";
import { CodeBlock } from "../../components/content/CodeBlock";
import { Details } from "../../components/content/Details";
import { createVizComponents } from "../../components/viz";
import type { Judge } from "../registry/judge-url";
import { fencedCodeBlock, resolveFileCodeBlock, resolveModulePath } from "./code-block-data";
import { getGlossaryTerm } from "./glossary";
import { getExternalLink, resolvePracticeItem } from "./registry";
import type { PracticeItemView } from "./types";

export interface MdxComponentsOptions {
  /** Absolute path to the lesson's module directory (examples/, visuals/ live under it). */
  moduleDir: string;
  /** Resolved practice list for this module, rendered by a bare `<Practice />`. */
  practiceItems?: PracticeItemView[];
}

function childrenToText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  return "";
}

/** Builds the fixed component map for one lesson's compile (brief §4). Each call is bound to
 * that lesson's module directory and resolved practice list via closures — safe under
 * concurrent compiles in the same process (no shared mutable state). */
export function createMdxComponents({ moduleDir, practiceItems = [] }: MdxComponentsOptions) {
  const viz = createVizComponents(moduleDir);

  function CodeTag(props: {
    file?: string;
    lines?: string;
    highlight?: string;
    caption?: string;
    showOutput?: boolean;
    expectError?: string;
    lang?: string;
    variant?: "normal" | "bad38";
    /** Set by remark-fenced-code.ts as an attribute (never JSX children — see its comment: JSX
     * children text is whitespace-cleaned at compile time, which strips indentation). */
    code?: string;
    children?: ReactNode;
  }) {
    const data = props.file
      ? resolveFileCodeBlock(moduleDir, {
          file: props.file,
          lines: props.lines,
          highlight: props.highlight,
          caption: props.caption,
          showOutput: props.showOutput,
          expectError: props.expectError,
        })
      : fencedCodeBlock(
          props.code ?? childrenToText(props.children),
          props.lang ?? "python",
          props.variant ?? "normal",
        );
    return <CodeBlock {...data} />;
  }

  function OutputTag({ file }: { file: string }) {
    const filePath = resolveModulePath(moduleDir, file);
    const output = fs.readFileSync(filePath, "utf8");
    return <OutputPanel output={output} />;
  }

  function TermTag({ id, children }: { id: string; children: ReactNode }) {
    const entry = getGlossaryTerm(id);
    if (!entry) throw new Error(`<Term id="${id}"> has no entry in glossary.yaml`);
    return (
      <TermImpl
        id={id}
        term={entry.term}
        definition={entry.definition}
        glossaryHref={`/glossary#${id}`}
      >
        {children}
      </TermImpl>
    );
  }

  function ProblemLinkTag({ id }: { id: string }) {
    const { problem } = resolvePracticeItem(id);
    return <ProblemLinkImpl problem={problem} />;
  }

  function PracticeTag() {
    return <PracticeImpl items={practiceItems} />;
  }

  function JudgeLinkTag({
    judge,
    kind,
    children,
  }: {
    judge: Judge;
    kind: "home" | "signup";
    children?: ReactNode;
  }) {
    // Judge home/sign-up URLs go through external-links.yaml only (design-review.md A1-2, plan
    // §4.7) — never lib/registry/judge-url.ts, which builds problem URLs only.
    const { url: href } = getExternalLink(`${judge}-${kind}`);
    return (
      <JudgeLinkImpl judge={judge} kind={kind} href={href}>
        {children}
      </JudgeLinkImpl>
    );
  }

  return {
    Callout,
    Term: TermTag,
    Details,
    Code: CodeTag,
    Output: OutputTag,
    ProblemLink: ProblemLinkTag,
    Practice: PracticeTag,
    JudgeLink: JudgeLinkTag,
    // DraftBadge/ComingSoon deliberately NOT exposed to authors (design-review.md A1-4): they
    // aren't in brief §4's MDX component contract, and an author must never be able to place a
    // Draft badge — that's derived from a module's status, not something a lesson decides.
    ...viz,
  };
}

// External link helper for future use by components that need external-links.yaml directly.
export { getExternalLink };
