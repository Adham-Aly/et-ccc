import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { fmt, ui } from "@/components/ui/ui-strings";

export interface JudgeLinkProps {
  judge: "wmoj" | "dmoj";
  kind: "home" | "signup";
  /** From external-links.yaml (the only place judge home/sign-up URLs live). */
  href: string;
  children?: ReactNode;
}

/** Link to a judge's home or sign-up page (DESIGN.md → JudgeLink). */
export function JudgeLink({ judge, kind, href, children }: JudgeLinkProps) {
  const s = ui().practice;
  const name = judge === "wmoj" ? "WMOJ" : "DMOJ";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline">
      {children ?? fmt(kind === "signup" ? s.judgeSignup : s.judgeHome, { judge: name })}
      <ArrowUpRight
        aria-hidden="true"
        size={14}
        strokeWidth={2}
        className="ml-0.5 inline align-[-0.1em]"
      />
      <span className="sr-only"> {fmt(s.opensOn, { judge: name })}</span>
    </a>
  );
}
