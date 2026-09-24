"use client";

import { useEffect, useState } from "react";
import { type SearchLabels, SearchPanel } from "./SearchDialog";

/** Reads ?q= once on mount (static page, no server search params), then keeps it in the URL. */
export function SearchPageClient({ labels }: { labels: SearchLabels }) {
  const [q, setQ] = useState<string | null>(null);
  useEffect(() => {
    setQ(new URL(window.location.href).searchParams.get("q") ?? "");
  }, []);
  if (q === null) return <SearchPanel labels={labels} key="ssr" />;
  return <SearchPanel labels={labels} initialQuery={q} autoFocus syncUrl key="client" />;
}
