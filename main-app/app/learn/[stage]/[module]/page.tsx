// app/learn/[stage]/[module]/page.tsx — module overview (brief §7 thin wiring).
import { notFound } from "next/navigation";
import { ModulePage } from "@/components/layout";
import type { CourseNav } from "@/components/layout/props";
import {
  getAllModuleRouteParams,
  getCourse,
  getModule,
  getModuleAuthoredData,
  getModulePrerequisites,
  getStage,
} from "@/lib/content/course";
import { resolvePracticeItem } from "@/lib/content/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllModuleRouteParams();
}

export default async function Page({
  params,
}: {
  params: Promise<{ stage: string; module: string }>;
}) {
  const { stage: stageId, module: moduleId } = await params;
  const stage = getStage(stageId);
  const module = getModule(stageId, moduleId);
  if (!stage || !module?.href) notFound();

  const { objectives, practice: rawPractice } = getModuleAuthoredData(stageId, moduleId);
  const practice = rawPractice.map((p) => resolvePracticeItem(p.id, { note: p.note, why: p.why }));
  const prerequisites = getModulePrerequisites(moduleId);
  const { stages } = getCourse();
  const courseNav: CourseNav = { stages, currentStageId: stageId, currentModuleId: moduleId };

  return (
    <ModulePage
      module={{ ...module, objectives }}
      stage={stage}
      prerequisites={prerequisites}
      practice={practice}
      courseNav={courseNav}
    />
  );
}
