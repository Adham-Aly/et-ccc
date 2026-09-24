import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** Native <details> (DESIGN.md → Details). No JS. */
export function Details({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return (
    <details data-exhibit="" className="group rounded-box border border-rule bg-paper">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-box px-4 py-3 font-semibold text-ink text-ui hover:bg-board group-open:rounded-b-none group-open:border-rule group-open:border-b [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          size={16}
          strokeWidth={2}
          className="text-ink-2 transition-transform duration-150 ease-draft group-open:rotate-90 motion-reduce:transition-none"
        />
        {summary}
      </summary>
      <div className="px-4 py-4 [&>*+*]:mt-4">{children}</div>
    </details>
  );
}
