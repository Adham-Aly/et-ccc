// lib/content/schemas.ts — Zod schemas for every YAML file the loader reads (plan §4.6, G-SCHEMA).
// A build/content:check failure here always names the file and field (plan §4.6.2).
import { z } from "zod";

const moduleIdRe = /^(M\d+\.\d+|C\.\d+)$/;
const stageIdRe = /^(s\d+|c|fx)$/;
const moduleStatusEnum = z.enum(["planned", "drafted", "gated", "reviewed", "accepted"]);

// --- content/course.yaml ----------------------------------------------------------------------

export const courseModuleSchema = z.object({
  id: z.string().regex(moduleIdRe, "module id must look like M4.3 or C.3"),
  title: z.string().min(1),
  prereqs: z.array(z.string().regex(moduleIdRe)).default([]),
  status: moduleStatusEnum,
});

export const courseStageSchema = z.object({
  id: z.string().regex(stageIdRe, "stage id must look like s0..s7, c or fx"),
  number: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().optional(),
  modules: z.array(courseModuleSchema),
});

export const courseSchema = z.object({
  stages: z.array(courseStageSchema),
});
export type CourseFile = z.infer<typeof courseSchema>;
export type CourseModuleEntry = z.infer<typeof courseModuleSchema>;
export type CourseStageEntry = z.infer<typeof courseStageSchema>;

// --- stages/<stage>/<Module-slug>/module.yaml -----------------------------------------------

export const modulePracticeItemSchema = z.object({
  id: z.string().min(1), // registry problem id
  note: z.string().optional(),
  why: z.string().optional(),
});

export const moduleFileSchema = z.object({
  id: z.string().regex(moduleIdRe),
  title: z.string().min(1),
  objectives: z.array(z.string()).default([]),
  prereqs: z.array(z.string().regex(moduleIdRe)).default([]),
  lessons: z.array(z.string()).default([]), // lesson slugs, in order
  practice: z.array(modulePracticeItemSchema).default([]),
  status: moduleStatusEnum,
});
export type ModuleFile = z.infer<typeof moduleFileSchema>;

// --- lesson frontmatter (MDX) ------------------------------------------------------------------

export const lessonFrontmatterSchema = z.object({
  title: z.string().min(1),
  objectives: z.array(z.string()).default([]),
});
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;

// --- content/glossary.yaml ---------------------------------------------------------------------

export const glossaryTermSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
  introducedIn: z.string().optional(), // <moduleId>/<slug>
});
export const glossarySchema = z.object({
  terms: z.array(glossaryTermSchema),
});
export type GlossaryFile = z.infer<typeof glossarySchema>;

// --- content/concepts.yaml ---------------------------------------------------------------------

export const conceptFeatureSchema = z.object({
  id: z.string().min(1),
  feature: z.string().min(1),
  introducedIn: z.string().regex(moduleIdRe),
});
export const conceptsSchema = z.object({
  features: z.array(conceptFeatureSchema),
});
export type ConceptsFile = z.infer<typeof conceptsSchema>;

// --- content/ui/strings.yaml (matches components/ui/ui-strings.ts's UiStrings) -----------------

export const uiStringsSchema = z.object({
  siteName: z.string(),
  skipLink: z.string(),
  nav: z.object({
    label: z.string(),
    learn: z.string(),
    problems: z.string(),
    glossary: z.string(),
    start: z.string(),
    about: z.string(),
    menu: z.string(),
    closeMenu: z.string(),
    courseMap: z.string(),
    stage: z.string(),
  }),
  search: z.object({
    trigger: z.string(),
    open: z.string(),
    placeholder: z.string(),
    label: z.string(),
    close: z.string(),
    hintEmpty: z.string(),
    loading: z.string(),
    noResults: z.string(),
    loadFailed: z.string(),
    retry: z.string(),
    groupLessons: z.string(),
    groupTerms: z.string(),
    groupProblems: z.string(),
    pageTitle: z.string(),
  }),
  lesson: z.object({
    breadcrumb: z.string(),
    module: z.string(),
    lesson: z.string(),
    lessonOf: z.string(),
    readingTime: z.string(),
    minutes: z.string(),
    objectives: z.string(),
    onThisPage: z.string(),
    previous: z.string(),
    next: z.string(),
    backToMap: z.string(),
    markRead: z.string(),
    read: z.string(),
    markedOn: z.string(),
    undo: z.string(),
    readState: z.string(),
    unreadState: z.string(),
  }),
  module: z.object({
    stage: z.string(),
    lessons: z.string(),
    lessonCount: z.string(),
    before: z.string(),
    lessonsHeading: z.string(),
    objectives: z.string(),
  }),
  status: z.object({
    draft: z.string(),
    comingSoon: z.string(),
    soon: z.string(),
  }),
  callout: z.object({
    note: z.string(),
    warning: z.string(),
    graderTip: z.string(),
  }),
  code: z.object({
    python: z.string(),
    copy: z.string(),
    copied: z.string(),
    copyFailed: z.string(),
    bad38: z.string(),
    input: z.string(),
    output: z.string(),
    noOutput: z.string(),
    error: z.string(),
    errorRegion: z.string(),
    region: z.string(),
  }),
  term: z.object({
    inGlossary: z.string(),
  }),
  practice: z.object({
    heading: z.string(),
    intro: z.string(),
    why: z.string(),
    sameAs: z.string(),
    opensOn: z.string(),
    judgeHome: z.string(),
    judgeSignup: z.string(),
  }),
  home: z.object({
    lede: z.array(z.string()),
    continueLabel: z.string(),
    startLabel: z.string(),
    sheetIndex: z.string(),
    modules: z.string(),
    howHeading: z.string(),
    how: z.array(z.object({ term: z.string(), text: z.string() })),
  }),
  courseMap: z.object({
    title: z.string(),
    intro: z.string(),
  }),
  problems: z.object({
    title: z.string(),
    intro: z.string(),
    problem: z.string(),
    titleCol: z.string(),
    taughtIn: z.string(),
    notYet: z.string(),
  }),
  glossary: z.object({
    title: z.string(),
    intro: z.string(),
    introducedIn: z.string(),
    letters: z.string(),
  }),
  notFound: z.object({
    title: z.string(),
    body: z.string(),
    courseMap: z.string(),
    search: z.string(),
    home: z.string(),
    drawingLabel: z.string(),
    cell: z.string(),
  }),
});
export type UiStrings = z.infer<typeof uiStringsSchema>;

// --- content/registry/external-links.yaml -------------------------------------------------------

export const externalLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().url(),
});
export const externalLinksSchema = z.object({
  links: z.array(externalLinkSchema),
});
export type ExternalLinksFile = z.infer<typeof externalLinksSchema>;

// --- content/registry/ccc-problems.yaml ---------------------------------------------------------

export const registryAliasSchema = z.object({
  level: z.enum(["J", "S"]),
  number: z.number().int().positive(),
});

export const registryProblemSchema = z.object({
  id: z.string().regex(/^ccc\d{2}[js]\d+$/),
  year: z.number().int(),
  level: z.enum(["J", "S"]),
  number: z.number().int().positive(),
  title: z.string().min(1),
  aliases: z.array(registryAliasSchema).default([]),
  topics: z.array(z.string()).default([]),
  modules: z.array(z.string().regex(moduleIdRe)).default([]),
  internal: z
    .object({
      titleSource: z.string().optional(),
      note: z.string().optional(),
    })
    .default({}),
});
export const registrySchema = z.object({
  problems: z.array(registryProblemSchema),
});
export type RegistryFile = z.infer<typeof registrySchema>;
export type RegistryProblemEntry = z.infer<typeof registryProblemSchema>;

// --- content/registry/verified.json (written only by the verifier, never hand-edited) ----------

export const verifiedEntrySchema = z.object({
  id: z.string(),
  status: z.enum(["ok", "missing", "mismatch", "unverified"]),
  checkedAt: z.string(),
  method: z.enum(["automated", "manual"]),
  titleOnJudge: z.string().optional(),
});
export const verifiedFileSchema = z.object({
  entries: z.array(verifiedEntrySchema),
});
export type VerifiedFile = z.infer<typeof verifiedFileSchema>;
