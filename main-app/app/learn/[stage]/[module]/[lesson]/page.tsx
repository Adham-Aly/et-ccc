// app/learn/[stage]/[module]/[lesson]/page.tsx — lesson reader (brief §7 thin wiring).
import { notFound } from "next/navigation";
import { LessonPage } from "@/components/layout";
import { getAllLessonRouteParams } from "@/lib/content/course";
import { getLessonPageData } from "@/lib/content/lesson";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLessonRouteParams();
}

export default async function Page({
  params,
}: {
  params: Promise<{ stage: string; module: string; lesson: string }>;
}) {
  const { stage, module, lesson } = await params;
  const data = await getLessonPageData(stage, module, lesson);
  if (!data) notFound();
  return <LessonPage {...data} />;
}
