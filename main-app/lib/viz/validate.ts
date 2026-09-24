// validateVisualFile(path): Zod validation of one visual data file (G-VIZ schema part). Called
// by content:check and prebuild (W1) and by check:viz (tools/viz/check-viz.ts). Node-safe: no
// JSX, no Next imports. Run from a Node script with `--import ./tools/viz/register.mjs` so the
// extensionless relative imports resolve under Node's type stripping.
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { ZodType } from "zod";
import { framesFileSchema, traceFileSchema, traceYamlSchema, vizYamlSchema } from "./schema";

export type VisualFileKind = "frames" | "trace" | "viz-yaml" | "trace-yaml";

export type VisualValidation =
  | { ok: true; kind: VisualFileKind; path: string; data: unknown }
  | { ok: false; kind: VisualFileKind | null; path: string; errors: string[] };

export function visualFileKind(file: string): VisualFileKind | null {
  if (file.endsWith(".frames.json")) return "frames";
  if (file.endsWith(".trace.json")) return "trace";
  if (file.endsWith(".viz.yaml")) return "viz-yaml";
  if (file.endsWith(".trace.yaml")) return "trace-yaml";
  return null;
}

const SCHEMAS: Record<VisualFileKind, ZodType> = {
  frames: framesFileSchema,
  trace: traceFileSchema,
  "viz-yaml": vizYamlSchema,
  "trace-yaml": traceYamlSchema,
};

/** Validate text as the given kind (exported for tests and fixtures). */
export function validateVisualText(
  text: string,
  kind: VisualFileKind,
  file = "<text>",
): VisualValidation {
  let raw: unknown;
  try {
    raw = kind === "frames" || kind === "trace" ? JSON.parse(text) : parseYaml(text);
  } catch (err) {
    return { ok: false, kind, path: file, errors: [`cannot parse: ${(err as Error).message}`] };
  }
  const result = SCHEMAS[kind].safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      kind,
      path: file,
      errors: result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  }
  const errors: string[] = [];
  if (kind === "frames" || kind === "trace") {
    const stem = path.basename(file).replace(/\.(frames|trace)\.json$/, "");
    const id = (result.data as { id: string }).id;
    if (file !== "<text>" && id !== stem)
      errors.push(`id "${id}" must equal the file name "${stem}"`);
  }
  if (errors.length > 0) return { ok: false, kind, path: file, errors };
  return { ok: true, kind, path: file, data: result.data };
}

/**
 * Validate one visual data file by its extension: `.frames.json`, `.trace.json`, `.viz.yaml`
 * or `.trace.yaml`. Never throws; unknown extensions and unreadable files are errors.
 */
export function validateVisualFile(file: string): VisualValidation {
  const kind = visualFileKind(file);
  if (kind === null) {
    return {
      ok: false,
      kind: null,
      path: file,
      errors: ["not a visual data file (.frames.json, .trace.json, .viz.yaml, .trace.yaml)"],
    };
  }
  let text: string;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (err) {
    return { ok: false, kind, path: file, errors: [`cannot read: ${(err as Error).message}`] };
  }
  return validateVisualText(text, kind, file);
}
