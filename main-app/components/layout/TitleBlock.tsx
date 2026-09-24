import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface TitleCell {
  label: string;
  value: ReactNode;
}

/**
 * The ruled title-block strip under an H1 (DESIGN.md → Reading page): field label above value,
 * square corners, 1 px rules. Wraps on phones; values never truncate.
 */
export function TitleBlockStrip({ cells, extra }: { cells: TitleCell[]; extra?: ReactNode }) {
  return (
    <div className="mt-5 flex flex-wrap border-rule border-t border-b">
      <dl className="contents">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={cn(
              "min-w-[7rem] px-4 py-2 first:pl-0 max-sm:basis-1/2 max-sm:first:pl-0 max-sm:odd:pl-0",
              i > 0 && "sm:border-rule sm:border-l",
              i % 2 === 1 && "max-sm:border-rule max-sm:border-l",
              i >= 2 && "max-sm:border-rule max-sm:border-t",
            )}
          >
            <dt className="text-ink-3 text-label font-normal">{c.label}</dt>
            <dd className="font-semibold text-ink text-ui tnum">{c.value}</dd>
          </div>
        ))}
      </dl>
      {extra ? (
        <div className="flex items-center px-4 py-2 max-sm:basis-full max-sm:border-rule max-sm:border-t max-sm:px-0 sm:ml-auto sm:pr-0">
          {extra}
        </div>
      ) : null}
    </div>
  );
}
