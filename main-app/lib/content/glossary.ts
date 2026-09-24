// lib/content/glossary.ts — loads content/glossary.yaml (+ the fixture's, non-production) into
// GlossaryTermView[] (plan §4.6, brief A4).
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { getBuildEnv } from "./env";
import { glossarySchema } from "./schemas";
import type { GlossaryTermView } from "./types";

type GlossaryTermEntry = ReturnType<typeof glossarySchema.parse>["terms"][number];

const REAL_FILE = path.join(process.cwd(), "content", "glossary.yaml");
const FIXTURE_FILE = path.join(process.cwd(), "tests", "fixtures", "content", "glossary.yaml");

function readTerms(file: string): GlossaryTermEntry[] {
  if (!fs.existsSync(file)) return [];
  return glossarySchema.parse(parse(fs.readFileSync(file, "utf8"))).terms;
}

let cached: GlossaryTermView[] | null = null;

export function getGlossaryTerms(): GlossaryTermView[] {
  if (cached) return cached;
  const terms = [...readTerms(REAL_FILE)];
  if (getBuildEnv() !== "production") terms.push(...readTerms(FIXTURE_FILE));
  cached = terms
    .map((t) => ({
      id: t.id,
      term: t.term,
      definition: t.definition,
    }))
    .sort((a, b) => a.term.localeCompare(b.term));
  return cached;
}

export function getGlossaryTerm(id: string): GlossaryTermView | null {
  return getGlossaryTerms().find((t) => t.id === id) ?? null;
}
