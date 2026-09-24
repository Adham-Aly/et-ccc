# Product

<!-- impeccable:product-schema 1 -->

<!-- Written by the P4 design lead through Impeccable `init`. No interview partner was available in this run (the phase orchestrator relays no user questions); every fact below is taken from the project documents named in brackets, and the few inferences are marked "Inferred". Answers and assumptions are logged in work/04-app/_working/design-notes.md. -->

## Platform

web

## Users

**One learner, a secondary-school student, who has never written a line of code.** [project-brief §2, R3] They read on a laptop at a desk after school, for 20 to 60 minutes at a time, over many months (Inferred from the ~215-lesson scope and plan §4.8 "months of study"). A phone is the second device: a lesson started on the laptop is sometimes finished on the bus or in bed, so phones must be comfortable, not just functional. [plan §4.9]

The learner's job on a lesson page is to **understand one idea well enough to use it on a real problem later**: read the explanation, look at the example code and its output, step through the animation until the idea clicks, then leave the app to practise on an online judge. They come back to the course map to find where they stopped.

Secondary readers (not designed for, but present): the Manager (a parent or mentor figure who built the course and reviews it on preview links) and reviewers checking the content.

## Product Purpose

A free, non-commercial reading course that takes the learner from zero programming to the algorithms needed for every level of the **CCC Senior** contest (S1 to S5), in **Python 3.8** (the language level of the CCC grader's PyPy). [plan §2.1]

It teaches with prose, worked examples, read-only Python code, input and output panels, and a large number of animated step-throughs and code traces recorded at authoring time. Practice happens **outside** the app, on WMOJ and DMOJ, through a short list of real CCC problems at the end of each module. [plan §2.1, §4.6.4]

Success is quiet: the learner keeps coming back, reads a lesson to the end, understands it, and goes to practise. There are no scores, streaks or dashboards to measure it. [plan §2.3]

## Positioning

The only course that goes from "never programmed" to CCC Senior S5 **in Python 3.8 specifically**, and that shows every program actually running (line-by-line traces and algorithm step-throughs replayed from real PyPy 3.8 runs) instead of describing it. Every shown output was produced by running the shown code; every problem link is derived from a verified registry. [plan §4.5, §4.7, §4.11]

## Operating Context

- **Reading sessions**, long-form: a lesson is about 800 to 1,300 words plus code and visuals. Scale: about 215 lessons in 104 modules across stages 0 to 7 plus a contest-skills track C. [plan §2.2]
- **Leaving and returning**: the learner copies code into their own editor (copy button) and opens judge problems in new tabs. "Mark as read" and "Continue where you left off" are the only state, held in one localStorage key. [plan §4.8]
- **Surfaces and their modes** (Impeccable modes):

  | Route | Surface | Mode |
  |---|---|---|
  | `/` | Home: what the course is, how to use it, continue, stage overview | Read (a docs index is Read, not Persuade) |
  | `/start` | Getting started: how practice works on the judges, what the CCC is | Read |
  | `/learn` | Course map: stages → modules, read marks, "Coming soon" | Read, with light Operate wayfinding |
  | `/learn/[stage]/[module]` | Module overview: objectives, lessons, practice list, prerequisites | Read |
  | `/learn/[stage]/[module]/[lesson]` | **Lesson reader** (the core surface) | Read |
  | `/problems` | All 119 registry problems by year and level, with judge links and "taught in" backlinks | Read, reference table |
  | `/search` and the header dialog | Full search | Operate |
  | `/glossary` | Terms, each linked to its introducing lesson | Read, reference |
  | `/about` | Credits, CEMC attribution, judge acknowledgements, "this app is free" | Read |
  | 404 | Friendly not-found with links back | Read |
  | `/dev/viz` | Visual gallery, previews only | Internal |

  [plan §4.10]

## Capabilities and Constraints

- **Reading only.** No code execution, no editor, no in-browser Python, no judge, no grading, no exercises, quizzes, checkpoints, predict-the-output or answer boxes. "Try it" suggestions are prose only. [plan §2.3, D-020]
- **Client interactivity is limited to five features:** search, mark-as-read, visual players, copy-code button, mobile navigation toggle. Everything else is server-rendered; hints and spoilers use native `<details>`. [plan §4.8]
- **Light mode only.** `color-scheme: light`; no dark theme, no `prefers-color-scheme: dark`, no `dark:` classes. [R6, plan §4.9]
- **No score targets** of any kind: no target scores, cutoffs, ceilings, medals, CCO qualification, percentiles, "full marks" as a goal, or "Python can't / is too slow". [R14, plan §6.5]
- **No problem walkthroughs, editorials, solution pages or per-problem hints**, and no mention that one exists anywhere. A practice entry carries at most a one-line note and, for some DMOJ entries, a one-line "why". [R17, plan §4.6.4]
- **No system or environment setup content**: no OS instructions, online editors, or installing Python, PyPy or Thonny. [R18]
- **Problem links only through the registry**: CCC 2014–2026 only; 2021–2026 → WMOJ (preferred), 2014–2020 → DMOJ. Crossovers render as "2022 J4 (same problem as 2022 S2)". [R13, plan §4.7]
- **Python 3.8 only** in every shown code sample. Deliberately invalid examples carry a "not valid on the CCC grader" label; deliberately failing programs show their real traceback. [plan §4.4]
- **Visuals come only from the in-house library** (nine visualizers, a shared player, scenes), fed by data recorded under PyPy 3.8. Nothing executes in the browser; the first frame is server-rendered and fully meaningful; no autoplay. [plan §4.11]
- **Draft states**: previews show `gated`/`reviewed` modules with a Draft badge; `planned`/`drafted` modules show "Coming soon" with no link. Production shows only `accepted`. [brief A6]
- **All learner-facing UI copy** lives in `content/ui/strings.yaml` (P5 writes the final copy). [plan §4.6.2]
- **Stack**: Next.js 16 App Router, all pages static; Tailwind 4 `@theme` tokens; Shiki with one custom light theme; Motion inside visuals only; self-hosted WOFF2 fonts; no remote assets at runtime. [plan §4.2, brief A10, A12]
- **Open (undecided) facts**: the learner-facing product name is not decided in any project document. Until P5 or the Manager sets it in `ui/strings.yaml`, the header wordmark reads from that file and design work uses the neutral working title "CCC Python Course" (Inferred placeholder).

## Brand Commitments

- Tone: **calm, encouraging, focused.** [plan §4.9] Teaching prose uses the avoid-ai-writing skill in its `warm` voice and `docs` context. [plan §6.3, R16]
- The CCC and its problems belong to the CEMC (University of Waterloo). The app is not affiliated with the CEMC and must not look like an official CEMC product; attribution (CC BY-NC 4.0) lives on `/about`. [plan §2.1, C17] (The "not official" framing is Inferred from the copyright constraint.)
- The app is free; nothing may charge for access to past contests. [C17]
- No logo or identity assets exist. None may be invented that imitate CEMC, WMOJ or DMOJ marks; judges are named in text badges only (Inferred).

## Evidence on Hand

- Course structure: `research/01-recon/curriculum-map.md` (module IDs and titles; its "Contest payoff" column and score lines are on the leak list and never appear in the app, plan §5.4).
- Registry: 119 CCC 2014–2026 problems (stubbed in P4, `content/registry/ccc-problems.yaml`).
- Fixture course for previews: `main-app/tests/fixtures/content/` (stage `fx`).
- There are **no** testimonials, user counts, results, outcomes or endorsements, and none may be fabricated.

## Product Principles

1. **The page is for reading.** Every screen serves comprehension of one idea at a time; chrome recedes, the lesson column leads.
2. **Show it running, never claim it.** Outputs, traces and animations come from real runs; nothing checkable is typed by hand.
3. **Steady, not pressuring.** No scores, streaks, targets or urgency; the only progress signal is a quiet "read" mark the learner sets.
4. **Practice lives on the judges.** The app teaches and points; it never solves, hints, or grades.
5. **Trust through precision.** Correct Python 3.8, correct links, pixel-careful layout; a beginner should never have to wonder whether the page is wrong.

## Accessibility & Inclusion

- **WCAG 2.2 AA** throughout: visible focus, adequate target sizes (24 px minimum, 44 px for primary touch targets on phones), skip link, logical headings, code blocks scroll inside themselves. [plan §4.9]
- Visuals: every one in a `Figure` with caption and text alternative; step-throughs offer "Read the steps as text"; caption regions are `aria-live="polite"`; players are fully keyboard-operable; no flashing, no motion without a user action; `prefers-reduced-motion` turns transitions into snaps or cross-fades. [plan §4.11.4]
- State in visuals is never shown by colour alone (colour-blind safe, readable in greyscale). [plan §4.11.3]
- Viewports tested: 390×844, 768×1024, 1440×900, plus a 1920×1080 smoke. [plan §4.9]
- Reader is an absolute beginner and a teenager: plain words in UI copy, no jargon in labels, every term defined on first use.
