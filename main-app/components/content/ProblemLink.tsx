import { ArrowUpRight } from "lucide-react";
import type { ProblemView } from "@/components/layout/props";
import { JudgeBadge } from "@/components/ui/Badge";
import { fmt, ui } from "@/components/ui/ui-strings";
import { judgeName, problemLabel } from "./problem-label";

/**
 * Inline problem link (DESIGN.md → Problem link and judge badge): "2023 S1: Title" + judge badge.
 * The URL comes from the registry's judgeUrl() via `problem.url` (R13); never typed here.
 */
export function ProblemLink({ problem }: { problem: ProblemView }) {
  const s = ui().practice;
  return (
    <span className="inline">
      <a
        href={problem.url}
        target="_blank"
        rel="noopener noreferrer"
        data-plain=""
        className="text-blueline underline decoration-1 underline-offset-[0.2em] hover:text-blueline-deep hover:decoration-2"
      >
        <span className="font-semibold tnum">{problemLabel(problem)}</span>: {problem.title}
        <span className="sr-only"> {fmt(s.opensOn, { judge: judgeName(problem.judge) })}</span>
      </a>
      {problem.sameAs ? (
        <span className="text-ink-2">
          {" "}
          {fmt(s.sameAs, { label: problemLabel(problem.sameAs) })}
        </span>
      ) : null}{" "}
      <span className="inline-flex items-center gap-0.5 whitespace-nowrap align-baseline">
        <JudgeBadge judge={problem.judge} />
        <ArrowUpRight aria-hidden="true" size={14} strokeWidth={2} className="text-ink-3" />
      </span>
    </span>
  );
}
