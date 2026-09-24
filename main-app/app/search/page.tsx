// app/search/page.tsx — full search page (brief §7 thin wiring). No props: reads ?q= and the
// static index client-side (plan §4.8).
import type { Metadata } from "next";
import { SearchPage } from "@/components/layout";
import { ui } from "@/components/ui/ui-strings";

export const metadata: Metadata = { title: ui().search.pageTitle };

export default function Page() {
  return <SearchPage />;
}
