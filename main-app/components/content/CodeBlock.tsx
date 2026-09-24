import { ArrowDownToLine, ArrowUpFromLine, OctagonAlert, OctagonX } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/components/ui/cn";
import { fmt, ui } from "@/components/ui/ui-strings";
import { highlightLines } from "./highlight";

export interface CodeBlockProps {
  code: string;
  /** "python" (highlighted) or anything else (shown as plain text). */
  lang?: string;
  filename?: string;
  /** Line numbers (in the shown numbering) to highlight. */
  highlight?: number[];
  /** Number of the first shown line (`lines="12-20"` → 12). */
  startLine?: number;
  caption?: string;
  /** `bad38`: deliberately invalid for the CCC grader (plan §4.4). */
  variant?: "normal" | "bad38";
  /** Committed `.in` text. */
  input?: string;
  /** Committed `.out` text (generated, never typed). */
  output?: string;
  /** `expectError`: replaces the Output panel. */
  error?: { type: string; traceback: string };
}

const MIXED_REDLINE = "border-[color-mix(in_oklab,var(--color-redline)_30%,var(--color-paper))]";

/**
 * Read-only code block (DESIGN.md → Code block, Input / Output panels, Error traceback panel).
 * Async server component: Shiki runs at build time; only the copy button hydrates.
 */
export async function CodeBlock({
  code,
  lang = "python",
  filename,
  highlight = [],
  startLine = 1,
  caption,
  variant = "normal",
  input,
  output,
  error,
}: CodeBlockProps) {
  const s = ui().code;
  const isPython = lang === "python" || lang === "py";
  const lines = await highlightLines(code, isPython ? "python" : "text");
  const hl = new Set(highlight);
  const showNumbers = lines.length > 3 || hl.size > 0;
  const lastNo = startLine + lines.length - 1;
  // Gutter: the widest number plus 0.75rem either side (ch is one Mono digit).
  const gutter = `calc(${Math.max(2, String(lastNo).length)}ch + 1.5rem)`;
  const bad = variant === "bad38";
  const regionLabel = bad ? s.bad38 : (filename ?? s.region);
  const hasIo = input !== undefined || output !== undefined || error !== undefined;

  return (
    <figure data-exhibit="" data-ui="" data-code-assembly="" className="max-w-(--measure-wide)">
      <div
        data-code-frame=""
        className={cn(
          "overflow-hidden rounded-box border bg-paper-sunk",
          bad ? "border-redline" : "border-rule",
        )}
      >
        <div
          className={cn(
            "flex h-9 items-center justify-between gap-3 border-b pr-1 pl-4 pointer-coarse:h-12",
            bad ? `${MIXED_REDLINE} bg-redline-soft` : "border-rule",
          )}
        >
          {bad ? (
            <span className="flex min-w-0 items-center gap-1.5 font-semibold text-label text-redline">
              <OctagonX aria-hidden="true" size={16} strokeWidth={2} />
              <span className="truncate">{s.bad38}</span>
            </span>
          ) : filename ? (
            <span className="min-w-0 truncate font-mono text-ink-2 text-small">{filename}</span>
          ) : (
            <span className="font-semibold text-ink-3 text-label">{isPython ? s.python : ""}</span>
          )}
          <CopyButton
            code={code}
            labels={{ copy: s.copy, copied: s.copied, failed: s.copyFailed }}
          />
        </div>
        <section
          // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be keyboard-reachable (WCAG 2.1.1)
          tabIndex={0}
          aria-label={regionLabel}
          className="overflow-x-auto focus-inset"
        >
          <pre className="text-code">
            <code className="grid w-max min-w-full">
              {lines.map((tokens, i) => {
                const no = startLine + i;
                const on = hl.has(no);
                // First and last lines carry the block padding so the gutter rule runs edge to edge.
                const edge = cn(i === 0 && "pt-3", i === lines.length - 1 && "pb-3");
                const empty =
                  tokens.length === 0 || (tokens.length === 1 && tokens[0]?.content === "");
                return (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: lines are static and ordered
                    key={i}
                    data-line={no}
                    data-highlighted={on ? "" : undefined}
                    className={cn(
                      "grid pr-4",
                      on ? "bg-check-soft" : "bg-paper-sunk",
                      !showNumbers && "pl-4",
                    )}
                    style={{ gridTemplateColumns: showNumbers ? `${gutter} 1fr` : "1fr" }}
                  >
                    {showNumbers ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "sticky left-0 border-rule border-r px-3 text-right tnum select-none [background:inherit]",
                          edge,
                          on ? "font-bold text-ink" : "text-ink-3",
                        )}
                      >
                        {no}
                      </span>
                    ) : null}
                    <span className={cn("whitespace-pre", showNumbers && "pl-4", edge)}>
                      {empty
                        ? "\n"
                        : tokens.map((t, j) => (
                            <span
                              // biome-ignore lint/suspicious/noArrayIndexKey: tokens are static and ordered
                              key={j}
                              style={{ color: t.color, fontWeight: t.bold ? 700 : undefined }}
                            >
                              {t.content}
                            </span>
                          ))}
                    </span>
                  </span>
                );
              })}
            </code>
          </pre>
        </section>
      </div>
      {hasIo ? (
        <div
          className={cn(
            "mt-3 grid gap-3",
            // Side by side only for a short input next to its output; a traceback needs the full width.
            input !== undefined && output !== undefined && error === undefined && "sm:grid-cols-2",
          )}
        >
          {input !== undefined ? <IoPanel kind="input" text={input} /> : null}
          {error !== undefined ? (
            <ErrorPanel type={error.type} traceback={error.traceback} />
          ) : output !== undefined ? (
            <IoPanel kind="output" text={output} />
          ) : null}
        </div>
      ) : null}
      {caption ? <figcaption className="mt-2 text-ink-2 text-small">{caption}</figcaption> : null}
    </figure>
  );
}

/** Input or Output panel. `text` is committed file content, never typed by hand. */
export function IoPanel({ kind, text }: { kind: "input" | "output"; text: string }) {
  const s = ui().code;
  const label = kind === "input" ? s.input : s.output;
  const Icon = kind === "input" ? ArrowDownToLine : ArrowUpFromLine;
  const body = text.replace(/\n$/, "");
  return (
    <section
      aria-label={label}
      className="min-w-0 overflow-hidden rounded-box border border-rule bg-paper"
    >
      <p className="flex items-center gap-1.5 px-4 pt-2.5 font-semibold text-ink-3 text-label">
        <Icon aria-hidden="true" size={14} strokeWidth={2} />
        {label}
      </p>
      {body === "" ? (
        <p className="px-4 pt-1 pb-3 text-ink-3 text-small italic">{s.noOutput}</p>
      ) : (
        <pre
          // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable output must be keyboard-reachable
          tabIndex={0}
          className="max-h-[calc(20lh+1.25rem)] overflow-auto px-4 pt-1 pb-3 text-code focus-inset"
        >
          {body}
        </pre>
      )}
    </section>
  );
}

/** Output panel alone (`<Output file="…" />`). */
export function OutputPanel({ output }: { output: string }) {
  return (
    <div data-exhibit="" data-ui="" className="max-w-(--measure-wide)">
      <IoPanel kind="output" text={output} />
    </div>
  );
}

/** Traceback panel for `expectError` examples. The last line (the exception) is in redline. */
export function ErrorPanel({ type, traceback }: { type: string; traceback: string }) {
  const s = ui().code;
  const lines = traceback.replace(/\n$/, "").split("\n");
  const last = lines.pop() ?? "";
  return (
    <section
      aria-label={s.errorRegion}
      className={cn("min-w-0 overflow-hidden rounded-box border bg-redline-soft", MIXED_REDLINE)}
    >
      <p className="flex items-center gap-1.5 px-4 pt-2.5 font-semibold text-label text-redline">
        <OctagonAlert aria-hidden="true" size={14} strokeWidth={2} />
        {fmt(s.error, { type })}
      </p>
      <pre
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable traceback must be keyboard-reachable
        tabIndex={0}
        className="max-h-[calc(20lh+1.25rem)] overflow-auto px-4 pt-1 pb-3 text-code text-ink focus-inset"
      >
        {lines.length > 0 ? `${lines.join("\n")}\n` : ""}
        <span className="font-bold text-redline">{last}</span>
      </pre>
    </section>
  );
}
