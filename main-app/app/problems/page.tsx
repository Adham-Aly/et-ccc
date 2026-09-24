// app/problems/page.tsx — every registry problem, grouped by year (brief §7 thin wiring).
import type { Metadata } from "next";
import { ProblemsPage } from "@/components/layout";
import { ui } from "@/components/ui/ui-strings";
import { getProblemsGrouped } from "@/lib/content/registry";

export const metadata: Metadata = { title: ui().problems.title };

export default function Page() {
  return <ProblemsPage years={getProblemsGrouped()} />;
}
