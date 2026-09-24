// lib/content/course.ts — the course structure loader (plan §4.6, brief A4).
//
// Reads content/course.yaml (real course) and, in non-production builds, also
// tests/fixtures/content/course.yaml (the "fx" fixture stage, brief A4) and merges them. For
// every module, checks whether it has been authored on disk (a module directory with
// module.yaml under stages/<stageDir>/<moduleDir>/) — real content has none yet (P5 writes
// them); the fixture course does. Unauthored modules render as "Coming soon" with no link,
// regardless of the status.yaml says (which is always "planned" for them in course.yaml).
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { getBuildEnv, isDraftStatus, visibleStatuses } from "./env";
import { type CourseStageEntry, courseSchema, moduleFileSchema } from "./schemas";
import { moduleDirName, stageDirName } from "./slug";
import type { LessonLink, ModuleLink, ModuleStatus, StageLink } from "./types";

const REAL_ROOT = path.join(process.cwd(), "content");
const FIXTURE_ROOT = path.join(process.cwd(), "tests", "fixtures", "content");

interface StageSource {
  entry: CourseStageEntry;
  root: string;
}

function readCourseYaml(root: string): CourseStageEntry[] {
  const file = path.join(root, "course.yaml");
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf8");
  const data = courseSchema.parse(parse(raw));
  return data.stages;
}

function collectStageSources(): StageSource[] {
  const real = readCourseYaml(REAL_ROOT).map((entry) => ({ entry, root: REAL_ROOT }));
  if (getBuildEnv() === "production") return real;
  const fixture = readCourseYaml(FIXTURE_ROOT).map((entry) => ({ entry, root: FIXTURE_ROOT }));
  return [...real, ...fixture];
}

function findModuleDir(
  root: string,
  stageId: string,
  stageTitle: string,
  moduleId: string,
  moduleTitle: string,
): string | null {
  const stageDir = path.join(root, "stages", stageDirName(stageId, stageTitle));
  if (!fs.existsSync(stageDir)) return null;
  const exact = path.join(stageDir, moduleDirName(moduleId, moduleTitle));
  if (fs.existsSync(path.join(exact, "module.yaml"))) return exact;
  // Fall back to scanning for a directory that starts with the module id (title text may drift
  // slightly between course.yaml and module.yaml during authoring).
  for (const entry of fs.readdirSync(stageDir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith(`${moduleId}-`)) {
      const dir = path.join(stageDir, entry.name);
      if (fs.existsSync(path.join(dir, "module.yaml"))) return dir;
    }
  }
  return null;
}

function readLessonTitle(lessonFile: string): string {
  const raw = fs.readFileSync(lessonFile, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (m?.[1]) {
    const fm = parse(m[1]) as { title?: string };
    if (fm?.title) return fm.title;
  }
  const h1 = raw.match(/^#\s+(.+)$/m);
  return h1?.[1] ? h1[1].trim() : path.basename(lessonFile, ".mdx");
}

function buildModuleLink(
  stageId: string,
  stageTitle: string,
  root: string,
  entry: { id: string; title: string; status: ModuleStatus; prereqs: string[] },
): ModuleLink {
  const dir = findModuleDir(root, stageId, stageTitle, entry.id, entry.title);
  const visible = visibleStatuses().includes(entry.status);

  let lessons: LessonLink[] = [];
  if (dir) {
    const moduleYamlPath = path.join(dir, "module.yaml");
    const moduleData = moduleFileSchema.parse(parse(fs.readFileSync(moduleYamlPath, "utf8")));
    lessons = moduleData.lessons.map((slug) => {
      const lessonFile = path.join(dir, "lessons", `${slug}.mdx`);
      const title = fs.existsSync(lessonFile) ? readLessonTitle(lessonFile) : slug;
      return {
        id: `${entry.id}/${slug}`,
        title,
        href: `/learn/${stageId}/${encodeURIComponent(entry.id)}/${slug}`,
      };
    });
  }

  const hasLessons = lessons.length > 0;
  const href = visible && hasLessons ? `/learn/${stageId}/${encodeURIComponent(entry.id)}` : null;

  return {
    id: entry.id,
    title: entry.title,
    href,
    status: entry.status,
    lessons,
  };
}

export function getCourse(): { stages: StageLink[] } {
  const sources = collectStageSources();
  const stages: StageLink[] = sources.map(({ entry, root }) => ({
    id: entry.id,
    number: entry.number,
    title: entry.title,
    goal: entry.goal,
    href: `/learn#stage-${entry.id}`,
    modules: entry.modules.map((m) => buildModuleLink(entry.id, entry.title, root, m)),
  }));
  return { stages };
}

export function getStage(stageId: string): StageLink | null {
  return getCourse().stages.find((s) => s.id === stageId) ?? null;
}

export function getModule(stageId: string, moduleId: string): ModuleLink | null {
  const stage = getStage(stageId);
  return stage?.modules.find((m) => m.id === moduleId) ?? null;
}

function findModuleLinkAnywhere(moduleId: string): ModuleLink | null {
  for (const stage of getCourse().stages) {
    const m = stage.modules.find((mm) => mm.id === moduleId);
    if (m) return m;
  }
  return null;
}

/** A module's prerequisite modules, resolved across every stage (course.yaml prereqs). */
export function getModulePrerequisites(moduleId: string): ModuleLink[] {
  for (const { entry } of collectStageSources()) {
    const moduleEntry = entry.modules.find((m) => m.id === moduleId);
    if (!moduleEntry) continue;
    return moduleEntry.prereqs
      .map((id) => findModuleLinkAnywhere(id))
      .filter((m): m is ModuleLink => m !== null);
  }
  return [];
}

/** A module's objectives and raw practice-list ids, read from its module.yaml (empty when unauthored). */
export function getModuleAuthoredData(
  stageId: string,
  moduleId: string,
): {
  objectives: string[];
  practice: { id: string; note?: string; why?: string }[];
  lessons: string[];
  dir: string | null;
} {
  for (const { entry, root } of collectStageSources()) {
    if (entry.id !== stageId) continue;
    const moduleEntry = entry.modules.find((m) => m.id === moduleId);
    if (!moduleEntry) continue;
    const dir = findModuleDir(root, stageId, entry.title, moduleId, moduleEntry.title);
    if (!dir) return { objectives: [], practice: [], lessons: [], dir: null };
    const moduleData = moduleFileSchema.parse(
      parse(fs.readFileSync(path.join(dir, "module.yaml"), "utf8")),
    );
    return {
      objectives: moduleData.objectives,
      practice: moduleData.practice,
      lessons: moduleData.lessons,
      dir,
    };
  }
  return { objectives: [], practice: [], lessons: [], dir: null };
}

export { isDraftStatus };

/** Every `[stage]/[module]` pair that has at least one authored lesson (for generateStaticParams). */
export function getAllModuleRouteParams(): { stage: string; module: string }[] {
  const out: { stage: string; module: string }[] = [];
  for (const stage of getCourse().stages) {
    for (const m of stage.modules) {
      if (m.href) out.push({ stage: stage.id, module: m.id });
    }
  }
  return out;
}

/** Every `[stage]/[module]/[lesson]` triple with an authored lesson (for generateStaticParams). */
export function getAllLessonRouteParams(): { stage: string; module: string; lesson: string }[] {
  const out: { stage: string; module: string; lesson: string }[] = [];
  for (const stage of getCourse().stages) {
    for (const m of stage.modules) {
      if (!m.href) continue;
      for (const lesson of m.lessons) {
        const slug = lesson.id.split("/")[1] ?? lesson.id;
        out.push({ stage: stage.id, module: m.id, lesson: slug });
      }
    }
  }
  return out;
}

/** Every readable lesson, in course order (home page's "Continue where you left off"). */
export function getLessonOrder(): (LessonLink & { moduleId: string })[] {
  const out: (LessonLink & { moduleId: string })[] = [];
  for (const stage of getCourse().stages) {
    for (const m of stage.modules) {
      if (!m.href) continue;
      for (const lesson of m.lessons) {
        out.push({ ...lesson, moduleId: m.id });
      }
    }
  }
  return out;
}

/** The first readable lesson of the course, if any (home page's continue-block fallback). */
export function getFirstLesson(): LessonLink | null {
  return getLessonOrder()[0] ?? null;
}
