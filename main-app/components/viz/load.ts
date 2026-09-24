// Server-only loading of committed visual data (build time). A malformed file throws, so a
// broken visual can never deploy (plan §4.11.6).
import fs from "node:fs";
import path from "node:path";
import type { FramesFile, TraceFile } from "@/lib/viz/schema";
import { validateVisualText } from "@/lib/viz/validate";

function read(
  baseDir: string | undefined,
  rel: string,
  what: string,
): { file: string; text: string } {
  if (!baseDir)
    throw new Error(`${what} "${rel}": no module directory (use createVizComponents(moduleDir))`);
  const file = path.resolve(baseDir, rel);
  if (!fs.existsSync(file))
    throw new Error(`${what}: ${file} does not exist (run npm run gen:viz)`);
  return { file, text: fs.readFileSync(file, "utf8") };
}

export function loadFrames(baseDir: string | undefined, rel: string): FramesFile {
  if (!rel.endsWith(".frames.json"))
    throw new Error(`StepThrough/Diagram frames="${rel}" must name a .frames.json file`);
  const { file, text } = read(baseDir, rel, "frames");
  const res = validateVisualText(text, "frames", file);
  if (!res.ok) throw new Error(`${file} is invalid:\n${res.errors.join("\n")}`);
  return res.data as FramesFile;
}

export function loadTrace(baseDir: string | undefined, rel: string): TraceFile {
  if (!rel.endsWith(".trace.json"))
    throw new Error(`CodeTrace trace="${rel}" must name a .trace.json file`);
  const { file, text } = read(baseDir, rel, "trace");
  const res = validateVisualText(text, "trace", file);
  if (!res.ok) throw new Error(`${file} is invalid:\n${res.errors.join("\n")}`);
  return res.data as TraceFile;
}

export function presetIndex(
  presets: { id: string }[],
  id: string | undefined,
  where: string,
): number {
  if (id === undefined) return 0;
  const i = presets.findIndex((p) => p.id === id);
  if (i < 0) throw new Error(`${where}: preset "${id}" does not exist`);
  return i;
}

/** Stable, readable id for a player on the page (radio group names, test hooks). */
export function playerUid(id: string, number: number | undefined): string {
  return `vz-${id}${number === undefined ? "" : `-f${number}`}`;
}
