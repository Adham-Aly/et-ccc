import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface TitleCell {
  label: string;
  value: ReactNode;
}

/**
 * The ruled title-block strip under an H1 (DESIGN.md → Reading page): field label above value,
 * square corners, 1 px rules. The cells always share one row in equal columns with a rule between
 * them; on phones the extra item (the Draft badge) takes its own ruled row below. Values wrap,
 * never truncate.
 */
export function TitleBlockStrip({ cells, extra }: { cells: TitleCell[]; extra?: ReactNode }) {
  return (
    <div className="mt-5 border-rule border-y sm:flex">
      <dl className="grid auto-cols-fr grid-flow-col sm:flex">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={cn(
              "min-w-0 px-3 py-2 first:pl-0 sm:min-w-[7rem] sm:px-4 sm:first:pl-0",
              i > 0 && "border-rule border-l",
            )}
          >
            <dt className="font-normal text-ink-3 text-label">{c.label}</dt>
            <dd className="font-semibold text-ink text-ui tnum">{c.value}</dd>
          </div>
        ))}
      </dl>
      {extra ? (
        <div className="flex items-center border-rule border-t py-2 sm:ml-auto sm:border-t-0 sm:pl-4">
          {extra}
        </div>
      ) : null}
    </div>
  );
}
