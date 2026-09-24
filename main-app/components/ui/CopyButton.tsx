"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "./button-styles";

export interface CopyButtonProps {
  code: string;
  labels: { copy: string; copied: string; failed: string };
}

type State = "idle" | "copied" | "failed";

/** Copy-code button (plan §4.8): the only JS on a code block. */
export function CopyButton({ code, labels }: CopyButtonProps) {
  const [state, setState] = useState<State>("idle");
  const ref = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function selectCode() {
    const pre = ref.current?.closest("[data-code-frame]")?.querySelector("code");
    const sel = window.getSelection();
    if (!pre || !sel) return;
    const range = document.createRange();
    range.selectNodeContents(pre);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  async function onCopy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
      timer.current = setTimeout(() => setState("idle"), 2000);
    } catch {
      selectCode();
      setState("failed");
      timer.current = setTimeout(() => setState("idle"), 4000);
    }
  }

  const label = state === "copied" ? labels.copied : labels.copy;
  return (
    <span className="flex items-center gap-2">
      <span aria-live="polite" className="text-ink-2 text-small">
        {state === "failed" ? labels.failed : null}
        <span className="sr-only">{state === "copied" ? labels.copied : ""}</span>
      </span>
      <button
        ref={ref}
        type="button"
        onClick={onCopy}
        aria-label={labels.copy}
        className={buttonClass(
          "ghost",
          "sm",
          "h-7 gap-1.5 px-2 font-medium text-label pointer-coarse:h-11",
        )}
      >
        {state === "copied" ? (
          <Check aria-hidden="true" size={16} strokeWidth={2} className="text-green" />
        ) : (
          <Copy aria-hidden="true" size={16} strokeWidth={1.75} />
        )}
        <span aria-hidden="true" className="hidden sm:inline">
          {label}
        </span>
      </button>
    </span>
  );
}
