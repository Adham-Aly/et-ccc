import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * One label grid for every index in the app (DESIGN.md → Course map → Index row):
 * ID | title (+ description) | meta | marks. The whole row is the link when `href` is set.
 * Phones: status and meta drop to their own line under the title; marks stay at the right.
 */
export function IndexRow({
  id,
  title,
  description,
  meta,
  marks,
  href,
  muted = false,
  after,
}: {
  id: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  marks?: ReactNode;
  href?: string | null;
  muted?: boolean;
  /** Status (Draft badge, Coming soon): the trailing column from 640 px, its own line under the title below. */
  after?: ReactNode;
}) {
  const body = (
    <>
      <span className="col-start-1 row-start-1 self-baseline text-ink-3 text-small leading-6 tnum">
        {id}
      </span>
      <span className="col-start-2 row-start-1 min-w-0 self-baseline">
        <span
          className={cn(
            "text-ui",
            muted ? "text-ink-3" : "font-semibold text-ink",
            href && "group-hover:underline group-hover:underline-offset-[0.2em]",
          )}
        >
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-ink-2 text-small">{description}</span>
        ) : null}
      </span>
      {meta || after ? (
        <span className="col-start-2 row-start-2 mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-ink-3 text-small tnum sm:col-start-3 sm:row-start-1 sm:mt-0 sm:justify-end sm:self-baseline sm:leading-6">
          {after}
          {meta ? <span>{meta}</span> : null}
        </span>
      ) : null}
      {marks ? (
        <span className="col-start-3 row-start-1 flex h-6 items-center justify-end gap-1 sm:col-start-4">
          {marks}
        </span>
      ) : null}
    </>
  );
  // Columns exist only for what the row shows, so an empty column never adds a gap.
  const cls = cn(
    "grid gap-x-4 border-rule border-b px-2 py-3",
    marks
      ? "grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:grid-cols-[4.5rem_minmax(0,1fr)_auto_auto]"
      : "grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[4.5rem_minmax(0,1fr)_auto]",
  );
  return href ? (
    <a href={href} data-ui="" className={cn(cls, "group hover:bg-board")}>
      {body}
    </a>
  ) : (
    <div data-ui="" className={cls}>
      {body}
    </div>
  );
}
