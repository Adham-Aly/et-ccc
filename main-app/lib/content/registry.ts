// lib/content/registry.ts — loads content/registry/ccc-problems.yaml and
// content/registry/external-links.yaml, and builds ProblemView / PracticeItemView (plan §4.7).
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { judgeForYear, judgeUrl } from "../registry/judge-url";
import { externalLinksSchema, type RegistryProblemEntry, registrySchema } from "./schemas";
import type { PracticeItemView, ProblemView } from "./types";

const REGISTRY_DIR = path.join(process.cwd(), "content", "registry");

let cachedProblems: RegistryProblemEntry[] | null = null;

function loadProblems(): RegistryProblemEntry[] {
  if (cachedProblems) return cachedProblems;
  const raw = fs.readFileSync(path.join(REGISTRY_DIR, "ccc-problems.yaml"), "utf8");
  cachedProblems = registrySchema.parse(parse(raw)).problems;
  return cachedProblems;
}

let cachedLinks: Record<string, { label: string; url: string }> | null = null;

export function getExternalLink(id: string): { label: string; url: string } {
  if (!cachedLinks) {
    const raw = fs.readFileSync(path.join(REGISTRY_DIR, "external-links.yaml"), "utf8");
    const data = externalLinksSchema.parse(parse(raw));
    cachedLinks = Object.fromEntries(data.links.map((l) => [l.id, { label: l.label, url: l.url }]));
  }
  const link = cachedLinks[id];
  if (!link) throw new Error(`external-links.yaml: no entry with id "${id}"`);
  return link;
}

function toProblemView(entry: RegistryProblemEntry): ProblemView {
  const judge = judgeForYear(entry.year);
  const url = judgeUrl(entry.id, entry.year);
  const view: ProblemView = {
    id: entry.id,
    year: entry.year,
    level: entry.level,
    number: entry.number,
    title: entry.title,
    judge,
    url,
  };
  return view;
}

/** All registry problems, canonical (Senior) entries only — as rendered on /problems. */
export function getAllProblems(): ProblemView[] {
  return loadProblems().map(toProblemView);
}

export function getProblem(id: string): ProblemView | null {
  const entry = loadProblems().find((p) => p.id === id);
  return entry ? toProblemView(entry) : null;
}

/**
 * Resolves a practice list entry, expanding a Junior alias into a "sameAs" view when the
 * module's practice list names the alias rather than the canonical (Senior) id.
 */
export function resolvePracticeItem(
  registryId: string,
  extra: { note?: string; why?: string } = {},
): PracticeItemView {
  const canonical = loadProblems().find(
    (p) =>
      p.id === registryId ||
      p.aliases.some(
        (a) =>
          `ccc${String(p.year % 100).padStart(2, "0")}${a.level.toLowerCase()}${a.number}` ===
          registryId,
      ),
  );
  if (!canonical) {
    throw new Error(`registry: no problem or alias with id "${registryId}"`);
  }
  const view = toProblemView(canonical);
  if (canonical.id !== registryId) {
    // registryId named the Junior alias; render it as such with "same problem as" text.
    const alias = canonical.aliases.find(
      (a) =>
        `ccc${String(canonical.year % 100).padStart(2, "0")}${a.level.toLowerCase()}${a.number}` ===
        registryId,
    );
    if (alias) {
      view.sameAs = { year: canonical.year, level: canonical.level, number: canonical.number };
      // Present the Junior side as the primary label; year/level/number reflect the alias.
      return {
        problem: { ...view, level: alias.level, number: alias.number, sameAs: view.sameAs },
        ...extra,
      };
    }
  }
  return { problem: view, ...extra };
}

/** /problems: every problem grouped by year (descending), Junior then Senior within a year. */
export function getProblemsGrouped(): { year: number; problems: ProblemView[] }[] {
  const byYear = new Map<number, ProblemView[]>();
  for (const p of getAllProblems()) {
    const list = byYear.get(p.year) ?? [];
    list.push(p);
    byYear.set(p.year, list);
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, problems]) => ({
      year,
      problems: problems.sort((a, b) => a.level.localeCompare(b.level) || a.number - b.number),
    }));
}

/** Every unique registry id a problem can be referenced by (canonical + Junior aliases). */
export function getRegistryProblemIds(): string[] {
  const ids: string[] = [];
  for (const p of loadProblems()) {
    ids.push(p.id);
    for (const a of p.aliases) {
      ids.push(`ccc${String(p.year % 100).padStart(2, "0")}${a.level.toLowerCase()}${a.number}`);
    }
  }
  return ids;
}
