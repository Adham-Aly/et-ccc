import { PencilLine } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";
import { ui } from "./ui-strings";

/** Judge badge (DESIGN.md → Problem link and judge badge). Both judges share one style. */
export function JudgeBadge({ judge, className }: { judge: "wmoj" | "dmoj"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-cell border border-rule-strong bg-paper px-1.5 py-px align-[0.1em]",
        "font-semibold text-ink-2 text-label leading-[1.2] no-underline",
        className,
      )}
    >
      {judge === "wmoj" ? "WMOJ" : "DMOJ"}
    </span>
  );
}

/** Draft badge: a pencilled (dashed) tag. Previews only. */
export function DraftBadge({ label, className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-cell border-[1.5px] border-rule-strong border-dashed bg-paper px-1.5 py-px",
        "font-semibold text-ink-2 text-label leading-[1.2] whitespace-nowrap",
        className,
      )}
    >
      <PencilLine aria-hidden="true" size={12} strokeWidth={2} />
      {label ?? ui().status.draft}
    </span>
  );
}

/** Coming soon: pencilled tag in ink-3. The row it sits in has no link. */
export function ComingSoon({ label, className }: { label?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-cell border-[1.5px] border-rule border-dashed px-1.5 py-px",
        "font-medium text-ink-3 text-label leading-[1.2] whitespace-nowrap",
        className,
      )}
    >
      {label ?? ui().status.comingSoon}
    </span>
  );
}
