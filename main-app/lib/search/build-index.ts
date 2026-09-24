// lib/search/build-index.ts — builds the static search index entries (plan §4.8): every
// readable lesson, every glossary term, every registry problem. Server-only (reads content from
// disk via lib/content). Consumed by app/search-index.json/route.ts at build time.
import { getCourse } from "../content/course";
import { getGlossaryTerms } from "../content/glossary";
import { getAllProblems } from "../content/registry";

export interface SearchIndexEntry {
  kind: "lesson" | "term" | "problem";
  id: string;
  title: string;
  label: string;
  snippet?: string;
  href: string;
}

export function buildSearchIndex(): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];

  for (const stage of getCourse().stages) {
    for (const m of stage.modules) {
      if (!m.href) continue;
      for (const lesson of m.lessons) {
        entries.push({
          kind: "lesson",
          id: lesson.id,
          title: lesson.title,
          label: m.id,
          href: lesson.href,
        });
      }
    }
  }

  for (const term of getGlossaryTerms()) {
    entries.push({
      kind: "term",
      id: term.id,
      title: term.term,
      label: term.term.charAt(0).toUpperCase(),
      snippet: typeof term.definition === "string" ? term.definition : undefined,
      href: `/glossary#${term.id}`,
    });
  }

  for (const problem of getAllProblems()) {
    entries.push({
      kind: "problem",
      id: problem.id,
      title: problem.title,
      label: `${problem.year} ${problem.level}${problem.number}`,
      href: problem.url,
    });
  }

  return entries;
}
