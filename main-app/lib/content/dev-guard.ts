// lib/content/dev-guard.ts — shared production gate for every `/dev/*` route (plan §4.10:
// "/dev/viz ... exists only in local and preview builds and returns 404 in production"; the same
// rule applies to `/dev/design`, orchestrator relay). Both `app/dev/viz/page.tsx` (W3) and
// `app/dev/design/page.tsx` (W2) call this first.
import { notFound } from "next/navigation";
import { isProduction } from "./env";

/** Call at the top of a `/dev/*` route's page component. 404s in production, no-ops otherwise. */
export function notFoundOutsideDevPreview(): void {
  if (isProduction()) {
    notFound();
  }
}
