// lib/search/client.ts — lazy-loaded client search (plan §4.8): fetches the static
// /search-index.json and builds a MiniSearch instance. Only imported from client components
// that open search, so MiniSearch's JS never ships on a page that never opens it.
import MiniSearch from "minisearch";
import type { SearchIndexEntry } from "./build-index";

export type { SearchIndexEntry as SearchResult };

export interface SearchEngine {
  search(query: string): SearchIndexEntry[];
}

let cached: Promise<SearchEngine> | null = null;

export function loadSearch(): Promise<SearchEngine> {
  if (cached) return cached;
  const promise = (async () => {
    const res = await fetch("/search-index.json");
    if (!res.ok) throw new Error(`search index fetch failed: ${res.status}`);
    const entries: SearchIndexEntry[] = await res.json();

    const mini = new MiniSearch<SearchIndexEntry>({
      fields: ["title", "label", "snippet"],
      storeFields: ["kind", "id", "title", "label", "snippet", "href"],
      idField: "href", // href is unique across every entry kind
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 } },
    });
    mini.addAll(entries);

    return {
      search(query: string): SearchIndexEntry[] {
        if (!query.trim()) return [];
        return mini.search(query).map((r) => ({
          kind: r.kind,
          id: r.id,
          title: r.title,
          label: r.label,
          snippet: r.snippet,
          href: r.href,
        }));
      },
    };
  })().catch((err: unknown) => {
    // Let a failed fetch/parse be retried (e.g. a "Try again" button) instead of caching a
    // permanently-rejected promise.
    cached = null;
    throw err;
  });
  cached = promise;
  return promise;
}
