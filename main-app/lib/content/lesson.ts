// lib/content/lesson.ts — assembles one lesson page's full data: compiled MDX body, reading
// time, table of contents, and prev/next navigation (crossing into the next visible module when
// a module's last lesson is reached, plan §4.10 "previous/next").
import fs from "node:fs";
import { getCourse, getModule, getModuleAuthoredData, getStage } from "./course";
import { compileLesson } from "./mdx";
import { readingMinutes } from "./reading-time";
import { resolvePracticeItem } from "./registry";
import { extractToc } from "./toc";
import type { LessonLink, LessonPageProps } from "./types";

/** Every readable lesson across the whole course, in course order — used for prev/next. */
function flatLessonList(): {
  stageId: string;
  moduleId: string;
  moduleTitle: string;
  lesson: LessonLink;
}[] {
  const out: { stageId: string; moduleId: string; moduleTitle: string; lesson: LessonLink }[] = [];
  for (const stage of getCourse().stages) {
    for (const m of stage.modules) {
      if (!m.href) continue;
      for (const lesson of m.lessons) {
        out.push({ stageId: stage.id, moduleId: m.id, moduleTitle: m.title, lesson });
      }
    }
  }
  return out;
}

export async function getLessonPageData(
  stageId: string,
  moduleId: string,
  lessonSlug: string,
): Promise<LessonPageProps | null> {
  const stage = getStage(stageId);
  const moduleLink = getModule(stageId, moduleId);
  if (!stage || !moduleLink?.href) return null;

  const { practice: rawPractice, dir } = getModuleAuthoredData(stageId, moduleId);
  if (!dir) return null;

  const lessonId = `${moduleId}/${lessonSlug}`;
  const lessonIndex = moduleLink.lessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex === -1) return null;

  const isLastLessonOfModule = lessonIndex === moduleLink.lessons.length - 1;
  const practiceItems = isLastLessonOfModule
    ? rawPractice.map((p) => resolvePracticeItem(p.id, { note: p.note, why: p.why }))
    : [];

  const { frontmatter, body } = await compileLesson(dir, lessonSlug, practiceItems);
  const rawMdx = fs.readFileSync(`${dir}/lessons/${lessonSlug}.mdx`, "utf8");

  const flat = flatLessonList();
  const flatIndex = flat.findIndex((f) => f.lesson.id === lessonId);
  const prevEntry = flatIndex > 0 ? flat[flatIndex - 1] : undefined;
  const nextEntry = flatIndex >= 0 && flatIndex < flat.length - 1 ? flat[flatIndex + 1] : undefined;

  return {
    lesson: {
      id: lessonId,
      title: frontmatter.title,
      index: lessonIndex + 1,
      count: moduleLink.lessons.length,
      readingMinutes: readingMinutes(rawMdx),
      objectives: frontmatter.objectives,
      toc: extractToc(rawMdx),
      body,
    },
    module: moduleLink,
    stage,
    nav: {
      prev: prevEntry ? { ...prevEntry.lesson, moduleTitle: prevEntry.moduleTitle } : null,
      next: nextEntry ? { ...nextEntry.lesson, moduleTitle: nextEntry.moduleTitle } : null,
    },
    courseNav: {
      stages: getCourse().stages,
      currentStageId: stageId,
      currentModuleId: moduleId,
      currentLessonId: lessonId,
    },
  };
}
