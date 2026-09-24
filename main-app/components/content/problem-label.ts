import type { ProblemView } from "@/components/layout/props";

/** "2023 S1" */
export function problemLabel(p: Pick<ProblemView, "year" | "level" | "number">): string {
  return `${p.year} ${p.level}${p.number}`;
}

export function judgeName(judge: ProblemView["judge"]): string {
  return judge === "wmoj" ? "WMOJ" : "DMOJ";
}
