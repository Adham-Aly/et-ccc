// app/about/page.tsx — credits and attribution (brief §7 thin wiring, plan §4.10).
import type { Metadata } from "next";
import { AboutPage } from "@/components/layout";
import { getAboutPageContent } from "@/lib/content/pages";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return <AboutPage {...getAboutPageContent()} />;
}
