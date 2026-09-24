// Scene "growth-rates": how log n, n, n log n, n² and 2ⁿ grow as n grows (a PlotViz scene).
import { z } from "zod";
import type { PlotFrame } from "../../../lib/viz/schema";
import type { SceneBuild } from "./types";

const CURVES = {
  logn: { label: "log n", say: "log₂ n", f: (n: number) => Math.log2(n) },
  n: { label: "n", say: "n", f: (n: number) => n },
  nlogn: { label: "n log n", say: "n log₂ n", f: (n: number) => n * Math.log2(n) },
  n2: { label: "n²", say: "n²", f: (n: number) => n * n },
  "2n": { label: "2ⁿ", say: "2ⁿ", f: (n: number) => 2 ** n },
} as const;
type CurveId = keyof typeof CURVES;

export const growthProps = z
  .strictObject({
    curves: z
      .array(z.enum(Object.keys(CURVES) as [CurveId, ...CurveId[]]))
      .min(2)
      .max(5),
    /** The n values the reader steps through (the x axis runs from 1 to the last one). */
    points: z.array(z.number().int().min(1).max(1024)).min(2).max(8),
    /** Top of the y axis; values above it leave the chart. */
    yMax: z.number().int().positive(),
  })
  .superRefine((p, ctx) => {
    if (p.points.some((v, i) => i > 0 && v <= (p.points[i - 1] ?? 0))) {
      ctx.addIssue({ code: "custom", message: "points must increase" });
    }
  });

function show(v: number): string {
  if (Number.isInteger(v)) return v.toLocaleString("en-US");
  return (Math.round(v * 10) / 10).toLocaleString("en-US");
}

export function buildGrowth(props: z.infer<typeof growthProps>): SceneBuild {
  const nMax = props.points[props.points.length - 1] ?? 1;
  const samples: number[] = [];
  for (let i = 0; i <= 80; i += 1) samples.push(1 + ((nMax - 1) * i) / 80);
  const series = props.curves.map((c, i) => ({
    id: c,
    label: CURVES[c].label,
    pts: samples.map(
      (n) =>
        [Math.round(n * 1000) / 1000, Math.round(CURVES[c].f(n) * 1000) / 1000] as [number, number],
    ),
    style: i % 4,
  }));
  const frameAt = (n: number | null): PlotFrame => ({
    x: { min: 1, max: nMax, label: "n (size of the input)" },
    y: { min: 0, max: props.yMax, label: "steps" },
    series,
    ...(n === null
      ? {}
      : {
          vline: { x: n, label: `n = ${n}` },
          markers: props.curves
            .filter((c) => CURVES[c].f(n) <= props.yMax)
            .map((c) => ({
              x: n,
              y: Math.round(CURVES[c].f(n) * 1000) / 1000,
              label: show(CURVES[c].f(n)),
            })),
        }),
  });
  const steps: { caption: string; panels: Record<string, PlotFrame> }[] = [];
  steps.push({
    caption: `Each line shows how many steps a program would take for an input of size n, if its work grows like ${props.curves
      .map((c) => CURVES[c].say)
      .join(", ")}.`,
    panels: { plot: frameAt(null) },
  });
  for (const n of props.points) {
    const parts = props.curves.map((c) => {
      const v = CURVES[c].f(n);
      return `${CURVES[c].say} is ${show(v)}${v > props.yMax ? " (above the chart)" : ""}`;
    });
    steps.push({ caption: `At n = ${n}: ${parts.join(", ")}.`, panels: { plot: frameAt(n) } });
  }
  return {
    layout: "single",
    panels: [{ id: "plot", viz: "PlotViz" }],
    presets: [{ id: "main", label: "Growth", steps }],
    alt: `A chart of ${props.curves.map((c) => CURVES[c].say).join(", ")} for n from 1 to ${nMax}. The faster-growing lines leave the chart early.`,
  };
}
