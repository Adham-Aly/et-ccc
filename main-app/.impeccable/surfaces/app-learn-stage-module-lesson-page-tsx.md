---
version: 1
slug: "app-learn-stage-module-lesson-page-tsx"
primary_target: "app/learn/[stage]/[module]/[lesson]/page.tsx"
related_targets: ["app/page.tsx","app/learn/page.tsx","app/learn/[stage]/[module]/page.tsx"]
---

# Surface: lesson reader (`/learn/[stage]/[module]/[lesson]`)

Scope: the core Read-mode surface; every other route (home, course map, module, problems, glossary, search, about, start, 404) inherits its world. Visitor mode: **Read**.

Audience and job: one absolute beginner (secondary-school student) reading one ~1,000-word lesson on a laptop, sometimes a phone; understands one idea through prose, read-only Python, input/output panels and step-through visuals, then leaves to practise on WMOJ/DMOJ. Constraints: PRODUCT.md (light only, no scores, no walkthroughs, no setup content, no exercises, registry-only problem links, Python 3.8 only).

## Direction contract

THESIS: The course is a drawing set and each lesson is one sheet pinned to a drafting board: a crisp white sheet on a pale board-cover green, ruled title blocks for facts, dimension lines for ranges, pencil-dashed outlines for anything not yet final and inked solid lines for anything done. It refuses the category default of a grey docs template with a blue accent sidebar and cards.

OWN-WORLD: Board green ground (#E7F2ED), sheet white (#FBFDFD), technical-pen ink (#172127), non-photo-blue construction lines and fade-out grid (#8CC7E6, never text), diazo blueline for links and focus (#29519F), checker's yellow for "you are here" (#F8E277), redline for invalid (#B72725). Atkinson Hyperlegible Next for all text, Atkinson Hyperlegible Mono for code and values. Square ruled grids, 2/4/6 px radii on controls and containers only.

STORY: The reader sees exactly where this sheet sits in the set, reads one idea at a time down a 42rem column, watches code and algorithms run on graph-ruled stages, then inks the sheet as read and moves to the next.

FIRST VIEWPORT: Desktop 1440: 56 px paper header; board-green sidebar (18rem) listing the stage's modules with the current lesson as a white sheet tab; the sheet floats on the board with a 24 px board margin, H1 at 36 px, a one-line ruled metadata strip (module ID, lesson n of m, minutes) under it, then the objectives and the first paragraph above the fold; static "On this page" list in the sheet's right margin at >=1280.

FORM: Engineering drafting sheet (drawing set, title block, dimension lines, pencil vs ink). Position 5 of 7 on the grounded list; seed key 82d206fe. Raises: One Active Edge (cloud quarry), one label grid for every index row (sneaker box stacks), small closed lesson set with read items dropping to a tint (yé-yé sleeve), state as a mark in a fixed cell (timetable slide rack), a flag where you stopped (cutting bench). Hand-drawn zine held as competitive alternate (audience axis only); its highlighter-on-the-line-that-matters kept as the checker's yellow line highlight.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

Marking a lesson read "inks" its cell: the hollow pencil square fills with ink left to right (200 ms), and the same filled cells appear in the sidebar and course map.

## Unresolved

- Product name (header wordmark) comes from `content/ui/strings.yaml`; working title "CCC Python Course".
- Scrollspy for "On this page" is not in the §4.8 client budget, so the list is static.
