"use client";

import { useReadState } from "@/lib/read-state";
import { RichTitle } from "./RichTitle";

export interface ContinueLesson {
  id: string;
  title: string;
  href: string;
  moduleId: string;
}

export interface ContinueBlockProps {
  /** Every readable lesson in course order. */
  lessons: ContinueLesson[];
  labels: { continueLabel: string; startLabel: string };
}

/** The folded tape flag: where you stopped (DESIGN.md → Continue where you left off). */
function Flag() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width={20} height={20} className="shrink-0">
      <path d="M5 2.75v14.5" stroke="var(--color-ink)" strokeWidth={1.5} strokeLinecap="round" />
      <path
        d="M5.75 3.25h9.5l-2.5 3.5 2.5 3.5h-9.5z"
        fill="var(--color-check)"
        stroke="var(--color-ink)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * "Continue where you left off": the next unread lesson after the most recently read one. The
 * server renders the start state; the client swaps text inside a fixed-height block.
 */
export function ContinueBlock({ lessons, labels }: ContinueBlockProps) {
  const rs = useReadState();
  let target: ContinueLesson | undefined = lessons[0];
  let resumed = false;
  if (rs.ready) {
    const map = rs.all();
    let latest = -1;
    let latestAt = "";
    lessons.forEach((l, i) => {
      const at = map[l.id];
      if (at && at >= latestAt) {
        latestAt = at;
        latest = i;
      }
    });
    if (latest >= 0) {
      resumed = true;
      target =
        lessons.slice(latest + 1).find((l) => !(l.id in map)) ??
        lessons.find((l) => !(l.id in map)) ??
        lessons[latest];
    }
  }
  if (!target) return null;
  return (
    <div className="flex min-h-[5.5rem] items-center gap-4 border border-rule bg-paper-sunk px-5 py-4">
      <Flag />
      <div className="min-w-0">
        <p className="text-ink-2 text-small">
          {resumed ? labels.continueLabel : labels.startLabel}
        </p>
        <a
          href={target.href}
          className="group mt-0.5 flex flex-wrap items-baseline gap-x-2 text-ui"
        >
          <span className="text-ink-3 text-small tnum">{target.moduleId}</span>
          <span className="font-bold text-blueline underline decoration-1 underline-offset-[0.2em] group-hover:text-blueline-deep group-hover:decoration-2">
            <RichTitle text={target.title} />
          </span>
        </a>
      </div>
    </div>
  );
}
