import { BadgeCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { ui } from "@/components/ui/ui-strings";

export type CalloutKind = "note" | "warning" | "grader-tip";

const KINDS = {
  note: {
    Icon: Info,
    frame:
      "bg-blueline-soft border-[color-mix(in_oklab,var(--color-blueline)_30%,var(--color-paper))]",
    head: "text-blueline",
  },
  warning: {
    Icon: TriangleAlert,
    frame:
      "bg-redline-soft border-[color-mix(in_oklab,var(--color-redline)_30%,var(--color-paper))]",
    head: "text-redline",
  },
  "grader-tip": {
    Icon: BadgeCheck,
    frame: "bg-green-soft border-[color-mix(in_oklab,var(--color-green)_30%,var(--color-paper))]",
    head: "text-green",
  },
} as const;

export interface CalloutProps {
  kind: CalloutKind;
  title?: string;
  children: ReactNode;
}

/** Callout (DESIGN.md → Callouts). Kind shows as icon + label + colour, never colour alone. */
export function Callout({ kind, title, children }: CalloutProps) {
  const k = KINDS[kind] ?? KINDS.note;
  const s = ui().callout;
  const label =
    title ?? (kind === "warning" ? s.warning : kind === "grader-tip" ? s.graderTip : s.note);
  return (
    <aside
      aria-label={label}
      data-exhibit=""
      data-callout={kind}
      className={cn("rounded-box border px-5 py-4 text-ink", k.frame)}
    >
      <p className={cn("flex items-center gap-2 font-bold text-minor", k.head)}>
        <k.Icon aria-hidden="true" size={18} strokeWidth={1.75} />
        <span>{label}</span>
      </p>
      <div className="mt-3 [&>*+*]:mt-3">{children}</div>
    </aside>
  );
}
