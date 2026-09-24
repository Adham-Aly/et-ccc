# P4 requests between workers

Format: `[from] → [to]: what and why`. The orchestrator relays.

- [W2 design lead] → [app & QA engineer]: expose `readingMinutes` for each lesson from the content loader (word count of the MDX prose / 200, rounded, minimum 1). The lesson title-block strip shows it (DESIGN.md, Layout → Reading page).
- [W2 design lead] → [app & QA engineer]: please commit `main-app/.impeccable/` (Impeccable surface brief for the lesson reader; a development contract, not served by Next). Impeccable must run with cwd `main-app/` to find PRODUCT.md, DESIGN.md and this folder.
- [W2 design lead] → [app & QA engineer]: `main-app/app/fonts/` holds `OFL-*.txt` licence files next to the WOFF2s; exclude `app/fonts/**` from cspell and Biome if either scans it.
- [W2 design lead] → [visualization engineer]: the visual-language tokens, state grammar and player chrome look are in `main-app/DESIGN.md` → "Visual Language" (CSS custom properties `--color-viz-*`, `--viz-stroke*`, `--viz-dash`, `--dur-viz`, `--ease-draft`). Sections marked [W3] are yours to complete; if you need a new token, add it to the token block and note it here.
