// app/learn/page.tsx — course map (brief §7 thin wiring).
import type { Metadata } from "next";
import { CourseMapPage } from "@/components/layout";
import { ui } from "@/components/ui/ui-strings";
import { getCourse } from "@/lib/content/course";

export const metadata: Metadata = { title: ui().courseMap.title };

export default function Page() {
  const { stages } = getCourse();
  return <CourseMapPage stages={stages} />;
}
