// lib/content/strings.ts — typed, Zod-validated access to content/ui/strings.yaml, the ONLY
// place learner-facing UI copy lives (plan §4.6.2). Reads from disk with `node:fs`, so it only
// runs on the server (any client import fails at build/runtime already, since `fs` isn't
// available in the browser — no extra `server-only` dependency needed for that guarantee).
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { type UiStrings, uiStringsSchema } from "./schemas";

export type { UiStrings };

const CONTENT_ROOT = path.join(process.cwd(), "content");

let cached: UiStrings | null = null;

/** Loads and validates content/ui/strings.yaml once per process. */
export function getUiStrings(): UiStrings {
  if (cached) return cached;
  const file = path.join(CONTENT_ROOT, "ui", "strings.yaml");
  const raw = fs.readFileSync(file, "utf8");
  const data = parse(raw);
  const result = uiStringsSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`content/ui/strings.yaml failed validation: ${result.error.message}`);
  }
  cached = result.data;
  return cached;
}

/** Replace `{name}` placeholders, matching components/ui/ui-strings.ts's `fmt`. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}
