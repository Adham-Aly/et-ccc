// app/glossary/page.tsx — every glossary term (brief §7 thin wiring).
import type { Metadata } from "next";
import { GlossaryPage } from "@/components/layout";
import { ui } from "@/components/ui/ui-strings";
import { getGlossaryTerms } from "@/lib/content/glossary";

export const metadata: Metadata = { title: ui().glossary.title };

export default function Page() {
  return <GlossaryPage terms={getGlossaryTerms()} />;
}
