import type { CSSProperties, ReactNode } from "react";
import { useId } from "react";
import { ui } from "@/components/ui/ui-strings";

export interface TermProps {
  /** Glossary id. */
  id: string;
  /** Term as written in the glossary (popover heading). */
  term: string;
  definition: ReactNode;
  glossaryHref: string;
  /** The text as it appears in the sentence. */
  children: ReactNode;
}

/**
 * Glossary term (DESIGN.md → Term): a dotted-underlined button that opens a native popover with
 * the definition. No JS: `popovertarget` + `popover="auto"` (light dismiss, Escape).
 */
export function Term({ id, term, definition, glossaryHref, children }: TermProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const popId = `term-${id}-${uid}`;
  const anchor = `--term-${uid}`;
  return (
    <>
      <button
        type="button"
        popoverTarget={popId}
        className="term-trigger"
        style={{ anchorName: anchor } as CSSProperties}
      >
        {children}
      </button>
      <span
        id={popId}
        popover="auto"
        role="dialog"
        aria-label={term}
        className="term-pop"
        style={{ positionAnchor: anchor } as CSSProperties}
      >
        <span className="block font-bold text-ink text-ui">{term}</span>
        <span className="mt-1 block text-ink text-small">{definition}</span>
        <a href={glossaryHref} className="mt-2 inline-block text-small" data-plain="">
          {ui().term.inGlossary}
        </a>
      </span>
    </>
  );
}
