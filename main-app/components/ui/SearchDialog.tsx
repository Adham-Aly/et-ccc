"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { loadSearch, type SearchEngine, type SearchResult } from "@/lib/search/client";
import { buttonClass } from "./button-styles";
import { cn } from "./cn";

export interface SearchLabels {
  trigger: string;
  open: string;
  placeholder: string;
  label: string;
  close: string;
  hintEmpty: string;
  loading: string;
  noResults: string;
  loadFailed: string;
  retry: string;
  groupLessons: string;
  groupTerms: string;
  groupProblems: string;
}

type Status = "idle" | "loading" | "ready" | "failed";

let enginePromise: Promise<SearchEngine> | null = null;
function getEngine(): Promise<SearchEngine> {
  enginePromise ??= loadSearch().catch((e: unknown) => {
    enginePromise = null;
    throw e;
  });
  return enginePromise;
}

/** Results list + input, shared by the dialog and the /search page. */
export function SearchPanel({
  labels,
  initialQuery = "",
  autoFocus = false,
  onNavigate,
  syncUrl = false,
}: {
  labels: SearchLabels;
  initialQuery?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  syncUrl?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<Status>("idle");
  const [engine, setEngine] = useState<SearchEngine | null>(null);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setStatus("loading");
    getEngine().then(
      (e) => {
        setEngine(e);
        setStatus("ready");
      },
      () => setStatus("failed"),
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!syncUrl) return;
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [query, syncUrl]);

  const q = query.trim();
  const results = useMemo<SearchResult[]>(
    () => (engine && q ? engine.search(q).slice(0, 30) : []),
    [engine, q],
  );

  const groups = (["lesson", "term", "problem"] as const)
    .map((kind) => ({
      kind,
      title:
        kind === "lesson"
          ? labels.groupLessons
          : kind === "term"
            ? labels.groupTerms
            : labels.groupProblems,
      items: results.filter((r) => r.kind === kind),
    }))
    .filter((g) => g.items.length > 0);
  const flat = groups.flatMap((g) => g.items);
  const optionId = (i: number) => `${listId}-opt-${i}`;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      const r = flat[active];
      if (r) {
        e.preventDefault();
        onNavigate?.();
        window.location.assign(r.href);
      }
    }
  }

  let i = -1;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-rule border-b px-4">
        <Search aria-hidden="true" size={20} strokeWidth={1.75} className="text-ink-3" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={flat.length > 0}
          aria-controls={listId}
          aria-activedescendant={flat.length > 0 ? optionId(active) : undefined}
          aria-autocomplete="list"
          aria-label={labels.label}
          placeholder={labels.placeholder}
          // biome-ignore lint/a11y/noAutofocus: the search dialog exists to take input immediately
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 bg-transparent text-[1.0625rem] text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2" aria-live="polite">
        {status === "failed" ? (
          <div className="flex flex-wrap items-center gap-3 px-2 py-3">
            <p className="text-redline text-small">{labels.loadFailed}</p>
            <button type="button" className={buttonClass("secondary", "sm")} onClick={load}>
              {labels.retry}
            </button>
          </div>
        ) : status !== "ready" && q ? (
          <div className="space-y-3 px-2 py-3" role="status" aria-label={labels.loading}>
            {[70, 55, 62].map((w) => (
              <div key={w} className="h-4 rounded-cell bg-rule" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : !q ? (
          <p className="px-2 py-3 text-ink-3 text-small">{labels.hintEmpty}</p>
        ) : flat.length === 0 ? (
          <p className="px-2 py-3 text-ink-2 text-small">{labels.noResults.replace("{q}", q)}</p>
        ) : (
          <div id={listId} role="listbox" aria-label={labels.label}>
            {groups.map((g) => (
              // biome-ignore lint/a11y/useSemanticElements: ARIA listbox groups; a fieldset is not valid inside a listbox
              <div key={g.kind} role="group" aria-label={g.title} className="pb-2">
                <p className="px-2 pt-2 pb-1 font-semibold text-ink-3 text-label">{g.title}</p>
                {g.items.map((r) => {
                  i += 1;
                  const idx = i;
                  return (
                    <a
                      key={`${r.kind}-${r.id}`}
                      id={optionId(idx)}
                      role="option"
                      aria-selected={idx === active}
                      href={r.href}
                      onClick={() => onNavigate?.()}
                      onMouseMove={() => setActive(idx)}
                      className={cn(
                        "grid grid-cols-[4.5rem_1fr] gap-x-3 rounded-control px-2 py-2",
                        idx === active ? "bg-blueline-soft" : "",
                      )}
                    >
                      <span className="pt-px text-ink-3 text-small tnum">{r.label}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink text-ui">
                          <Highlight text={r.title} q={q} />
                        </span>
                        {r.snippet ? (
                          <span className="block truncate text-ink-2 text-small">{r.snippet}</span>
                        ) : null}
                      </span>
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (!q || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-cell bg-check-soft font-bold text-ink">
        {text.slice(at, at + q.length)}
      </mark>
      {text.slice(at + q.length)}
    </>
  );
}

/** Header search trigger + dialog (DESIGN.md → Search dialog). `/` opens it. */
export function SearchDialog({ labels }: { labels: SearchLabels }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t?.closest(
          "input, textarea, select, [contenteditable=''], [contenteditable='true'], [role='group']",
        )
      )
        return;
      e.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={labels.open}
        className={cn(
          buttonClass("ghost", "icon"),
          "lg:h-9 lg:w-64 lg:justify-start lg:gap-2 lg:border lg:border-rule-strong lg:bg-paper lg:px-3 lg:font-normal lg:text-ink-3 lg:hover:bg-board",
        )}
      >
        <Search aria-hidden="true" size={18} strokeWidth={1.75} />
        <span className="hidden flex-1 text-left text-ui lg:inline">{labels.trigger}</span>
        <kbd className="hidden rounded-cell border border-rule px-1.5 font-sans text-ink-3 text-label leading-[1.4] lg:inline">
          /
        </kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-(--backdrop) transition-opacity duration-(--dur-state) ease-draft data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-paper shadow-overlay outline-none",
            "inset-0 sm:inset-x-0 sm:top-[12vh] sm:bottom-auto sm:mx-auto sm:max-h-[min(36rem,76vh)] sm:w-[min(40rem,calc(100vw-2rem))] sm:rounded-box sm:border sm:border-rule",
            "transition-[opacity,scale] duration-(--dur-state) ease-draft data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion-reduce:transition-opacity motion-reduce:data-ending-style:scale-100 motion-reduce:data-starting-style:scale-100",
          )}
        >
          <Dialog.Title className="sr-only">{labels.label}</Dialog.Title>
          <SearchPanel labels={labels} autoFocus onNavigate={() => setOpen(false)} />
          <div className="flex items-center justify-end border-rule border-t px-3 py-2">
            <Dialog.Close className={buttonClass("ghost", "sm", "gap-1.5 font-medium")}>
              <X aria-hidden="true" size={16} strokeWidth={1.75} />
              {labels.close}
              <kbd className="hidden rounded-cell border border-rule px-1.5 font-sans text-ink-3 text-label leading-[1.4] pointer-fine:inline">
                Esc
              </kbd>
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
