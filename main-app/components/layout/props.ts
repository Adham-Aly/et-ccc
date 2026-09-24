// View-model props for the presentational page components (W2, components/layout/).
//
// Seam (brief §7, orchestrator ruling batch 2 #1): lib/content/types.ts (W1) is now the source
// of truth. This file re-exports the same names so W2's existing imports keep working.
export type {
  CourseMapPageProps,
  CourseNav,
  GlossaryPageProps,
  GlossaryTermView,
  HomePageProps,
  Judge,
  LessonLink,
  LessonPageProps,
  ModuleLink,
  ModulePageProps,
  ModuleStatus,
  PracticeItemView,
  ProblemsPageProps,
  ProblemView,
  ProsePageProps,
  StageLink,
  TocItem,
} from "../../lib/content/types";
