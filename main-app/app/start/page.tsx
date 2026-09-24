// app/start/page.tsx — how the course and practice work (brief §7 thin wiring, plan §4.10).
import type { Metadata } from "next";
import { StartPage } from "@/components/layout";
import { getStartPageContent } from "@/lib/content/pages";

export const metadata: Metadata = { title: "Start here" };

export default function Page() {
  return <StartPage {...getStartPageContent()} />;
}
