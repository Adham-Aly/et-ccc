---
name: CCC Python Course
description: A calm reading course from zero programming to CCC Senior algorithms in Python 3.8, drawn as a drafting set.
colors:
  paper: "#FBFDFD"
  paper-sunk: "#F3F6F8"
  board: "#E7F2ED"
  board-deep: "#D7E7E0"
  ink: "#172127"
  ink-2: "#414C53"
  ink-3: "#586268"
  rule: "#D7DEE0"
  rule-strong: "#7E888D"
  guide: "#8CC7E6"
  guide-soft: "#E2F3FD"
  blueline: "#29519F"
  blueline-deep: "#193B7E"
  blueline-soft: "#E6EEFD"
  check: "#F8E277"
  check-soft: "#FEF5C7"
  check-ink: "#755411"
  redline: "#B72725"
  redline-soft: "#FEEFED"
  green: "#22683B"
  green-soft: "#DAF5E0"
  plum: "#7F387A"
  plum-soft: "#FAEAF8"
  done: "#C4D0D7"
  syn-keyword: "#29519F"
  syn-string: "#1F6538"
  syn-number: "#954717"
  syn-builtin: "#156165"
  syn-comment: "#5B656B"
  syn-punct: "#414C53"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  subhead:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.35
  minor:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  ui:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.01em"
  micro:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    fontFeature: "\"tnum\" 1"
  code:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0px"
  cell: "2px"
  control: "4px"
  box: "6px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "14": "56px"
  "16": "64px"
  "20": "80px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.board}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "48px 56px"
  sidebar:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink-2}"
    width: "18rem"
  sidebar-item-current:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  code-block:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.box}"
  code-line-highlight:
    backgroundColor: "{colors.check-soft}"
  callout-note:
    backgroundColor: "{colors.blueline-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    padding: "16px 20px"
  callout-warning:
    backgroundColor: "{colors.redline-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    padding: "16px 20px"
  callout-grader-tip:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    padding: "16px 20px"
  judge-badge:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.cell}"
    padding: "1px 6px"
  draft-badge:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.cell}"
    padding: "1px 6px"
  read-cell:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.cell}"
    size: "14px"
  read-cell-read:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  search-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "48px"
---

# Design System: CCC Python Course

<!--
Status: P4 batch 1 specification, written by the design lead (W2) before any UI exists, at the phase orchestrator's request (brief A10: this file is the single token source).
Impeccable normally writes DESIGN.md at the finish of a new world; here it is written first as the build spec, and the finish pass (Impeccable `document`, scan mode) will re-check it against the built code and update it.
The product name above is a working title (PRODUCT.md "Open facts"); the rendered wordmark comes from content/ui/strings.yaml.
Section "Visual Language" is shared: parts marked [W2] are the design lead's; parts marked [W3] are for the visualization engineer to complete.
-->

## Overview

**Creative North Star: "The Drafting Set"**

The course is a set of technical drawings, and each lesson is one sheet pinned to a drafting board. The board is the pale green vinyl cover every drafting table wears; the sheet is crisp white drafting film; the writing is technical-pen ink. Facts about a sheet sit in ruled title blocks. Ranges and spans are drawn as dimension lines. Anything not yet final is pencilled in, drawn with a dashed line; anything finished is inked solid. The checker's yellow highlighter marks "you are here", the redline marks what is wrong, and faint non-photo-blue construction lines and a fade-out grid sit under every diagram. Every one of these conventions exists in real drafting to make a drawing unambiguous, and that is the product's job too: a beginner must never wonder whether they read something right.

The system is quiet and dense in the right places. Prose runs in one generous column; the sidebar, header and metadata recede into the board. Colour is restrained (neutrals plus one interactive blue) on reading surfaces and becomes a precise, fixed vocabulary only inside code and visuals, where each hue means one state and nothing else. The typefaces, Atkinson Hyperlegible Next and Mono, were drawn to keep easily confused characters apart (0 and O, 1, l and I), which is exactly what ISO technical lettering is for and exactly what a new programmer needs when copying code.

This is not a grey docs template with a blue sidebar and a card grid, not a cream-paper editorial page, and not a dark "hacker" theme. It is light only (PRODUCT.md), because it is read at a desk in daylight or lamplight over months, and white paper on a green board is how a drawing is read.

**Key Characteristics:**
- White sheet on a board-green ground, square sheet corners, 1 px ruled edges.
- One text family (Atkinson Hyperlegible Next) at every size; its Mono for code, values and indices.
- Ruled title blocks carry metadata; there are no eyebrow labels above headings.
- Pencil (dashed) means draft or not yet; ink (solid, filled) means done.
- Checker's yellow means "current / you are here" everywhere: current code line, current step, the flag where you stopped, text selection.
- Motion is short, single and causal; nothing moves without a user action.

## Colors

A restrained drafting palette: board green, sheet white, pen ink, one diazo blueline for everything interactive, and a small fixed set of marking colours (checker's yellow, redline, approval green, plum) that each carry one meaning.

All hex values are the canonical tokens. They were derived in OKLCH (noted per token) and all are in the sRGB gamut. Contrast ratios are WCAG 2.x ratios computed from the hex values (script: `work/04-app/_scratch/palette.cjs`).

### Primary
- **Diazo Blueline** (#29519F, oklch 45% 0.135 262): links, focus rings, the selected state of controls, the `note` callout's label and icon, Python keywords. 7.45:1 on paper, 6.63:1 on board, 5.85:1 on check. Named after the blue-line prints drawings were copied on.
- **Blueline Deep** (#193B7E, oklch 37% 0.12 262): link hover and pressed text. 10.4:1 on paper.
- **Blueline Soft** (#E6EEFD, oklch 94.8% 0.022 262): background of the `note` callout, the focused row in search results, a selected segmented option on paper. Ink on it 14.1:1.

### Marking colours (each has exactly one meaning)
- **Checker's Yellow** (#F8E277, oklch 91% 0.13 98): "current / you are here". Current step in visuals, the flag for "continue where you left off". Ink on it 12.6:1. Never used as text.
- **Checker's Yellow Soft** (#FEF5C7, oklch 96.6% 0.06 98): highlighted code lines, the current line in a code trace, text selection. Ink 14.9:1; every syntax colour at least 5.3:1.
- **Checker's Umber** (#755411, oklch 47% 0.09 80): the rare text or icon that must read as "yellow" on paper (the flag icon's label). 6.77:1 on paper.
- **Redline** (#B72725, oklch 51% 0.18 27): invalid, wrong, error. The `warning` callout, the "not valid on the CCC grader" label, the traceback's exception line, invalid cells in visuals. 6.19:1 on paper, 5.63:1 on redline-soft.
- **Redline Soft** (#FEEFED, oklch 96.3% 0.017 25): background of warning callouts, bad38 headers, traceback panels, invalid cells.
- **Approval Green** (#22683B, oklch 46% 0.1 152): accepted by the grader and "on the answer path". The `grader-tip` callout, answer-path strokes. 6.66:1 on paper.
- **Approval Green Soft** (#DAF5E0, oklch 94.5% 0.04 152): grader-tip background, answer-path cell fill.
- **Plum** (#7F387A, oklch 46% 0.13 330): "being compared" in visuals, and nothing else. 7.51:1 on paper.
- **Plum Soft** (#FAEAF8, oklch 95.5% 0.025 330): fill for compared cells.

### Neutral
- **Sheet White** (#FBFDFD, oklch 99.3% 0.002 200): the sheet (every page's reading surface), header, cards that must read as paper on the board.
- **Sheet Sunk** (#F3F6F8, oklch 97.2% 0.004 220): code blocks, input/output bodies, the player's control strip, table header rows.
- **Board Green** (#E7F2ED, oklch 95.2% 0.014 165): the page ground around the sheet, the sidebar, hover fills on paper. Board vs paper is 1.12:1, so the sheet always carries a 1 px `rule` edge.
- **Board Green Deep** (#D7E7E0, oklch 91.5% 0.02 165): hover and pressed fills on the board. `ink-3` is not placed on it (4.89:1 passes, but it is kept for ink and ink-2 only to keep margin).
- **Pen Ink** (#172127, oklch 24% 0.018 235): all body text and headings, primary buttons, filled read cells. 16.1:1 on paper, 14.3:1 on board.
- **Ink 2** (#414C53, oklch 41% 0.018 235): secondary text: sidebar items, captions, notes in practice lists, read (tinted) lesson rows. 8.62:1 on paper, 7.68:1 on board.
- **Ink 3** (#586268, oklch 49% 0.016 235): tertiary text: IDs, line numbers, field labels in title blocks, "Coming soon". 6.12:1 on paper, 5.45:1 on board, 5.76:1 on sheet-sunk. Not placed on `done` (3.96:1).
- **Rule** (#D7DEE0, oklch 89.5% 0.008 225): hairlines: sheet edge, table rules, row dividers, the code block border. Decorative separation only, never the only boundary of a control.
- **Rule Strong** (#7E888D, oklch 62% 0.014 230): boundaries of interactive controls and of unvisited cells in visuals (3.56:1 on paper, 3.17:1 on board; meets the 3:1 non-text minimum).
- **Construction Blue** (#8CC7E6, oklch 80% 0.075 232) and **Construction Blue Soft** (#E2F3FD): non-photo-blue guides: the fade-out grid in visual stages, construction lines, frontier fills. 1.8:1 on paper: decorative only, never text, never a required boundary.
- **Done Grey** (#C4D0D7, oklch 85% 0.016 235): visited or finished items in visuals. Ink on it 10.4:1.

### Syntax (Shiki theme, see Components → Code block)
Keyword #29519F, string #1F6538, number/constant #954717, builtin #156165, comment #5B656B, punctuation/operator #414C53, default ink #172127. On sheet-sunk the lowest is comment at 5.52:1; on check-soft (highlighted lines) the lowest is comment at 5.44:1.

### Named Rules
**The One Meaning Rule.** Each marking colour means one thing across UI, code and visuals: yellow is "current", red is "invalid", green is "accepted / answer path", plum is "compared", construction blue is "queued / not yet reached". Nothing is coloured for decoration.

**The Blueline Is Interactive Rule.** On reading surfaces the blueline marks what can be clicked or has focus. Headings, icons and decoration never use it.

**The Never-Colour-Alone Rule.** Every colour that carries a state is paired with a shape, line style, icon or word (see Visual Language). A greyscale screenshot must still read.

## Typography

**Text Font:** Atkinson Hyperlegible Next (variable, wght 200–800), fallback `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif` with `next/font` metric adjustment.
**Code Font:** Atkinson Hyperlegible Mono (variable, wght 200–800), fallback `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`.

**Character:** One legibility-first family does everything, like the single standard lettering on a drawing; rank comes from size and weight, not from a second display face. The Mono is its sibling, so code and prose share proportions and x-height. Both have a slashed zero, a flagged and footed 1, a tailed l and a serifed capital I (checked on the downloaded files, see `work/04-app/fonts.md`).

### Hierarchy
Fixed rem sizes (Read mode: predictable, no fluid type). Phone values apply below 640 px.

- **Display** (700, 2.75rem / 1.1, -0.02em; phone 2.125rem): the home page title only.
- **Title** (700, 2.25rem / 1.15, -0.015em; phone 1.875rem / 1.2): H1 of every other page (lesson, module, course map, problems, glossary).
- **Headline** (700, 1.5rem / 1.3, -0.01em; phone 1.375rem): H2, lesson sections. Space above 3rem, below 0.75rem.
- **Subhead** (650, 1.25rem / 1.35): H3. Space above 2rem, below 0.5rem.
- **Minor** (700, 1.0625rem / 1.45): H4, callout titles, the "Practice" and "On this page" headings.
- **Body** (400, 1.125rem / 1.7; phone 1.0625rem / 1.65): lesson prose. Measure 42rem (about 70 characters). Paragraph spacing 1.25rem, no first-line indent. `strong` is 700; `em` uses the true italic.
- **UI** (400, 1rem / 1.5): navigation, lists, table cells, buttons (buttons 600).
- **Small** (400, 0.9375rem / 1.5): captions, practice notes, metadata, search result snippets, visual step captions on phones.
- **Label** (600, 0.8125rem / 1.35, +0.01em, sentence case): badges, title-block field labels (400 for field labels), legend entries, kbd.
- **Micro** (500, 0.75rem / 1.2, tabular): the minimum size anywhere, used only for indices and axis labels inside visuals.
- **Code** (Mono 400, 0.9375rem / 1.6; phone 0.875rem / 1.55): code blocks, input/output, tracebacks. Inline code is 0.9em Mono on sheet-sunk.

### Numerals
- Tabular figures (`font-variant-numeric: tabular-nums`, the font's `tnum`) for every number that sits in a column or changes in place: module IDs, lesson counts, years and levels ("2023 S1"), step counters, table cells, title blocks. Utility class `tnum`.
- Prose keeps the default proportional figures.
- Mono is tabular by construction. The Mono's `zero` feature stays off: its default zero is already slashed.
- Atkinson Hyperlegible Next draws every zero slashed, at every size, and has no plain-zero alternate (checked: no `zero`, `ssNN` or `cvNN` feature; `aalt` alternates 1–3 leave `0` unchanged; render in `work/04-app/_scratch/fonts/zero-features.png`). The slashed zero stays in headings and body. It is part of the face's character-disambiguation design, the same reason the face was chosen.

### Named Rules
**The One Lettering Rule.** One family, one standard. A second display face, italics for decoration, or monospace as a "technical" costume outside code, values and IDs is refused.

**The No-Eyebrow Rule.** No kicker or label above any heading. Facts that would be an eyebrow (stage, module ID, lesson number) live in the ruled title-block strip below the H1.

## Layout

The page is a board with a sheet on it. Four widths are designed: 390, 768, 1440 (and a 1920 smoke check).

### Page frame
- **Header** (3.5rem tall, paper, 1 px `rule` bottom edge, sticky at `top: 0`). Left: menu button (below 1024 px), wordmark. Centre-left (1024 px and up): primary nav: Learn, Problems, Glossary, Start here, About. Right: search trigger.
- **Board**: the `board` colour fills everything below the header.
- **Sidebar** (1024 px and up; 18rem wide, board ground, sticky below the header, own scroll, 1.5rem padding): course navigation for lesson and module pages.
- **Sheet**: paper, 1 px `rule` edge, square corners, sitting on the board with a board margin: 1.5rem at 1024 px and up, 1rem at 640–1023 px, none below 640 px (the sheet becomes the full-bleed page with the rule edge removed). Sheet padding: 3rem top / 3.5rem sides / 4rem bottom at 1024 px and up; 2rem / 2rem / 3rem at 640–1023; 1.5rem / 1.25rem / 2.5rem below 640 (the 20 px side gutter satisfies the 16 px minimum).
- **Content column**: max 42rem, left-aligned inside the sheet (not centred) so the eye returns to a fixed left edge. Wide elements may extend to 48rem when the sheet has room, never past the sheet padding (see Measure by block type).
- **On this page** (1280 px and up, lesson pages with 3 or more H2s): a 13rem static list in the sheet's right margin, sticky at header height + 1.5rem; it lists H2s only. No scroll-spy (the §4.8 client budget excludes it).
- **Maximum sheet width**: the sheet stops growing at 76rem (content + TOC + padding); beyond that the extra board shows on the right. At 1920 px the layout holds its left edge beside the sidebar.

### Measure by block type
The prose measure is `--measure` (42rem); the wide measure is `--measure-wide` (48rem). A block goes wide only when it carries `data-wide` or is a `figure`, `table` or display math; `data-exhibit` sets only the 2rem block spacing, never the width.

| Block | Measure |
|---|---|
| Paragraphs, lists, headings, blockquotes | Prose (42rem) |
| Callouts, Details, Practice list | Prose (42rem) |
| Title-block strip, objectives, closing title block | Prose (42rem) |
| Code block with its Input / Output / Error panels (`data-wide`) | Wide (48rem) |
| Output panel alone (`data-wide`) | Wide (48rem) |
| Figures: diagrams, step-throughs, code traces (`figure`) | Wide (48rem) |
| Tables, display math | Wide (48rem) |

Index lists (module lessons, prerequisites, the course map) are page structure, not prose, and fill the content column.

### Reading page (lesson) order
1. Breadcrumb line (small, ink-3): Course map / Stage N title / Module title. Links in ink-2 with blueline hover underline.
2. H1 lesson title.
3. **Title-block strip**: one ruled row of cells directly under the H1 (1 px `rule` top and bottom and between cells; 0 radius). Cells: Module (ID + short title), Lesson (`2 of 3`), Reading time (`12 min`), and the Draft badge when applicable. Field label above value inside each cell (label 400 ink-3, value UI 600 ink, tabular). The cells always share one row in equal columns with a rule between them (checked at 390 px with the longest values: M4.15, 12 of 12, 25 min). On phones the Draft badge takes its own ruled row below; from 640 px it sits at the right end of the row. Values wrap, never truncate.
4. Objectives (a short list introduced by a Minor heading, copy from `ui/strings.yaml`).
5. Lesson body.
6. Practice list (last lesson of a module only).
7. **Closing title block**: a ruled two-row block that ends every lesson. Row 1: the mark-as-read control spanning the width. Row 2: Previous and Next as two equal cells (each: label "Previous"/"Next" in label style, then the target lesson title in UI 600). Previous hidden (its cell kept empty) on the first lesson; on the last lesson of a module "Next" points to the next module's first readable lesson or to the course map.

### Other surfaces
- **Home `/`**: sheet without sidebar (content column 42rem, sheet max 64rem). Display title, a two-paragraph lede, the Continue block, then the **Sheet index**: every stage as one ruled row (stage number, name, one-line goal, module count), linking to `/learn#stage-n`. Then "How this course works" as a two-column definition list (term / explanation) that stacks on phones. No hero metrics, no feature cards.
- **Course map `/learn`**: sheet without sidebar (the page is the map itself), content up to 56rem, one section per stage.
- **Module `/learn/[stage]/[module]`**: sidebar + sheet, same frame as the lesson.
- **Problems, Glossary, Search, About, Start, 404**: sheet without sidebar; content up to 56rem for tables (Problems), 42rem for prose.

### Breakpoints
Tailwind defaults, kept: `sm` 40rem (640), `md` 48rem (768), `lg` 64rem (1024: sidebar and full nav appear), `xl` 80rem (1280: "On this page" appears), `2xl` 96rem.

### Spacing rhythm
4 px base (Tailwind `--spacing: 0.25rem`). Steps in use: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96. Inside components use 4–16; between blocks in the lesson column 24–32 (paragraph 20, code/figure/callout 32 above and below); before an H2 48. More space above a heading than below it, always.

### Named Rules
**The Left Edge Rule.** Prose, headings, code and figures share one left edge inside the sheet. Nothing is centred in the reading column except figure artwork inside its frame.

**The Sheet Rule.** Pages are sheets, not stacks of cards. A sheet contains ruled blocks and framed exhibits (code, callouts, figures); it never contains a grid of same-size cards, and framed things never nest inside other framed things.

## Elevation & Depth

Flat. Depth comes from the paper-on-board relationship (a white sheet with a 1 px rule on a green ground), not from shadows. Nothing on the sheet casts a shadow. Only overlays that genuinely float above the page get one shadow.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 12px 32px -8px rgb(23 33 39 / 0.22), 0 2px 6px rgb(23 33 39 / 0.08)`): search dialog, mobile navigation drawer, term popover. Paired with a backdrop of `rgb(23 33 39 / 0.32)` for the dialog and drawer (no blur).

### Named Rules
**The Flat Sheet Rule.** If it is on the sheet, it is ruled, not lifted. Hover never adds a shadow or a translate; it changes a fill or an underline.

## Shapes

Drafting geometry: square where things are ruled, barely softened where things are handled.

- **0 px** (`rounded-none`): the sheet, title blocks, tables, index rows, the header, the sidebar.
- **2 px** (`rounded-cell`): read cells, badges, inline code, kbd, cells in visuals.
- **4 px** (`rounded-control`): buttons, inputs, segmented controls, sidebar current-item tab, scrubber thumb.
- **6 px** (`rounded-box`): code blocks, input/output panels, callouts, details, figures, the search dialog.
- Lines: 1 px hairlines for rules; 1.5 px for control and cell outlines in visuals; 2 px for focus rings and emphasis strokes; 2.5–3 px only for the single "current" edge.
- Dashed lines (`4 3` dash, 1.5 px) mean "pencilled": draft badges, "Coming soon" outlines, frontier cells, construction lines.

### Named Rules
**The Ruled-Is-Square Rule.** Anything that is a row, cell or grid of facts has square corners. Radii belong only to things you hold (controls) and things that are framed exhibits (code, callouts, figures).

**The Pencil and Ink Rule.** Dashed outline = pencilled, provisional, not yet (draft, coming soon, queued). Solid outline or solid fill = inked, final, done. This grammar is the same in the UI and in every visual.

## Components

Every interactive component has default, hover, focus-visible, active, and (where it applies) disabled, loading, empty and error states. Focus is always the **focus ring**: `outline: 2px solid var(--color-blueline); outline-offset: 2px` (inside dense grids, `outline-offset: -2px` with a 2px inner ring). Hover changes fill or underline only. Target size: 24 × 24 px minimum everywhere; 40 px tall for buttons on fine pointers; 44 × 44 px on coarse pointers (`@media (pointer: coarse)`).

### Browser surfaces
- `::selection`: `check-soft` background, ink text.
- `caret-color`: blueline.
- Scrollbars: `scrollbar-color: var(--color-rule-strong) transparent; scrollbar-width: thin` on code blocks, the sidebar and dialogs.
- Links: blueline, `text-decoration-thickness: 1px`, `text-underline-offset: 0.2em`, underline always on in prose (not colour alone); hover blueline-deep with 2px underline. Nav and index links: no underline at rest (context carries the affordance), underline on hover.
- `color-scheme: light` on `:root` and `<meta name="color-scheme" content="light">`.
- `html { -webkit-text-size-adjust: 100%; text-rendering: optimizeLegibility; }`, `font-kerning: normal`.

### Buttons
- **Shape:** 4 px radius, 40 px tall (44 px coarse), 16 px side padding, UI 600 text, optional 18 px icon with 8 px gap.
- **Primary** (ink fill, paper text): the one main action on a surface (mark as read; play in the player). Hover ink-2. Active: fill ink, 1 px inset `rule-strong`. Disabled: `done` fill, ink-3 text, `cursor: not-allowed`.
- **Secondary** (paper fill, 1 px `rule-strong` border, ink text): other actions. Hover board fill.
- **Ghost** (transparent, ink-2 text): toolbar and icon buttons (copy code, player step buttons, menu). Hover board fill and ink text. Icon-only ghost buttons are 40 × 40 (44 coarse) with an `aria-label` and a visible tooltip-free label strategy: the label is in `aria-label`, and the icon must be self-evident (copy, menu, close, play/pause, step).
- Icons: lucide-react, stroke 1.75, 16/18/20 px, `currentColor`. No emoji and no Unicode glyphs as icons.

### Header and navigation
- Wordmark: UI 700 at 1.0625rem, ink, links to `/`. Text only; no logo mark.
- Nav links: UI 500 ink-2, 12 px side padding, full header height hit area. Hover ink + underline. Current section (`aria-current`): ink 600 with a 2 px ink bar flush with the header's bottom edge.
- **Search trigger** (1024 px and up): a 16rem field-shaped button, paper, 1 px `rule-strong` border, 4 px radius, 36 px tall: search icon, "Search" in ink-3, and a `kbd` "/" at the right (label style, 1 px rule border, 2 px radius). Below 1024 px: a 40 × 40 ghost icon button. Pressing `/` outside a text field opens the dialog (the only keyboard shortcut in the app outside the player).
- **Mobile menu** (below 1024 px): ghost icon button (Menu icon) opens a Base UI drawer from the left: 20rem max (100% minus 3rem on phones), paper ground, overlay shadow and backdrop, 250 ms slide on `--ease-draft` (reduced motion: 120 ms fade). Contains the primary nav on paper (44 px rows; the current section in ink 600 with a 2 px ink bar at its left edge) and, on course pages, the course navigation below a 1 px rule on the board ground (the same sidebar markup). Without course navigation the whole drawer stays paper. Close button top-right, Escape closes, focus returns to the trigger.

### Sidebar (course navigation)
- Top: "Course map" link (ghost row with a LayoutList icon).
- Stage heading: label style ink-3 "Stage 4" then UI 700 ink stage title.
- Modules of the current stage: rows of ID (tabular, ink-3, fixed 3.5rem column) + title (UI, ink-2), 8 px vertical padding, 4 px radius hover fill board-deep. Planned modules: ink-3 text, no link, a dashed-outline "Soon" tag in a trailing column (grid `3.5rem | 1fr | auto`, all cells on the first baseline), so a wrapped title never pushes the tag onto an orphan line.
- The current module expands to its lessons: indented 3.5rem, each row a read cell + lesson title (small, ink-2). Read lessons keep their title in ink-2 (the "read drops to a tint" rule: read is quieter, never hidden or struck).
- **Current lesson** (`aria-current="page"`): a white sheet tab: paper fill, 1 px `rule` border, 4 px radius, ink 600 title. This is the only paper on the board, so it reads as the sheet pulled from the set.
- Other stages: collapsed list of stage titles at the bottom (a 2rem number column), each linking to `/learn#stage-n`.
- Every sidebar row carries a 1 px border (transparent unless it is the current tab), so the current row's paper tab never shifts its text.

### Read cell and mark-as-read
- **Read cell**: 14 px square, 2 px radius. Unread (pencilled): paper fill, 1.5 px `rule-strong` border. Read (inked): ink fill, paper Check icon 10 px stroke 2.5. Appears in the sidebar, course map rows, module lesson lists, and the closing title block. Read cells are decorative in lists (`aria-hidden`), with the state in visible or visually hidden text ("Read").
- **Mark-as-read control** (closing title block, row 1): a primary button "Mark as read" with a hollow 16 px read cell as its icon. After marking: the control becomes a secondary button "Read" with a filled cell, plus small ink-2 text "Marked on 23 Sep" and a ghost "Undo" button. Storage failure: the button still toggles for this page view and no error is shown (brief A9). Before hydration the button renders in its unread state with no layout difference.
- **The ink-in moment** (the UI's one authored motion): on marking, the cell fills with ink by a left-to-right `clip-path: inset()` wipe, 200 ms `--ease-draft`, then the check icon fades in over 120 ms. Reduced motion: instant fill.

### Continue where you left off (home)
- A ruled block (0 radius, 1 px rule, paper-sunk fill) with a **folded tape flag** icon (authored 20 px SVG: check yellow fill, ink 1.5 px outline) at the left, label "Continue where you left off", and the next unread lesson after the most recently read one as a link (UI 700) with its module ID in tabular ink-3. When nothing is read or storage is blocked: the same block reads "Start with Stage 0" linking to the first lesson. The server renders the "Start" state; the client swaps text in place inside a fixed-height block (no layout shift).

### Course map (`/learn`)
- One section per stage: H2 "Stage 4 · Title" (the stage number in tabular figures), one-line goal from `course.yaml` (small, ink-2; no payoff or score wording).
- **Index row (one label grid for every index in the app):** ID, title and meta share the first text baseline (`align-self: baseline`), so the smaller ID and meta text sit on the title's line. Columns: ID (4.5rem, tabular, ink-3) | title (UI 600, ink; module description below in small ink-2 when present) | meta (lesson count, small ink-3, right-aligned, tabular) | marks (one read cell per lesson, 4 px gaps, right-aligned). Rows separated by 1 px rule, 12 px vertical padding, the whole row is the link (hover: board fill; title underline).
- Planned/drafted modules: ID and title in ink-3, no link, no hover, a dashed "Coming soon" tag in the meta column. Status tags (Coming soon, Draft) always sit in that trailing column from 640 px, and on phones on their own line under the title, aligned to the title’s left edge; never inline after the title text. Columns exist only for what a row shows, so an empty column adds no gap. Draft (gated/reviewed on previews): normal row plus a Draft badge in the status slot.
- Phones: status and meta move to a second line under the title; marks stay at the right.

### Module page
- Breadcrumb, H1 module title, title-block strip (Stage, Module ID, Lessons, Draft badge).
- "Before this module" (prerequisites): index rows for each prerequisite module with their read cells.
- Objectives list.
- Lessons: index rows (number 1, 2, 3 in the ID column, title, minutes, read cell).
- Practice list, when the module has one.

### Callouts (×3)
- **Frame:** 6 px radius, 16 px × 20 px padding, soft fill of the kind's colour, 1 px border in the kind's colour mixed 30% into paper (`color-mix(in oklab, var(--color-<kind>) 30%, var(--color-paper))`). No side stripe.
- **Head:** an 18 px icon and a label in Minor style, in the kind's ink colour: `note` → Info icon, blueline, label "Note"; `warning` → TriangleAlert icon, redline, label "Watch out"; `grader-tip` → BadgeCheck icon, green, label "Grader tip". An optional author `title` replaces the label text but the icon stays. Label copy comes from `ui/strings.yaml`.
- **Body:** body style in ink, 12 px below the head; code blocks inside a callout use paper instead of sheet-sunk.
- Kind is conveyed by icon + label + colour (never colour alone). Rendered as `<aside>` with `aria-label` of the label.

### Term
- Inline text with a 1 px dotted blueline underline (offset 0.2em). It is a `<button>` that opens a native popover (`popover` + `popovertarget`, no JS) anchored below the term (CSS anchor positioning where supported, otherwise centred in the viewport; below 640 px it spans the page gutters under the term instead of starting at it): paper, 1 px rule border, 6 px radius, overlay shadow, max 22rem, 12 px × 16 px padding: the term in UI 700, the definition in small ink, and a "In the glossary" link. Hover: solid underline; focus ring as standard. Escape and light-dismiss close it.

### Details
- Native `<details>`: 6 px radius, 1 px `rule` border, paper. Summary row: 12 px × 16 px padding, UI 600 ink, a 16 px ChevronRight that rotates 90° when open (150 ms, reduced motion: none). Hover: board fill on the summary. Open: a 1 px rule under the summary, content padded 16 px. No other animation.

### Code block
- **Frame:** sheet-sunk fill, 1 px `rule` border, 6 px radius. Long lines scroll inside the block (`overflow-x: auto`, thin scrollbar); code never wraps; the code sits in a focusable `<section tabindex="0">` with an `aria-label` from the filename, "Code", or the bad38 label, so keyboard users can scroll it. The whole assembly is `<figure data-exhibit data-ui data-code-assembly>`, max width `--measure-wide`.
- **Head strip** (always present): 36 px tall, 1 px rule bottom edge. Left: the filename (e.g. `prefix.py`) in code style ink-2, or "Python" in label style when it is a fenced block. Right: the copy button (ghost, Copy icon + "Copy" label at 640 px and up, icon-only below). Copied state: Check icon + "Copied" for 2 s, announced via `aria-live="polite"`. Copy failure: "Press Ctrl+C to copy" hint in small ink-2 and the code is selected.
- **Line numbers** (shown when the block has more than 3 lines or any highlight): a gutter of `calc(max(2, digits)ch + 1.5rem)` (12 px either side of the widest number; code starts 16 px after the rule), sticky at the left edge while the code scrolls, right-aligned tabular Mono in ink-3, 1 px rule right edge running the full block height (the first and last lines carry the 12 px block padding in both cells), not selectable (`user-select: none`) and not copied.
- **Highlighted lines** (`highlight="3,4"`): the full row gets check-soft fill; the line number becomes ink 700. Nothing else changes (no side stripe).
- **Caption** (optional): below the frame, small ink-2, 8 px gap, left-aligned. Not numbered.
- **`bad38` block** ("not valid on the CCC grader"): frame border and head strip in redline: head strip fill redline-soft, a 16 px OctagonX icon and the label "Not valid on the CCC grader" (label style, redline) replacing the filename; frame border 1 px redline. The copy button stays. The label is text, so the state never relies on colour.
- **Shiki theme** (`lib/content/shiki-theme.ts`, generated from these tokens): background sheet-sunk, foreground ink; scopes: `keyword`, `storage`, `keyword.operator.logical.python` (`and`/`or`/`not`/`in`/`is`) → syn-keyword; `string`, `string.quoted` → syn-string; `constant.numeric`, `constant.language` (`True`/`False`/`None`) → syn-number; `support.function.builtin`, `support.type` (`print`, `input`, `len`, `range`, `int`, `list`…) → syn-builtin; `comment` → syn-comment (not italic); `entity.name.function` (the name after `def`) → ink, bold; `variable.parameter` → ink; `keyword.operator`, `punctuation` → syn-punct; `constant.character.format.placeholder`, `meta.fstring` braces → syn-keyword; `invalid` → redline, underline. No italics anywhere in code.

### Input / Output panels
- Shown under a code block when the example has `.in`/`.out`, joined to it as one assembly: 12 px gap, then Input and Output side by side at 640 px and up (each 50%) only when both are present and there is no error; a lone panel, and every traceback, takes the full width. Stacked below 640 px. Each panel: 6 px radius, 1 px `rule` border, paper fill, code typography, 12 px × 16 px padding; head label in label style ink-3 with an icon: "Input" (ArrowDownToLine), "Output" (ArrowUpFromLine). Output is always the committed generated `.out` (never typed). Empty output: "(no output)" in small ink-3 italic. Long output: max 20 lines visible, then the panel scrolls inside itself.
- `<Output file>` alone renders the Output panel only.

### Error traceback panel (`expectError`)
- Replaces the Output panel: redline-soft fill, 1 px border redline mixed 30% into paper, 6 px radius. Head: OctagonAlert icon + "Error: IndexError" (label style, redline; the type from `expectError`). Body: the committed traceback in code style ink; the final exception line in redline 700. Screen readers get "Error output" as the region label.

### Problem link and judge badge
- Inline `ProblemLink`: "2023 S1: Title" as one link: "2023 S1" in 600 tabular, then ": Title"; blueline, underlined. After the link: a **judge badge** and an ArrowUpRight 14 px icon. Opens in a new tab (`target="_blank" rel="noopener noreferrer"`) with visually hidden "(opens on WMOJ in a new tab)".
- **Judge badge**: label style 600, ink-2, paper fill, 1 px `rule-strong` border, 2 px radius, 1 px × 6 px padding: "WMOJ" or "DMOJ". Both judges share one style; the name is the cue.
- Crossover: "2022 J4 (same problem as 2022 S2)" where the parenthetical is ink-2 400 and not part of the link text; the link goes to the Senior slug via `judgeUrl()`.

### Practice list
- Heading: H2 "Practice" (copy from strings) with a one-line intro in small ink-2 that says the problems are on WMOJ and DMOJ.
- **Rows** (index-row grid, ruled, no bullets, ordered as authored): ID column shows "2023 S1" (tabular 600 ink), then the title link (UI 600, blueline) + judge badge + ArrowUpRight; below the title, the `note` in small ink-2; for DMOJ entries with `why`, a second line "Why DMOJ: …" in small ink-3 (prefix from strings). No checkboxes, statuses, scores or hints.
- Empty list: the section is not rendered.

### JudgeLink
- Same as a prose link, with an ArrowUpRight icon and new-tab hint; text from strings ("WMOJ", "Create a WMOJ account").

### Draft badge and Coming soon
- **Draft badge**: label style 600, ink-2, paper fill, **1.5 px dashed** `rule-strong` border (pencilled), 2 px radius, PencilLine 12 px icon + "Draft". Placed in title-block strips and after titles in index rows. Previews only.
- **Coming soon**: label style 500 ink-3, 1.5 px dashed `rule` border, 2 px radius, "Coming soon" ("Soon" in the sidebar). The row it sits in has no link, no hover and ink-3 text.

### Problems page (`/problems`)
- H1, one-line intro, then sections by year (H2 "2026", descending), each a table: columns "Problem" (e.g. "S1", tabular 600), "Title" (link + judge badge), "Taught in" (module ID links in small, tabular). Header row: label style ink-3 on sheet-sunk, 1 px rule; body rows 1 px rule dividers, 12 px vertical padding. Junior and Senior are grouped within a year (J rows, then S rows) with the level in the Problem column ("J4", "S2"); crossovers render once in each level with "(same problem as 2022 S2)". Below 640 px each row becomes two lines (Problem + Title / Taught in). No filters, no status.

### Glossary (`/glossary`)
- H1, a letter grid (A–Z as a ruled grid of cells: 7 columns × 2.75rem on phones, 13 columns × 2.5rem at 640 px and up; 40 px tall, 44 px on coarse pointers; letters with terms are blueline 700 links, letters with none are ink-3 and not links), then sections by letter (H2 letter), each a `<dl>`: `<dt>` term (UI 700 ink, with an `id` for anchors), `<dd>` definition (body style, ink) and "Introduced in M1.1 Values, types, variables" (small, link). Rows ruled like index rows. `:target` term row gets check-soft fill for 2 s then fades (reduced motion: stays until blur).

### Search dialog and `/search`
- Base UI Dialog, 40rem wide (100% minus 2rem on phones, full height below 640 px), anchored 12vh from the top, paper, 6 px radius, overlay shadow and backdrop; 200 ms fade + 0.98 → 1 scale on `--ease-draft` (reduced motion: fade only).
- **Input**: 48 px tall, no border inside the dialog but a 1 px rule under it, Search icon 20 px ink-3 at the left, UI text 1.0625rem ink, placeholder ink-3 "Search lessons, terms and problems". Escape closes; a visible "Esc" kbd at the right on fine pointers.
- **Results**: grouped under label-style group headings (Lessons, Glossary, Problems); each result an index row: ID column (module ID / "2023 S1" / first letter), title (UI 600, the matched part in 700 with check-soft background), a small ink-2 snippet (one line, ellipsis). Arrow keys move the active row (blueline-soft fill + ink text; `aria-activedescendant`), Enter opens, mouse hover sets the active row.
- **States**: empty query: small ink-3 hint text and nothing else; loading the index (first open, lazy MiniSearch): a 3-row skeleton of rule-coloured bars (no spinner); no results: "No matches for “query”. Try a shorter word or check the spelling." (copy from strings); index failed to load: a line in redline with a "Try again" secondary button.
- `/search` page uses the same input and results inside a sheet, reading `?q=` on the client.

### 404 (`not-found`)
- A sheet with an authored SVG drawing: a sheet outline in dashed pencil line (rule-strong, 1.5 px, 4 3 dash) with dimension lines on two sides and a title block cell reading "Missing"; H1 (copy from strings, e.g. "This page is not in the set"), one sentence, and three links as secondary buttons: Course map, Search, Home.

### Figures (frame only; the player is in Visual Language)
- `<figure>`: 6 px radius, 1 px `rule` border, paper fill; the visual stage inside; `<figcaption>` below the frame: "Figure 3" in UI 700 tabular then the caption in small ink-2. The text alternative `<details>` ("Read the steps as text") sits under the caption with the Details style.

### Tables in prose
- Full-width of the column, UI style, header row label style ink-3 on sheet-sunk, 1 px rule dividers, 10 px × 12 px cell padding, tabular numerals, horizontal scroll inside a wrapper below 640 px.

### KaTeX
- KaTeX's stylesheet loads with the lesson page component only. Math inherits ink; display math centred inside the column with 24 px vertical space and scrolls horizontally inside itself when too wide.

### Implementation rules (as built)
- **Fonts** (`app/layout.tsx`, `next/font/local`): Atkinson Hyperlegible Next roman and Mono are preloaded (Mono appears above the fold in every code block); the italic is a separate face, not preloaded, applied by one rule to `em, i, cite, var, dfn`. Next roman uses an Arial-adjusted fallback; Mono has no adjusted fallback.
- **Prose scoping**: `.prose-sheet` styles only direct prose. Components that draw their own chrome carry `data-ui`, and prose element rules skip `[data-ui]` and everything inside it (links, lists, list items). Links that must not look like prose links carry `data-plain`. Wide exhibits (code assemblies, callouts, practice, tables, figures, display math) carry `data-exhibit` and take `--measure-wide` with 2rem above and below.
- **Class merging**: `cn()` uses `extendTailwindMerge` with the custom `text-*` sizes, radii, shadow and ease declared, so a size class such as `text-label` never removes a colour class.
- **Titles with code**: module and lesson titles may contain backtick spans; `RichTitle` renders them as inline `<code>` in the sidebar, index rows and continue block.
- **Copy**: every UI string comes from `content/ui/strings.yaml` through `ui()` (server) or props (client). Client components never import copy.
- **Client code** is limited to the plan §4.8 set: copy button, mark-as-read, live read cells, continue block, search dialog and page, mobile drawer. Term uses a native popover and needs no script.
- **`/dev/design`** (preview builds only, 404 in production) shows every component in every state, with sample problems resolved from the registry. It is the target for pixel review and visual baselines.

## Visual Language

Plan §4.11.3. Tokens and the state grammar below are the design lead's [W2]. The visualization engineer (W3) owns everything marked [W3] and completes this section; the tokens here are the contract W3 builds `components/viz/tokens.ts` on (it reads the CSS custom properties; SVG uses `var(--color-viz-…)`).

### Principles [W2]
- A visual is a drawing on the same sheet: same inks, same lettering, same line weights. It is not a separate "widget" style.
- The stage sits on a **fade-out grid**: paper with a 16 px grid of construction-blue lines at 35% opacity (1 px), exactly like pre-printed drafting vellum. The grid is decorative (`aria-hidden`) and never used to encode data.
- One colour meaning everywhere, always paired with a non-colour cue (next table). A greyscale screenshot must still separate every state.
- **The One Active Edge Rule.** At most one element (or one group that forms one thing, such as the current path's head) carries the heavy "current" edge at any moment.

### State vocabulary [W2]
| State | Fill | Stroke | Non-colour cue (required) | Legend label |
|---|---|---|---|---|
| Structure / neutral | none or `paper` | `ink-2` 1.5 px (edges, arrows), `rule-strong` 1 px (cell grid) | plain line | — |
| Unvisited | `paper` | `rule-strong` 1.5 px solid | empty cell, thin outline | "Not reached" |
| Frontier / queued | `guide-soft` | `blueline` 1.5 px **dashed** (4 3) | dashed "pencilled" outline | "Queued" |
| Current | `check` | `ink` **3 px** solid | heaviest outline plus a pointer label or caret above it | "Current" |
| Visited / done | `done` | `ink-2` 1.5 px solid | solid "inked" fill; values stay ink | "Done" |
| On the answer path | `green-soft` | `green` 2 px **double** line (two 1 px strokes 2 px apart, or a 2 px stroke plus an inner 1 px ring) | double outline; path connectors drawn 3 px | "Answer path" |
| Compared | `plum-soft` | `plum` 2 px solid | a dimension bracket between the compared items with the comparison written on it (e.g. `5 < 8`) | "Compared" |
| Invalid | `redline-soft` | `redline` 1.5 px solid | a single diagonal strike line (redline 1.5 px) across the item, plus a word in the caption | "Invalid" |

- Text inside any fill is `ink` (lowest ratio: 10.4:1 on `done`; 12.6:1 on `check`). Values never change colour to show state.
- Strokes that carry state all meet 3:1 against paper (lowest: `rule-strong` 3.56:1). Construction blue is never a state stroke.
- Pointers and index markers (i, j, lo, hi, mid): `ink` 1.5 px arrow with a label in micro/UI Mono ink; a range between two pointers is drawn as a **dimension line** (thin ink-2 line with arrowheads and short extension lines, the length or name written in the gap).

### Token names (CSS custom properties) [W2]
`--color-viz-stage` (paper), `--color-viz-grid` (guide, used at 35% opacity), `--color-viz-ink`, `--color-viz-line` (ink-2), `--color-viz-cell-line` (rule-strong), `--color-viz-unvisited`, `--color-viz-frontier`, `--color-viz-frontier-line`, `--color-viz-current`, `--color-viz-current-line`, `--color-viz-done`, `--color-viz-done-line`, `--color-viz-path`, `--color-viz-path-line`, `--color-viz-compare`, `--color-viz-compare-line`, `--color-viz-invalid`, `--color-viz-invalid-line`. Values: see the token block below. Stroke widths and dash: `--viz-stroke-hair: 1px`, `--viz-stroke: 1.5px`, `--viz-stroke-strong: 2px`, `--viz-stroke-current: 3px`, `--viz-dash: 4 3`.

### Typography in visuals [W2]
- Lettering: Atkinson Hyperlegible Next for labels and captions, Mono for values, indices and code. Both tabular.
- **Minimum rendered size at a 390 px viewport: 12 px** for indices, axis labels and pointer names; **14 px** for values inside cells and nodes; captions 15 px (small) on phones, 16 px at 640 px and up. Visuals scale with the column, so authors size presets so that these minimums hold at the 390 px column width (about 350 px of stage); the G-VIZ/visual checks enforce it. [W3] Two checks do it: `check:viz` lays out every step of every preset and fails any panel wider than 361 units (a 316 px phone stage ÷ 0.875, the ratio of 14 px values to their 16 px natural size); `viz:shots` then measures every SVG text in a real browser at each width it shoots (390, 768 and 1440 px by default) and fails anything below 14 px (values) or 12 px (labels and titles).
- Values in Mono 500; labels in Next 500; the current pointer label in 700.

### Motion [W2 rules, W3 implementation]
- **One easing curve:** `--ease-draft: cubic-bezier(0.2, 0, 0, 1)` (a decisive deceleration; no bounce, no elastic).
- **Durations:** `--dur-feedback: 120ms` (button press, copy confirmation, check icon fade), `--dur-state: 200ms` (UI state changes, ink-in), `--dur-viz: 280ms` (default frame transition; allowed range 200–350 ms), `--dur-overlay: 250ms` (drawer; dialog uses `--dur-state`).
- **One thing moving at a time** where possible. When a step has a cause and an effect (an item leaves the queue and becomes current), play them in sequence, each at `--dur-viz`, total at most 2 × `--dur-viz`. Simultaneous changes of the same kind (several cells turning done) may move together.
- Motion shows cause: items travel along the path they logically take (queue → current, value → cell). Fills cross-fade; outlines change instantly with the fill.
- **Interruption:** a new step request while a transition runs finishes the current transition immediately (jump to its end state) and starts the next one. Scrubbing jumps without animation.
- **No autoplay, no loops, no flashing.** Nothing moves without a user action.
- **Reduced motion** (`prefers-reduced-motion: reduce`, and Motion's `MotionConfig reducedMotion="user"`): no spatial movement; state changes become a 120 ms opacity cross-fade or an instant snap; stepping, playing and scrubbing still work. The UI's ink-in, drawer slide and dialog scale follow the same rule.
- [W3] Playback timing per speed (`lib/viz/player-state.ts` SPEEDS): 0.5× = one step per 2.4 s, 1× = 1.2 s, 2× = 0.6 s; transitions take `--dur-viz` (280 ms) at 0.5× and 1× and 200 ms at 2×. Sequencing and layout transitions: see "Motion choreography" below.

### Captions [W2 style, W3 plumbing]
- Every step has a caption in the teaching voice (style guide, G-STYLE): what changed and why, one or two sentences, present tense, naming things with the same words as the prose and the legend. Never "Step 7".
- Caption region: below the control strip, small/body style ink on paper, left-aligned, `aria-live="polite"`, with a **reserved minimum height of 3 lines** (4 on phones) so the page never shifts as captions change. Step number is not repeated in the caption (the counter shows it).

### Player chrome [W2 look, W3 behaviour]
Shared by `StepThrough`, `CodeTrace` and `Scene`. The player is one focusable group (`role="group"`, `aria-roledescription="step-through"`, label from the figure caption) inside a Figure frame.

Order inside the figure frame, top to bottom:
1. **Preset switcher** (only when 2–3 presets exist): a segmented control flush left above the stage, 12 px from the frame edge: options in label style 600, 32 px tall (44 coarse), 4 px outer radius, 1 px `rule-strong` border; selected option ink fill with paper text; others paper with ink-2 text, hover board. Switching presets resets to step 1.
2. **Stage**: fade-out grid background, fixed aspect ratio box per visual (no layout shift), 16 px inner padding. First frame server-rendered.
3. **Control strip**: sheet-sunk fill, 1 px rule top edge, 8 px × 12 px padding, one row at 640 px and up, two rows below (buttons row, then scrubber row):
   - Buttons (ghost icon buttons, 40 × 40, 44 coarse, ink-2, hover board, focus ring): Restart (RotateCcw), Previous step (StepBack), **Play/Pause** (primary: ink fill, paper Play/Pause icon, same size), Next step (StepForward). Disabled at the ends: ink-3 at 50% opacity, `aria-disabled`.
   - **Scrubber**: styled as a scale ruler: a 4 px `rule` track with 1 px `rule-strong` tick marks at every step when there are 60 steps or fewer (every 5th tick taller when more than 20), the passed part of the track in `ink-2`, and a 16 × 16 ink thumb with 2 px radius and a 2 px paper ring. Native `input type="range"` underneath (keyboard and screen readers), `aria-valuetext="Step 7 of 23"`.
   - **Step counter**: "7 / 23" in UI Mono 500 tabular ink-2, fixed width for the largest count (no jitter).
   - **Speed**: segmented control "0.5×", "1×", "2×" (same style as presets, 32 px tall), right-aligned.
4. **Caption** (above).
5. **Legend**: a wrapping row of entries, each a 16 × 16 swatch drawn with the exact state cue (fill, stroke, dash, double line, strike) plus the legend label in label style ink-2; 16 px between entries. Only the states the visual uses appear.
6. Figure caption and "Read the steps as text" details (Figures).

Keyboard (W3 implements): ←/→ previous/next, Space play/pause, Home/End first/last; only while focus is inside the player group.

Below 640 px: the stage stays above; state panels (variables, stack, output in a code trace; side structures in combined layouts) stack below the stage; nothing requires horizontal page scroll.

### Code trace layout [W2 look; W3 layout]
- Code pane: the Code block frame without the head strip's copy button, line numbers on, the **current line** in check-soft with a solid ink caret (a small triangle in the gutter pointing at the line; this is the one active edge); the line that ran just before it is marked by a hollow caret outline only.
- Variables pane: index rows "name → value" in Mono; names → objects view draws objects as ruled boxes with ink arrows from names (aliasing visible); a value that just changed gets check-soft fill for that step.
- Call stack: frames as ruled stacked boxes, newest on top, the active frame with the 3 px ink edge; returned frames leave with a 200 ms fade.
- Output so far: the Output panel style, growing line by line.

### Library structure [W3]
- Frames are data, drawn by one renderer. A layout function (`lib/viz/layout*.ts`, pure TypeScript) turns every step of every preset of one panel into positioned items (cells, nodes, edges, arrows, pointers, dimension lines, text, slots, lines, badges, bands); `components/viz/SceneSvg.tsx` draws them with the primitives in `components/viz/primitives`. The same code runs on the server (first frame), in the lazy client player, and in the `check:viz` gate.
- Every panel keeps one box for all steps and presets (the union of their sizes), so nothing shifts while stepping. A smaller preset sits centred in that box.
- Styling is by state, not by colour: each item carries `data-s="<state>"` and `viz.css` maps states to custom properties (`--vz-fill`, `--vz-edge`, `--vz-sw`, `--vz-dash`), which read only the tokens below. No component hard-codes a colour.
- Two library states beyond the table above: **Wall** (`#` in grids: `rule-strong` fill hatching, legend "Wall") and **Just changed** (code trace values and objects: `--color-viz-changed`, currently falling back to `check-soft`, legend "Just changed"). Free-standing labels paint above every shape and sit on a stage-coloured knockout, so no line, sweep or edge ever crosses a label.

### Per-visualizer specifics [W3]
All sizes are in natural units (1 unit = 1 px at scale 1; the stage scales a panel down to fit, never below the minimum text sizes, and up to at most 1.25×). Scene padding is 8.
- **ArrayViz**: cells 40 tall and at least 40 wide (value width + 14), indices 20 below in label style. Pointers get a 38-unit row above or below: a 1.5 px ink arrow and the name (the strong one in 700); several pointers on one index share one label ("lo, mid"). Ranges are dimension lines in 28-unit rows. A compare is a plum bracket on its own row above, with the comparison written in its gap; with a pointer at either end, the bracket's legs stop on top of the pointer label. `circular` draws a return arrow under the row.
- **GridViz**: square cells from 28 to 40 units (as large as fits 361 units), row and column indices in label style unless `indices: false`; walls hatched; values in Mono inside cells; no pointers (the caption names the cell).
- **GraphViz**: author coordinates in grid units of 60; nodes are circles of radius 18 with the id in Mono; value badges sit under each node, and `valueLabel` explains them once under the graph ("Boxed under each node: distance"). Edge weights sit at the midpoint, offset from the line, on a knockout. Directed edges end in an arrowhead at the node rim.
- **TreeViz**: a tidy tree (d3-hierarchy) laid out over the union of every step and preset, so a node never moves when others appear. Boxes are the label width + 14 (at least 36), 30 tall; levels 58 apart (70 with notes); 12 between siblings, 1.15 × that between cousins. Notes ("= 3") sit under the box; edges start below the parent's note. Node ids name positions: an id must have the same parent in every step and preset (G-VIZ rule `tree-ids`); ids by call path (`r`, `rL`, `rLR`) do this.
- **TableViz**: 32-unit rows, columns as wide as their widest value; row and column heads in label style with an optional corner title. Dependency arrows between neighbours are short and cross the shared border beside the values (a vertical one sits at 84% of the cell width, clear of the current caret); arrows between farther cells run edge to edge with a slight bow.
- **StructViz**: stack is a slot open at the top with a "top" marker; queue and deque are open-ended rails with "front"/"back" markers; heap is drawn twice, as a tree and as the array under it, linked by the same index labels (nodes grow with their text, never touching the ring); map is key → value rows; set is chips in a rounded container. An empty heap or map says "empty".
- **LineViz**: a number line with ticks every `tick` (16–44 units apart), intervals on rows 0–3 above it (30 units per row), points with labels, and a dashed sweep line with its label on top. `kind: wheel` draws a clock face for modular arithmetic.
- **PlotViz**: a fixed 190-unit-tall plot as wide as the phone allows, nice ticks on both axes, up to three series in three line styles (solid, dashed, dotted), series labels spread so they never overlap, a shaded `band` with its label top-left inside it, a dashed `vline` with its label above the plot, and markers with values.
- **CodeTraceViz**: code pane left (at most 58% of the width), frames-and-objects panel right, output under the code; stacked in that order below 44rem of player width, so the state panel always gets at least the phone stage's width. Frames are ruled boxes, newest on top, the active one with the 3 px edge; objects start 36 units right of the frames, level with the first name that refers to them; lists wrap to the panel width. Function objects are a "function" type row and a pill with the name.

### Scenes [W3]
Named concept animations built from a few plain props at build time (no recorded file). Each validates its props with Zod and produces frames for the shared player.
- `stdin-flow` (`lines`, `reads: [{name, as: str | int | split}]`): the standard-input lines on top, the program in the middle, the variables below, stacked vertically so it reads on a phone. Each step consumes one line (it turns done), highlights the program line that reads it and shows the Python value it becomes (`'hello'`, `5`, `['red', 'green']`).
- `how-judging-works` (`verdicts`: 1–6 of AC, WA, TLE, RTE, MLE): test cases in a row, a pipeline input → your program → output → checker, and the verdict per test in words, never as a score.
- `growth-rates` (`curves`: 2–5 of `logn`, `n`, `nlogn`, `n2`, `2n`; `points`: the n values to step through; `yMax`): a PlotViz with one curve per growth rate, stepping through the n values with markers; curves that leave the chart are clipped at the top.

### Combined layouts [W3]
- `layout: single` is one panel. `layout: row` is two panels side by side (3 : 2) once the player is at least 36rem wide, each with a small title; below that they stack, main panel first.
- Phone (below 36rem of player width): the controls take two rows (buttons with the speed control, then the scrubber with the counter), the caption reserves 4 lines, and the legend wraps.

### Motion choreography [W3]
- CSS transitions, not a motion library (no runtime dependency; the lazy chunk stays small). The client player adds `.vz-live` after the first user action, so the server-rendered first frame never animates.
- Phase 1 (0 to `--dur-viz`): items move to their new places and recolour; the new current item takes its edge; items that are gone fade out. Phase 2 (`--dur-viz` to 2 × `--dur-viz`): the consequences follow (new frontier, answer path, compared, invalid, just changed) and new items fade in. That keeps cause before effect, and one thing moving at a time.
- Interruption: any new step request during a transition adds `.vz-snap` for one frame, which ends every running transition at its end state, then the next step animates. Seek, preset switch, Restart, Home and End always snap.
- Reduced motion: `--vz-dur: 0ms`, so every change is an instant snap; stepping, playing and scrubbing still work.

### The `/dev/viz` gallery [W3]
A dev-only page (404 in production) on the standard sheet, in five sections: Primitives (every state on cells, nodes and edges; pointers, dimension lines, slots, arrows; the full legend), Visualizers (every visualizer in every state it draws, from inline sample frames), Players (a live StepThrough with presets, a reduced-motion one, and frozen pictures of the middle, last and playing states), Code trace (live, and frozen at the deepest recursion), and Scenes (all three). Every entry has a `data-gallery` id, which `viz:shots` uses to name its screenshots.

### Tokens added [W3]
- `--color-viz-changed`: the "Just changed" fill in code traces. Requested from the design lead for `app/globals.css`; until it lands, `viz.css` falls back to `--color-check-soft`, which is the intended value.

## Do's and Don'ts

### Do:
- **Do** put every page on a sheet: paper (#FBFDFD) with a 1 px rule (#D7DEE0) edge on the board (#E7F2ED), square corners.
- **Do** carry lesson and module facts in a ruled title-block strip under the H1 (module ID, lesson n of m, minutes), in tabular figures.
- **Do** use dashed outlines for everything provisional (Draft, Coming soon, queued) and solid ink for everything done.
- **Do** keep prose at 1.125rem / 1.7 in a 42rem column with one shared left edge.
- **Do** pair every state colour with a shape, line style, icon or word.
- **Do** keep underlines on prose links and the 2 px blueline focus ring on everything focusable.
- **Do** reserve space for anything the client fills in (continue block, captions, copy feedback) so nothing shifts.
- **Do** theme the browser surfaces: selection (check-soft), caret (blueline), thin scrollbars (rule-strong), tabular numerals in every column of numbers.

### Don't:
- **Don't** add dark mode, `dark:` classes, `prefers-color-scheme: dark` or any dark theme import (PRODUCT.md, G-UI-LIGHT).
- **Don't** add an eyebrow or kicker above any heading; the title-block strip is the only place for that metadata.
- **Don't** use a coloured `border-left`/`border-right` wider than 1 px on callouts, list items, rows or cards; callouts are framed boxes with an icon and a label.
- **Don't** build any page as a grid of same-size icon cards, and never nest a framed box in a framed box.
- **Don't** use gradients, glass, blur, glow, hard offset shadows, or purple-blue "AI" palettes; the only shadow is the overlay shadow.
- **Don't** use emoji or Unicode symbols as icons; icons are lucide at stroke 1.75, or authored SVG in the same weight.
- **Don't** colour judges differently (WMOJ and DMOJ badges share one style) or style anything to look like a CEMC, WMOJ or DMOJ mark.
- **Don't** show scores, progress percentages, rings, streaks or completion bars; the only progress mark is the per-lesson read cell.
- **Don't** set any text below 12 px, or put ink-3 on `done`, `check` or `board-deep`.
- **Don't** animate anything on page load, on scroll, or without a user action.

## Token Block (`app/globals.css`)

The design lead moves this into `app/globals.css` when the scaffold hands the file over. `@theme static` is used so every custom property is emitted even when no utility uses it (the viz library and the Shiki theme read them). Tailwind's default colour, font and text scales are cleared so no off-palette value can be used.

```css
@import "tailwindcss";

@theme static {
  /* reset defaults: only these tokens exist */
  --color-*: initial;
  --font-serif: initial;
  --text-*: initial;
  --radius-*: initial;
  --shadow-*: initial;
  --ease-*: initial;

  /* base colours */
  --color-transparent: transparent;
  --color-current: currentColor;
  --color-paper: #fbfdfd;
  --color-paper-sunk: #f3f6f8;
  --color-board: #e7f2ed;
  --color-board-deep: #d7e7e0;
  --color-ink: #172127;
  --color-ink-2: #414c53;
  --color-ink-3: #586268;
  --color-rule: #d7dee0;
  --color-rule-strong: #7e888d;
  --color-guide: #8cc7e6;
  --color-guide-soft: #e2f3fd;
  --color-blueline: #29519f;
  --color-blueline-deep: #193b7e;
  --color-blueline-soft: #e6eefd;
  --color-check: #f8e277;
  --color-check-soft: #fef5c7;
  --color-check-ink: #755411;
  --color-redline: #b72725;
  --color-redline-soft: #feefed;
  --color-green: #22683b;
  --color-green-soft: #daf5e0;
  --color-plum: #7f387a;
  --color-plum-soft: #faeaf8;
  --color-done: #c4d0d7;

  /* syntax (Shiki theme reads these via lib/content/shiki-theme.ts) */
  --color-syn-keyword: #29519f;
  --color-syn-string: #1f6538;
  --color-syn-number: #954717;
  --color-syn-builtin: #156165;
  --color-syn-comment: #5b656b;
  --color-syn-punct: #414c53;

  /* visual language (components/viz/tokens.ts reads these) */
  --color-viz-stage: var(--color-paper);
  --color-viz-grid: var(--color-guide);
  --color-viz-ink: var(--color-ink);
  --color-viz-line: var(--color-ink-2);
  --color-viz-cell-line: var(--color-rule-strong);
  --color-viz-unvisited: var(--color-paper);
  --color-viz-frontier: var(--color-guide-soft);
  --color-viz-frontier-line: var(--color-blueline);
  --color-viz-current: var(--color-check);
  --color-viz-current-line: var(--color-ink);
  --color-viz-done: var(--color-done);
  --color-viz-done-line: var(--color-ink-2);
  --color-viz-path: var(--color-green-soft);
  --color-viz-path-line: var(--color-green);
  --color-viz-compare: var(--color-plum-soft);
  --color-viz-compare-line: var(--color-plum);
  --color-viz-invalid: var(--color-redline-soft);
  --color-viz-invalid-line: var(--color-redline);

  /* type (families come from next/font variables set on <html>) */
  --font-sans: var(--font-atkinson-next), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --font-mono: var(--font-atkinson-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;

  --text-display: 2.75rem;
  --text-display--line-height: 1.1;
  --text-display--letter-spacing: -0.02em;
  --text-title: 2.25rem;
  --text-title--line-height: 1.15;
  --text-title--letter-spacing: -0.015em;
  --text-headline: 1.5rem;
  --text-headline--line-height: 1.3;
  --text-headline--letter-spacing: -0.01em;
  --text-subhead: 1.25rem;
  --text-subhead--line-height: 1.35;
  --text-minor: 1.0625rem;
  --text-minor--line-height: 1.45;
  --text-body: 1.125rem;
  --text-body--line-height: 1.7;
  --text-ui: 1rem;
  --text-ui--line-height: 1.5;
  --text-small: 0.9375rem;
  --text-small--line-height: 1.5;
  --text-label: 0.8125rem;
  --text-label--line-height: 1.35;
  --text-label--letter-spacing: 0.01em;
  --text-micro: 0.75rem;
  --text-micro--line-height: 1.2;
  --text-code: 0.9375rem;
  --text-code--line-height: 1.6;

  --font-weight-subhead: 650;

  /* shape */
  --radius-cell: 2px;
  --radius-control: 4px;
  --radius-box: 6px;

  /* depth */
  --shadow-overlay: 0 12px 32px -8px rgb(23 33 39 / 0.22), 0 2px 6px rgb(23 33 39 / 0.08);

  /* motion */
  --ease-draft: cubic-bezier(0.2, 0, 0, 1);
}

:root {
  color-scheme: light;

  /* layout */
  --header-h: 3.5rem;
  --sidebar-w: 18rem;
  --toc-w: 13rem;
  --measure: 42rem;
  --measure-wide: 48rem;
  --measure-table: 56rem;
  --sheet-max: 76rem;

  /* motion */
  --dur-feedback: 120ms;
  --dur-state: 200ms;
  --dur-viz: 280ms;
  --dur-overlay: 250ms;

  /* visual strokes */
  --viz-stroke-hair: 1px;
  --viz-stroke: 1.5px;
  --viz-stroke-strong: 2px;
  --viz-stroke-current: 3px;
  --viz-dash: 4 3;
  --viz-grid-size: 16px;
  --viz-grid-opacity: 0.35;

  /* backdrop for dialog and drawer */
  --backdrop: rgb(23 33 39 / 0.32);
}

@media (max-width: 39.999rem) {
  :root {
    --text-display: 2.125rem;
    --text-title: 1.875rem;
    --text-title--line-height: 1.2;
    --text-headline: 1.375rem;
    --text-body: 1.0625rem;
    --text-body--line-height: 1.65;
    --text-code: 0.875rem;
    --text-code--line-height: 1.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-state: 0ms;
    --dur-viz: 0ms;
    --dur-overlay: 120ms;
  }
}
```

Notes for the implementer: the `--font-atkinson-next` and `--font-atkinson-mono` variables come from `next/font/local` in `app/layout.tsx` (files in `app/fonts/`, see `work/04-app/fonts.md`; preload the roman text face only). The phone overrides of `--text-*` work because Tailwind 4's `text-*` utilities read the variables at use time; confirm this on the built CSS and fall back to responsive utilities if the build inlines values.
