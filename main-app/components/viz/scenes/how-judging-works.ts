// Scene "how-judging-works": the judge runs the program once per test case, feeds the test's
// input, compares the output with the expected output and gives each test a verdict.
import { z } from "zod";
import { verdictWord } from "../../../lib/viz/layout-scenes";
import { type JudgeSceneFrame, VERDICTS } from "../../../lib/viz/schema";
import type { SceneBuild } from "./types";

export const judgingProps = z.strictObject({
  /** One verdict per test case, in order. */
  verdicts: z.array(z.enum(VERDICTS)).min(1).max(6),
});

type Verdict = (typeof VERDICTS)[number];

const AFTER: Record<Verdict, string> = {
  AC: "the output matches, so this test is accepted (AC).",
  WA: "the output is different, so this test gets wrong answer (WA).",
  TLE: "the program was still running when the time limit ran out, so this test gets time limit exceeded (TLE).",
  RTE: "the program stopped with an error, so this test gets a runtime error (RTE).",
  MLE: "the program used more memory than the limit allows, so this test gets memory limit exceeded (MLE).",
};

export function buildJudging(props: z.infer<typeof judgingProps>): SceneBuild {
  const n = props.verdicts.length;
  const verdicts: (Verdict | null)[] = props.verdicts.map(() => null);
  const frame = (active: number, phase: JudgeSceneFrame["phase"]): JudgeSceneFrame => ({
    tests: props.verdicts.map((_, i) => ({
      name: String(i + 1),
      verdict: verdicts[i] ?? null,
      s: i === active && phase !== "idle" ? "c" : verdicts[i] ? "d" : ".",
    })),
    phase,
    active: Math.max(active, 0),
  });
  const steps: { caption: string; panels: Record<string, JudgeSceneFrame> }[] = [];
  steps.push({
    caption: `The judge has your program and ${n} test case${n === 1 ? "" : "s"}. It runs your program once for each test case, starting fresh every time.`,
    panels: { judge: frame(-1, "idle") },
  });
  props.verdicts.forEach((v, i) => {
    steps.push({
      caption: `Test ${i + 1}: the judge starts your program and gives it this test's input on standard input.`,
      panels: { judge: frame(i, "input") },
    });
    const ran = v === "AC" || v === "WA";
    steps.push({
      caption: ran
        ? "Your program reads the input and prints its answer on standard output."
        : "Your program starts reading the input and working on its answer.",
      panels: { judge: frame(i, "run") },
    });
    if (ran) {
      steps.push({
        caption:
          "The judge compares your output with the expected output for this test, line by line.",
        panels: { judge: frame(i, "compare") },
      });
    }
    verdicts[i] = v;
    steps.push({
      caption: `Test ${i + 1}: ${ran ? "" : "before any output could be compared, "}${AFTER[v]} The verdict is ${verdictWord(v)}.`,
      panels: { judge: frame(i, "done") },
    });
  });
  return {
    layout: "single",
    panels: [{ id: "judge", viz: "JudgeScene" }],
    presets: [{ id: "main", label: "Tests", steps }],
    alt: `The judge runs the program on ${n} test case(s) one after another: it feeds each test's input, compares the program's output with the expected output, and records a verdict for each test (${props.verdicts.join(", ")}).`,
  };
}
