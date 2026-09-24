# Fonts (brief A12)

Written by the design lead (W2), P4 batch 1, 2026-09-23. Files live in `main-app/app/fonts/` and load through `next/font/local` in `app/layout.tsx`. No remote fonts at runtime.

## Choice

| Role | Family | Why |
|---|---|---|
| All text (body, headings, UI, labels, captions) | **Atkinson Hyperlegible Next** (Braille Institute, 2024/2025; variable `wght` 200–800, roman + italic) | Drawn to keep easily confused characters apart for low-vision readers: slashed zero, flagged and footed `1`, tailed `l`, serifed capital `I`. That is the same job ISO technical lettering does on a drawing (the design world is "The Drafting Set", DESIGN.md) and the job a beginner needs when reading and copying code. Calm, open proportions for 1,000-word lessons. Has `tnum` (tabular figures) for IDs, years, step counters and tables. Not one of the saturated AI-default faces Impeccable flags. |
| Code, input/output, tracebacks, values and indices in visuals | **Atkinson Hyperlegible Mono** (same project; variable `wght` 200–800) | The sibling of the text face, so code and prose share x-height and rhythm. Clear `0`/`O` (slashed zero by default) and `1`/`l`/`I`/`|` (checked by rendering the glyphs, see below). Monospaced, so tabular by construction. |

One family plus its mono is deliberate: a Read-mode surface needs one well-tuned family, and rank comes from size and weight (DESIGN.md, "The One Lettering Rule"). No display face.

Rejected: JetBrains Mono / Fira Code (good zero and l/1, but a second design language beside the text face, and ligatures would confuse beginners); IBM Plex, Inter, DM Sans, Space Grotesk/Mono (Impeccable's saturated defaults); Source Serif / Literata body (a serif body plus a sans UI would be two families for no role only one of them can do).

## Files (fetched once from the official upstream repositories, pinned to a commit)

Upstream: the Braille Institute's Atkinson Hyperlegible Next and Mono projects, published by Google Fonts on GitHub. The repositories have no GitHub releases; the `main` branch commit below is the release state that Google Fonts ships (font version 2.66 in both).

| File in `main-app/app/fonts/` | Source URL (pinned commit) | SHA-256 | Bytes |
|---|---|---|---|
| `AtkinsonHyperlegibleNext-Variable.woff2` | `https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/fonts/webfonts/AtkinsonHyperlegibleNext%5Bwght%5D.woff2` (upstream name `AtkinsonHyperlegibleNext[wght].woff2`) | `abde1ad5cf78b9ac575ef90d991f2e9101eb0b3b6668bde9a00e2e1e27d99afd` | 48,188 |
| `AtkinsonHyperlegibleNext-Italic-Variable.woff2` | `https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/fonts/webfonts/AtkinsonHyperlegibleNext-Italic%5Bwght%5D.woff2` (upstream `AtkinsonHyperlegibleNext-Italic[wght].woff2`) | `34491c5a87f711d314637962f69267d28c7df3ed498082c990cdfbbc02ebf3f2` | 52,692 |
| `AtkinsonHyperlegibleMono-Variable.woff2` | `https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next-mono/154d50362016cc3e873eb21d242cd0772384c8f9/fonts/webfonts/AtkinsonHyperlegibleMono%5Bwght%5D.woff2` (upstream `AtkinsonHyperlegibleMono[wght].woff2`) | `4cf41c5cacdb2e98311929f3a482e95b2299ca34e6f389e8968a9075e355d58a` | 25,600 |
| `OFL-AtkinsonHyperlegibleNext.txt` | `https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/OFL.txt` | `aca6a428580965d2297d1b718042dd427c2a9443ece3b0d02d758e161e0c4030` | 4,431 |
| `OFL-AtkinsonHyperlegibleMono.txt` | `https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next-mono/154d50362016cc3e873eb21d242cd0772384c8f9/OFL.txt` | `1ebb31cf7393164f20d10c1d48406cddb5314feff8465531cf1e4ba37e9dd740` | 4,436 |

Commits: Next `7925f50f649b3813257faf2f4c0b381011f434f1` (2025-02-21); Mono `154d50362016cc3e873eb21d242cd0772384c8f9` (2024-11-20). Repository licence (GitHub API): `OFL-1.1` for both.

Files are renamed only to drop the `[wght]` brackets (awkward in import paths); the bytes are the upstream bytes (hashes above are of the files as committed). The Mono italic is not fetched: code is never italic (DESIGN.md, Shiki theme).

## Licence

SIL Open Font License 1.1 for both families ("Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors" / "... Mono Project Authors"). The OFL allows bundling and self-hosting in a web app; the licence text ships next to the fonts in `app/fonts/`. Credit goes on `/about` (P5 copy): "Atkinson Hyperlegible Next and Mono by the Braille Institute, SIL Open Font License 1.1".

## Checks done

Inspected from the matching upstream TTFs (scratch only, `work/04-app/_scratch/fonts/`, not committed):

| | Next | Mono |
|---|---|---|
| Axes | `wght` 200–800, default 400 | `wght` 200–800, **default 200** (always set `font-weight` explicitly; CSS's default 400 does this) |
| unitsPerEm / ascender / descender / lineGap (hhea = typo, `USE_TYPO_METRICS` on) | 1000 / 984 / -316 / 0 | 1000 / 984 / -316 / 0 |
| x-height / cap height | 496 / 668 | 496 / 668 |
| GSUB features | `aalt case ccmp frac locl ordn pnum sups tnum` | `aalt case ccmp frac locl ordn sups zero` |
| Missing characters of note | arrows `→←↑↓`, `✓✗▶⏸⌘№ⁿ` | same |

- Arrows and symbols are missing, which suits the rules anyway: icons come from lucide, never Unicode glyphs. `×` (for "2×" speed labels), `≤ ≥ ≠`, curly quotes, en and em dashes, `…`, `·`, `√`, `∞`, `²` are present.
- Glyph rendering check (`work/04-app/_scratch/fonts/specimen.png`, rendered from the static Regular/Bold TTFs by a scratch rasterizer): Mono `0` slashed vs round `O`, `1` flagged with a foot, `l` with a tail, `I` with serifs, `|` a plain bar, `i` and `!` distinct; Next the same distinctions at text size.
- `next/font/local` settings for the app engineer's reference (the design lead writes `app/layout.tsx`): `display: 'swap'`, `adjustFontFallback: 'Arial'` for Next (metric-matched fallback, no layout shift), `variable: '--font-atkinson-next'` / `'--font-atkinson-mono'`, `weight: '200 800'`, `preload: true` for the roman text face only.

## Refreshing

Re-fetch only on purpose (a new upstream version): update the commit, URLs and hashes here, and re-run the glyph check.
