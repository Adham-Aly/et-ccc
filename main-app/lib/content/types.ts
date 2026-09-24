// lib/content/types.ts — canonical view-model types for the presentational page components
// (brief §7 seam: W1 owns this file; W2's components/layout/props.ts re-exports from here).
// These are the shapes the content loader (lib/content/loader.ts) produces and every
// `app/**/page.tsx` passes straight through to its presentational component.
import type { ReactNode } from "react";
import type { Judge } from "../registry/judge-url";

/** Module lifecycle (plan §4.6.5). */
export type ModuleStatus = "planned" | "drafted" | "gated" | "reviewed" | "accepted";

export type { Judge };

export interface LessonLink {
  /** `<moduleId>/<slug>`, the read-state key. */
  id: string;
  title: string;
  href: string;
}

export interface ModuleLink {
  /** Map ID, e.g. `M4.3`, `C.3`. */
  id: string;
  title: string;
  /** null when the module is not readable (planned/drafted, or not visible in this build). */
  href: string | null;
  status: ModuleStatus;
  /** One line, optional (course map). */
  description?: string;
  lessons: LessonLink[];
}

export interface StageLink {
  /** `s0`…`s7`, `c`, `fx`. */
  id: string;
  /** Display number: "0"…"7", "C". */
  number: string;
  title: string;
  /** One-line goal from course.yaml. Never score/payoff wording (plan §5.4). */
  goal?: string;
  /** `/learn#stage-<id>`. */
  href: string;
  modules: ModuleLink[];
}

/** One registry problem as rendered anywhere (ProblemLink, Practice, /problems). */
export interface ProblemView {
  /** Registry id = judge slug, e.g. `ccc23s1`. */
  id: string;
  year: number;
  level: "J" | "S";
  number: number;
  title: string;
  judge: Judge;
  /** From judgeUrl() only (R13). */
  url: string;
  /**
   * Set when this reference is a Junior alias of a Senior problem: renders
   * "2022 J4 (same problem as 2022 S2)". Holds the canonical (Senior) label parts.
   */
  sameAs?: { year: number; level: "J" | "S"; number: number };
  /** Modules that list this problem in their practice list (/problems "Taught in"). */
  taughtIn?: { id: string; title: string; href: string | null }[];
}

export interface PracticeItemView {
  problem: ProblemView;
  note?: string;
  /** Required for some DMOJ entries (plan §4.7). */
  why?: string;
}

export interface TocItem {
  id: string;
  text: string;
}

export interface CourseNav {
  stages: StageLink[];
  /** Stage and module the page belongs to (sidebar expansion). */
  currentStageId: string;
  currentModuleId: string;
  /** Current lesson id, when on a lesson page. */
  currentLessonId?: string;
}

export interface LessonPageProps {
  lesson: {
    id: string;
    title: string;
    /** 1-based position in the module. */
    index: number;
    count: number;
    readingMinutes: number;
    objectives: string[];
    toc: TocItem[];
    /** The compiled MDX body (W1's pipeline). */
    body: ReactNode;
  };
  module: ModuleLink;
  stage: StageLink;
  /** Practice list, only on the module's last lesson. */
  practice?: PracticeItemView[];
  nav: {
    prev: (LessonLink & { moduleTitle?: string }) | null;
    /** Next lesson, or the next module's first lesson; null → course map. */
    next: (LessonLink & { moduleTitle?: string }) | null;
  };
  courseNav: CourseNav;
}

export interface ModulePageProps {
  module: ModuleLink & { objectives: string[] };
  stage: StageLink;
  prerequisites: ModuleLink[];
  practice: PracticeItemView[];
  courseNav: CourseNav;
}

export interface CourseMapPageProps {
  stages: StageLink[];
}

export interface HomePageProps {
  stages: StageLink[];
  /** First readable lesson of the course (continue block fallback). */
  firstLesson: LessonLink | null;
  /** Every readable lesson in course order, so the continue block can find "next unread". */
  lessonOrder: (LessonLink & { moduleId: string })[];
}

export interface ProblemsPageProps {
  /** Grouped by year, descending; within a year Junior then Senior, by number. */
  years: { year: number; problems: ProblemView[] }[];
}

export interface GlossaryTermView {
  id: string;
  term: string;
  /** Plain text or small rendered MDX. */
  definition: ReactNode;
  introducedIn?: { lessonId: string; title: string; moduleId: string; href: string | null };
}

export interface GlossaryPageProps {
  terms: GlossaryTermView[];
}

export interface ProsePageProps {
  /** /start and /about: compiled MDX or authored markup. */
  title: string;
  lede?: string;
  body: ReactNode;
}

// SearchPage takes no props: it reads ?q= and the static index on the client.
