// Scene "stdin-flow": how input() takes one line of standard input at a time (plan §4.11.1).
import { z } from "zod";
import type { StdinSceneFrame } from "../../../lib/viz/schema";
import type { SceneBuild } from "./types";

const intRe = /^\s*[+-]?\d+\s*$/;
type ReadAs = "str" | "int" | "split";

export const stdinFlowProps = z
  .strictObject({
    /** The lines waiting on standard input. */
    lines: z.array(z.string().max(20)).min(1).max(6),
    /** One read per program line, in order: `n = int(input())`, `words = input().split()`, … */
    reads: z
      .array(
        z.strictObject({
          name: z.string().regex(/^[a-z_][a-z0-9_]{0,9}$/),
          as: z.enum(["str", "int", "split"]).optional(),
        }),
      )
      .min(1)
      .max(6),
  })
  .superRefine((p, ctx) => {
    if (p.reads.length > p.lines.length) {
      ctx.addIssue({ code: "custom", message: "more reads than input lines" });
    }
    p.reads.forEach((r, i) => {
      const line = p.lines[i] ?? "";
      if (r.as === "int" && !intRe.test(line)) {
        ctx.addIssue({ code: "custom", message: `line ${i + 1} is not an int` });
      }
      if (r.as === "split" && line.trim() === "") {
        ctx.addIssue({ code: "custom", message: `line ${i + 1} is empty` });
      }
    });
  });

function codeFor(r: { name: string; as?: ReadAs | undefined }): string {
  if (r.as === "int") return `${r.name} = int(input())`;
  if (r.as === "split") return `${r.name} = input().split()`;
  return `${r.name} = input()`;
}

/** Python's repr of a str (single quotes unless the text holds one and no double quote). */
function pyStr(s: string): string {
  if (s.includes("'") && !s.includes('"')) return `"${s}"`;
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function valueFor(line: string, as: ReadAs | undefined): string {
  if (as === "int") return String(Number.parseInt(line.trim(), 10));
  if (as === "split") return `[${line.trim().split(/\s+/).map(pyStr).join(", ")}]`;
  return pyStr(line);
}

const ORD = ["first", "second", "third", "fourth", "fifth", "sixth"];

export function buildStdinFlow(props: z.infer<typeof stdinFlowProps>): SceneBuild {
  const code = props.reads.map(codeFor);
  const steps: { caption: string; panels: Record<string, StdinSceneFrame> }[] = [];
  const vars: [string, string][] = [];
  steps.push({
    caption:
      "The input waits on standard input, one line per row. Nothing has been read yet; line 1 of the program runs next.",
    panels: { io: { lines: props.lines, used: 0, code, at: 0, vars: [] } },
  });
  props.reads.forEach((r, i) => {
    const line = props.lines[i] ?? "";
    const value = valueFor(line, r.as);
    const existing = vars.findIndex(([n]) => n === r.name);
    if (existing >= 0) vars[existing] = [r.name, value];
    else vars.push([r.name, value]);
    const next = i + 1 < props.reads.length ? i + 1 : -1;
    let caption = `Line ${i + 1} runs: input() reads the ${ORD[i]} line, ${pyStr(line)}, and drops its newline.`;
    if (r.as === "int") {
      caption += ` int() turns the text into the number ${value}, and ${r.name} refers to it.`;
    } else if (r.as === "split") {
      caption += ` split() cuts it at the spaces, so ${r.name} is a list of strings: ${value}.`;
    } else {
      caption += ` ${r.name} refers to that text: it is a string, even if it looks like a number.`;
    }
    if (next === -1 && props.lines.length > props.reads.length) {
      caption += " The lines left over are never read.";
    }
    steps.push({
      caption,
      panels: {
        io: {
          lines: props.lines,
          used: i + 1,
          code,
          at: next,
          vars: vars.map((v) => [v[0], v[1]] as [string, string]),
          fresh: r.name,
        },
      },
    });
  });
  return {
    layout: "single",
    panels: [{ id: "io", viz: "StdinScene" }],
    presets: [{ id: "main", label: "Input", steps }],
    alt: `Standard input holds ${props.lines.length} line(s). Each call to input() takes the next line, without its newline, and the program stores it in a variable.`,
  };
}
