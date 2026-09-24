**PENDING MANAGER APPROVAL — DO NOT INSTALL**

# Design Skill Recommendation (Phase 1 Recon, Worker W5)

Researched 2026-09-21 from live sources: the GitHub API, raw SKILL.md files, and directory and blog pages. I installed nothing. I read every candidate's SKILL.md or README directly from GitHub. Star counts and push dates come from `api.github.com/repos/...` on 2026-09-21.

## TL;DR

- **Chosen skill: Impeccable** (`pbakaus/impeccable`, skill v4.3.1). Source: https://github.com/pbakaus/impeccable. Site: https://impeccable.style
- **Fallback / runner-up #1:** Anthropic's official `frontend-design`, from https://github.com/anthropics/skills/tree/main/skills/frontend-design. The same file ships as a plugin in the official marketplace: https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design.
- **Why Impeccable won:** our app has many lesson pages that all need to look like one product. Impeccable is the only well-maintained candidate that does four things we need:
  - It stores a durable design contract per project (`PRODUCT.md` + `DESIGN.md`).
  - It has an explicit **"Read" mode** for docs, guides and lesson surfaces.
  - It has audit, critique, polish and typeset commands that cover accessibility and typography.
  - It runs a deterministic detector (61 rules) that catches contrast, legibility and design-system drift after each edit.
- **What it costs:** Impeccable is much heavier and moves much faster than the official skill. Details are under "Known caveats".

## Candidates compared

| # | Skill | Publisher / status | License | Maintenance (2026-09-21) | Popularity | What it is | Fit for a light-mode educational Next.js app | Light-only conflict |
|---|---|---|---|---|---|---|---|---|
| 1 | **Impeccable** (`impeccable`) | Paul Bakaus (community; has its own Claude Code marketplace) | Apache-2.0 | Repo pushed 2026-09-21. Releases `skill-v4.3.1` (2026-09-09) and `v4.3.0` (2026-09-08). Very active | ~69.6k stars. ~251k installs claimed on Skillselion | 1 skill with 24 sub-commands (`init, shape, critique, audit, polish, typeset, layout, quieter, distill, harden, adapt, …`). Also `PRODUCT.md`/`DESIGN.md` project context, 61 deterministic detector rules, an optional post-edit + Stop hook, and live browser iteration. Each surface gets a mode: Persuade, Operate, **Read**, or Experience | **Best.** Read mode fits lesson pages. `DESIGN.md` plus the detector keep many pages consistent. `audit` covers a11y, performance and responsive layout. `typeset` covers type hierarchy. `quieter` and `distill` fit a calm beginner UI | Low. "Dark or light is never a default… the brief wins." Pin light-only in `PRODUCT.md`/`DESIGN.md` |
| 2 | **frontend-design** | **Anthropic (official)**, in `anthropics/skills` and in the official marketplace `claude-plugins-official` | Apache-2.0 (LICENSE.txt) | Last changed 2026-09-03 (#1713, "avoid generic design defaults"). Marketplace copy is identical (updated 2026-09-01) | `anthropics/skills` ~177k stars. ~277k installs (Composio, Mar 2026) | One SKILL.md with no scripts. Covers art direction, choosing a subject, the typographic scale ("Elements of Typographic Style"), line length under 80 characters, a list of known "AI-slop" tells, a plan→review→build→critique process, and UX-writing rules | Good for quality, weak for consistency. It pushes toward a "distinctive identity" and "aesthetic risk" (landing-page bias). A third-party review says it "does not itself preserve a design contract across pages, sessions, or agents" | Low. "The brief's own words always win" |
| 3 | **UI/UX Pro Max** (`ui-ux-pro-max`) | nextlevelbuilder (community) | MIT | Pushed 2026-09-21. Release v2.15.0 (2026-08-13) | ~129.6k stars | A searchable local database run through a Python `search.py` script: 79 styles, 192 palettes, 74 font pairings, 119 UX guidelines, 22 stacks. Ships with 6 sibling skills (brand, slides, banner, …) | Useful as a reference engine. Its priority list (a11y, touch targets, 16px base, 1.5 line-height) is good. It is breadth-first, needs Python, and its outputs can contradict each other | **Medium.** Its style catalog and checklists assume light/dark contrast checks. Reviewers report "dark style + light palette" contradictions in its recommendations |
| 4 | **Taste Skill** (`design-taste-frontend`) | Leonxlnx (community, sponsor-funded) | MIT | Pushed 2026-09-20 | ~89k stars | An anti-slop skill with "dials" for variance, motion and density. Leans on Motion/GSAP. Ships 14 sub-skills | **Poor.** It describes itself as "Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI." | Medium. Its default Tailwind recipe includes the `dark:` variant |
| 5 | **web-design-guidelines** | Vercel (official Vercel, not Anthropic) | (repo license unspecified via API) | Skill last changed 2026-01-16. Repo pushed 2026-08-28 | `vercel-labs/agent-skills` ~31k stars | A review-only skill. It fetches Vercel's Web Interface Guidelines at run time and reports `file:line` findings | A good auditor but gives no design direction. It depends on a network fetch every time it runs | None |
| 6 | **shadcn** skill | shadcn-ui (official for shadcn/ui) | MIT | Changed 2026-09-04 | `shadcn-ui/ui` ~124k stars | Manages shadcn components through `npx shadcn@latest`. It is a component-library workflow skill, not a design-quality skill | Only relevant if we adopt shadcn/ui. It adds no typographic or visual judgment | Low. It uses semantic tokens, and shadcn themes ship dark tokens you can simply omit |

Not candidates: Anthropic's `theme-factory`, `canvas-design` and `web-artifacts-builder` (artifact/theming helpers, not app UI), and wilwaldon's *Claude-Code-Frontend-Design-Toolkit* (an awesome-list, ~1.1k stars, last push 2026-04).

## Decision: Impeccable

### Rationale

1. **Consistency across many pages.** This is the biggest risk for a site with dozens of lessons.
   - `/impeccable init` writes `PRODUCT.md`, which records audience, purpose and constraints.
   - `document` and `extract` write `DESIGN.md`, which holds tokens and components.
   - Every later command, in any session or by any agent, reads both files.
   - The detector flags "design-system drift".
   - The official skill has no equivalent.
2. **The mode system fits our product.** The SKILL.md defines **Read** ("Docs, articles, guides… Structure for comprehension, then make the reading experience worth staying in") and **Operate** ("Scanability, consistency… outrank expression"). Lessons are Read surfaces and practice/judge pages are Operate. The official skill leans toward a hero-first, distinctive "Persuade" posture.
3. **A quality floor we can check.**
   - `audit` covers a11y, performance and responsive layout.
   - `critique` does heuristic scoring.
   - `polish` is a final pass.
   - `typeset` fixes hierarchy.
   - `craft-floor.md` themes selection, caret, focus rings, underline offset and tabular numerals.
   - The hook catches contrast and legibility failures, clipped or overflowing content, and broken images.

   This matches the Manager's "pixel perfection" standard.
4. **It builds on the official skill.** The README says it "started from" Anthropic's frontend-design and adds to it, so we lose little of the official skill's taste guidance.
5. **Healthy project.** It is Apache-2.0, released almost daily (v4.3.1 on 2026-09-09), ~69.6k stars, and ranked #2 by Composio (May 2026). ClaudeSkills.info (Jul 2026) calls it the winner "when consistency, review, and mechanical quality controls matter".

### Install instructions (for later, only after Manager approval, project scope only)

Install at the **workspace root** so Claude Code sessions started in `/Users/adham/Developer/et-ccc` discover it. Nothing goes in `~/.claude`.

**Option A: documented CLI installer, project scope (preferred)**
```bash
cd /Users/adham/Developer/et-ccc
npx impeccable install --providers=claude --scope=project
```
- This writes `.claude/skills/impeccable/` (SKILL.md, `reference/`, `scripts/`, `agents/`).
- It also installs the design hook into `.claude/settings.local.json` (gitignored, machine-local), plus `.impeccable/config.json` and `.impeccable/config.local.json`.
- Note: npm `impeccable@latest` is **4.1.0** while the skill release is **4.3.1**. The npm package is only an installer shim. Confirm which skill version it installs by reading `.claude/skills/impeccable/SKILL.md` frontmatter `version:`.

**Option B: manual copy, pinned to a release, no npx**
```bash
git clone --depth 1 --branch skill-v4.3.1 https://github.com/pbakaus/impeccable "$TMPDIR/impeccable-src"
mkdir -p /Users/adham/Developer/et-ccc/.claude/skills
cp -R "$TMPDIR/impeccable-src/.claude/skills/impeccable" /Users/adham/Developer/et-ccc/.claude/skills/
rm -rf "$TMPDIR/impeccable-src"
```
- Option B installs no hook. Impeccable then asks for one manual detector run per session (`MANUAL_DETECTOR_REQUIRED`).
- You can add the hook later with `/impeccable hooks on`.
- Do **not** use `/plugin marketplace add pbakaus/impeccable`. Plugin installs default to user scope, which violates the workspace rule of no global side effects.

**Keep the engine binary inside the workspace (both options).** On first run, the launcher `scripts/impeccable` downloads a signed, SHA-256-checked engine binary. By default it goes to `~/.impeccable/bin/<version>/`, which is a global side effect. To prevent that, add the following to the **project** `/Users/adham/Developer/et-ccc/.claude/settings.json`:
```json
{ "env": { "IMPECCABLE_HOME": "/Users/adham/Developer/et-ccc/.impeccable-home" } }
```
Add `.impeccable-home/` to `.gitignore`. (`IMPECCABLE_HOME` comes from the launcher source: `cache_root="${IMPECCABLE_HOME:-$HOME/.impeccable}"`.)

**Verify it loaded:**
1. Start `claude` in `/Users/adham/Developer/et-ccc` and run `/skills` (or ask "which skills are available?"). `impeccable` should be listed from project scope.
2. Type `/impeccable` with no argument. It should show its context-aware command menu.
3. Run `.claude/skills/impeccable/scripts/impeccable context` from the workspace root. It should print context directives and create the engine under `.impeccable-home/`, not under `~/.impeccable`.
4. Check that `ls ~/.impeccable ~/.claude/skills/impeccable` both fail (nothing global).
5. If the hook is enabled, `/impeccable hooks status` should report it enabled, with config at `.impeccable/config.json`.

**First use:** run `/impeccable init`. When it asks, state:
- "light mode only, no dark mode, no `prefers-color-scheme: dark`, no `dark:` Tailwind variants"
- audience: a beginner high-school student learning Python for the CCC
- surfaces: lesson pages are **Read** mode, practice/judge UI is **Operate** mode

After the first pages are built, run `/impeccable document` to write `DESIGN.md`.

### Known caveats and mitigations

- **Light mode only.** Impeccable has no dark default ("Dark or light is never a default… The brief wins"), but it asks for a "physical scene" and could argue for dark. To prevent that:
  - Put the light-only rule in `PRODUCT.md` constraints, in `DESIGN.md` tokens (one light palette, no dark token set), and in the project `CLAUDE.md`.
  - Tell build agents never to run `colorize`, `bolder`, `overdrive` or `delight` without that constraint in view. Prefer `quieter`, `distill`, `typeset`, `layout`, `audit` and `polish`.
  - In code, set `color-scheme: light` on `:root`, add no `dark:` classes, and do not add a theme toggle.
- **Aggressive "go all out, bold" posture.** The SKILL.md opens with "Dream big and bold". For a calm teaching tool, the Read/Operate modes and a restrained color strategy ("Restrained… the default when the visitor came to operate or read") are the counterweight. Say "restrained" explicitly in `PRODUCT.md`.
- **Heavier and moves faster.** It adds a native engine binary downloaded at first run, hooks that inject reminders after UI edits (token cost), an optional live-browser mode, and image generation for "plates".
  - Pin the version (Option B tag) and update deliberately.
  - Keep `hook.quiet: true` in `.impeccable/config.json` if the acknowledgement messages get noisy.
  - Avoid `live`/`generate` unless needed.
- **Subagents.** `new-work` may spawn an `impeccable-asset-producer` subagent for image plates. Under our operating rules, workers must never spawn subagents. Build-phase workers should either avoid plate/image flows or be told to "produce assets here without subagents", which the skill supports.
- **Known monorepo issue.** A third-party review notes "context resolution fails in monorepos". The app lives in `main-app/` under the workspace. Either put `PRODUCT.md`/`DESIGN.md` at the workspace root and pass `--target main-app/...`, or start design sessions from `main-app/` with a matching project-scoped install. The build orchestrator should decide this once and record it in `decisions.md`.
- **Network.** First run needs network to fetch the engine. Sandboxed runs can fail. The skill then degrades gracefully ("Context loading did not run; I'll read the existing project context directly").
- **Detector false positives.** Example: an `overused-font` rule firing on a deliberately chosen code font. Resolve with narrow `ignore-value … --reason`, never `ignore-rule`/`ignore-file` without asking.
- **Fonts.** Both Impeccable and the official skill discourage Inter, Arial and system defaults. That is fine, but choose readable body and monospace faces for code blocks deliberately and record them in `DESIGN.md`.

## Runners-up and why they lost

1. **Anthropic `frontend-design` (official).** It is the simplest and most robust option: one file, no scripts or network, Apache-2.0, updated 2026-09-03, in the official marketplace. It lost because it has no persistent design contract or audit/detector loop, and it is biased toward "distinctive identity / aesthetic risk" hero work rather than calm, consistent reading UI. **Choose this instead if the Manager wants zero third-party code or binaries.** Install then by copying `skills/frontend-design/` from `anthropics/skills` into `/Users/adham/Developer/et-ccc/.claude/skills/frontend-design/`, and keep a hand-written `DESIGN.md` for consistency.
2. **UI/UX Pro Max.** Huge and popular, but it is a lookup database rather than a design lead. It needs Python and a search script, and reviewers note contradictory recommendations (including dark/light mismatches) and breadth over synthesis. It is also a bundle of 7 skills, which conflicts with the "exactly one skill" rule.
3. **Taste Skill.** It explicitly excludes product UI and multi-step flows ("Not dashboards, not data tables, not multi-step product UI"). It is motion-heavy, its README is sponsor-laden, and its Tailwind recipe includes `dark:` variants. Wrong fit.
4. **Vercel `web-design-guidelines`.** Review-only, with no design direction. It re-fetches its rules over the network on every run, and the skill has not changed since January 2026. Impeccable's `audit` covers the same ground.

## Sources

- Anthropic skills repo and frontend-design SKILL.md: https://github.com/anthropics/skills/tree/main/skills/frontend-design (commit history via https://api.github.com/repos/anthropics/skills/commits?path=skills/frontend-design)
- Official plugin marketplace: https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design
- Impeccable repo, README, SKILL.md, hooks.md, launcher, BUNDLE-SIGNING.md: https://github.com/pbakaus/impeccable (raw `.claude/skills/impeccable/SKILL.md`, `reference/hooks.md`, `reference/new-work.md`, `reference/craft-floor.md`, `scripts/impeccable`); releases: https://github.com/pbakaus/impeccable/releases; site: https://impeccable.style
- npm impeccable latest (4.1.0): https://registry.npmjs.org/impeccable/latest
- UI/UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Taste Skill: https://github.com/Leonxlnx/taste-skill
- Vercel agent skills: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
- shadcn skill: https://github.com/shadcn-ui/ui/tree/main/skills/shadcn
- Composio, "Top 10 Design Skills for Claude Code and Codex" (May 5, 2026): https://composio.dev/content/top-design-skills
- ClaudeSkills.info, "Frontend Design vs. Impeccable vs. UI/UX Pro Max" (Jul 25, 2026): https://claudeskills.info/blog/frontend-design-vs-impeccable-vs-ui-ux-pro-max/
- Firecrawl, "14 Best Claude Code Skills 2026": https://www.firecrawl.dev/blog/best-claude-code-skills
- Skillselion Impeccable listing (install count claim, unverified): https://skillselion.com/skills/pbakaus/impeccable
- Claude Code Frontend Design Toolkit (awesome-list): https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit

Uncertain or unverified:
- Install counts from directories (Skillselion, Composio) are self-reported.
- The exact file layout written by `npx impeccable install --scope=project` was inferred from the README and hooks.md. It was not observed, because nothing was installed. Confirm it at install time with the verify steps above.
