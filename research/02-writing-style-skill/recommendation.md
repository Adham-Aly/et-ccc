**PENDING MANAGER APPROVAL (D-009). DO NOT INSTALL.**

# Writing-style skill recommendation (Phase 1b)

Researched 2026-09-21 from live sources. I read each candidate's SKILL.md (and README where relevant) from GitHub at a pinned tag. Stars, push dates, licenses and tag SHAs come from `api.github.com` on 2026-09-21. Nothing was installed; the only files written outside this folder are temporary downloads in the session scratchpad.

## TL;DR

- **Top pick: Humanizer** (`blader/humanizer`), skill **v3.0.0**, tag commit `9862685f575c65a8247f90369951df1b3416e3d6` (2026-09-06), **MIT**. Source: https://github.com/blader/humanizer
- **Runners-up:** avoid-ai-writing (`conorbronsdon/avoid-ai-writing`), stop-slop (`hardikpandya/stop-slop`), vale-ai-tells (`tbhb/vale-ai-tells`, a Vale lint package rather than a writing skill).
- **Why Humanizer:** it is the most adopted skill of its kind by a wide margin, it follows the current Wikipedia "Signs of AI writing" article closely, and it is one Markdown file with no scripts, hooks or binaries. Its rules are ranked by strength, with false-positive guards, so it removes tells without flattening the prose. It refuses to invent facts, and in file mode it leaves code blocks, inline code and link targets alone. Both matter for lessons full of Python and judge links.
- **Containment:** full. One file copied to `.claude/skills/humanizer/SKILL.md` in the workspace. Nothing runs, nothing is downloaded at run time, nothing touches the home directory.
- **Supplement (recommended, not a second skill):** a workspace style guide with a hand-written teaching-voice sample, plus a small project-owned lint script that fails the build on hard tells (dashes, banned words, chatbot residue). A rewrite skill alone cannot guarantee "complete elimination" across hundreds of pages; a deterministic check can.

## What the task needs

Lesson prose for a complete beginner must be clear, warm and patient. The risk with anti-AI skills is overcorrection: some strip every "you", every encouraging line and every example, and the result is a dry reference manual. The ideal skill:

1. removes the real tells (stock words, dashes, not-X-but-Y, triads, staged openers, filler, sycophancy, bold-label bullet lists, generic summaries);
2. keeps the teaching voice (direct address, a short reassurance where a beginner will get stuck, concrete examples);
3. never alters code or facts;
4. can be applied by many writer agents consistently;
5. lives entirely inside the workspace.

## Candidates compared

| # | Skill | License | Maintenance (2026-09-21) | Adoption | What it is | Grounding | Beginner-teaching fit | Containment |
|---|---|---|---|---|---|---|---|---|
| 1 | **Humanizer** `blader/humanizer` | MIT | v3.0.0 on 2026-09-06; releases every 1 to 3 weeks since Jan 2026; 24 open issues | ~51.1k stars, ~4.1k forks. #1 in Analytics Vidhya's "Top 5 Claude Skills for Writing" (Aug 2026, at 33.7k stars then) | One SKILL.md (28.7 KB, about 7k tokens). 25 patterns in 5 groups, ranked by strength, each with before/after. Process: mark tells, draft, self-check, final. Modes: pasted text, file, embedded | Wikipedia "Signs of AI writing" (WikiProject AI Cleanup). v3.0.0 re-synced with the current article (dropped patterns Wikipedia now lists as human habits) | Good. "Weak alone" guards, keep-your-voice list, writing-sample override. Default for technical text is "neutral and plain", so we supply a warm teaching sample (see Supplements) | **Full.** Markdown only, no scripts at run time, no hooks |
| 2 | **avoid-ai-writing** `conorbronsdon/avoid-ai-writing` | MIT | v3.35.0 on 2026-09-14; commits daily; 53 open issues | ~4.65k stars | A skill plus 5 sibling skills, a 96 KB pattern catalog it must load in full (about 25k tokens per use), a zero-dependency Node detector (54 categories), a preservation validator, voice profiles (incl. `warm`) and context profiles (incl. `docs`) | Mixed: Wikipedia-style catalog plus its own corpus and false-positive measurements; cites detector research | Good in principle (`warm` voice, `docs` context). Catalog is tuned toward LinkedIn, investor email and crypto posts; its tone advice ("have a voice, cut the neutrality, take a position, fragments are fine") suits blogs more than lessons | Mostly. Scripts run with the system `node` from the skill folder. README installs to `~/.claude/skills` or as a user plugin, and offers `npm -g`, `npx`, an MCP server and pre-commit; all of those must be avoided |
| 3 | **stop-slop** `hardikpandya/stop-slop` | MIT | Last commit 2026-03-17 (inactive 6 months) | ~17.5k stars | SKILL.md (2.6 KB) plus 3 reference files: banned phrases, structures, examples, and a 1 to 10 self-score across 5 dimensions | Ad hoc, author's own lists | Weaker. A review (codeline.co, May 2026) calls it "overly rigid", with blanket bans on em dashes and all adverbs and "no escape hatch". Adverb bans hurt explanatory prose | Full (Markdown only) |
| 4 | **vale-ai-tells** `tbhb/vale-ai-tells` | MIT | v1.37.0 on 2026-09-15; very active | ~108 stars | A Vale style package (137 regex rules, all `error`) with a small SKILL.md that runs Vale and reads the findings back | Corpus-checked against pre-LLM docs (PEPs, Go and Python stdlib) | Linter only, no rewrite. Rules target developer docs (e.g. "owns", "shape", "gates") and would be noisy on lesson prose | Needs the Vale binary (Go, downloaded) and `vale sync` over the network. Can be contained with a local binary and `StylesPath`, but it is a second tool to manage |

Also looked at and rejected:

- `jalaalrd/anti-ai-slop-writing` (476 stars) and `realrossmanngroup/no_ai_slop_writing_rules` (687 stars): **no license**, so we cannot legally copy them. The Rossmann one is also tied to one person's voice.
- `Nanako0129/sepia` (2.8k stars, MIT): fiction-first ("narrative-architecture repair"), not suited to lessons.
- `adenaufal/anti-slop-writing` (131 stars), `aplaceforallmystuff/the-antislop` (30), `gregorymm/humanize-text` (7), `jpeggdev/humanize-writing` (63), `jooray/humanizer` (50), `Aparnabuilds/humanizer` (0), `GitVoytenko/anti-ai-slop-writing` (0): small forks or variants of the same idea with little adoption.
- Humanizer language ports (`op7418/Humanizer-zh`, etc.): not English.
- **Anthropic official:** there is no official anti-AI-writing skill. `anthropics/skills` (19 skills) and `anthropics/claude-plugins-official` (39 plugins) contain none. Anthropic's Claude Fable 5.1 prompting guide (2026-09-01) does define "mannered prose" ("substitutes metaphor and flourish for direct statement") and recommends asking the model to remove it. That definition belongs in our style guide (see Supplements).

## Decision: Humanizer

### Why it wins

1. **Grounding.** Its patterns come from Wikipedia's "Signs of AI writing", the most widely cited evidence-based list, kept up by editors who clean AI text out of Wikipedia every day. The v3.0.0 release notes show the author re-syncing with the article, including dropping two patterns the article now lists as human habits. Other candidates use ad hoc lists or blend in marketing-specific tells.
2. **It covers what the Manager listed.** Stock words (§12, includes delve, crucial, landscape, tapestry, showcase, underscore), staged openers like "let's dive in" and "here's what you need to know" (§4), dashes (§8, zero em or en dashes in the final text unless a sample uses them), triads (§6), stacked hedges (§9), sycophancy and chatbot residue (§22), bold-label bullet lists and title-case headings (§19, §20), not-X-but-Y in all its forms (§1), one-line closers and generic send-offs (§2, §13). "It's worth noting" and "in today's world" fall under §3, §4 and §13 but are not named word for word; our lint list should name them (see Supplements).
3. **It does not sterilize.** Tells are ranked: §1 to §5 justify an edit on one sighting, and the weaker ones need company before the model acts. It protects the things that make writing sound human (specific details, genuine asides, first-person choices). It keeps an ordinary "honestly" or "look" and only cuts staged ones. In a lesson, "Let's run it and see what happens" is an invitation to act, not a run-up, and survives.
4. **It is safe for technical lessons.** File mode changes prose only and keeps code blocks, inline code, commands, paths, frontmatter and link targets as they are. That protects Python examples and the WMOJ/DMOJ links (R13). It never adds a fact, number or citation that is not in the source, so it cannot introduce errors into explanations.
5. **Voice control.** If given a writing sample, it matches the sample's sentence length, word choice and punctuation, and the sample overrides the pattern list. That lets us set one warm teaching voice for every writer agent.
6. **Cheap and simple.** About 7k tokens per use, against about 30k or more for avoid-ai-writing's required catalog. That matters when many workers write and review hundreds of lesson pages. There is no engine, no update churn to track and no hooks.
7. **Healthy.** MIT, ~51k stars, the top writing skill by stars, steady releases, a validation script and CI in the repo.

### Weaknesses and how to handle them

- **It is a rewrite pass, not a gate.** It applies rules when invoked and does not check anything afterwards. Handle with the lint script below, and by having writer agents read the SKILL.md before drafting as well as run it afterwards.
- **Its default for technical text is "neutral and plain".** Handle with a warm teaching-voice sample in the style guide, which the skill treats as overriding.
- **Its word list is short on purpose** ("the only vocabulary list in the skill"). Handle with the project lint list.
- **It has no education-specific guidance.** Nothing like "define each term on first use" or "one new idea per paragraph". That belongs in our own style guide anyway.

### Relationship with Impeccable

The two are complementary and do not conflict.

- Impeccable owns the UI and its microcopy. Its `clarify` command rewrites labels, buttons, errors, empty and loading states.
- Humanizer owns long-form lesson prose: explanations, walkthroughs, hints, editorial notes.
- Their rules agree where they overlap (sentence-case headings, no decorative bold or emoji, plain labels). Neither installs hooks that act on the other's files. Humanizer adds no hooks at all.
- Suggested split for build phases: run Humanizer on lesson content files, run Impeccable `clarify` on component strings. If both touch the same UI string, Impeccable's `clarify` wins for that string, followed by the lint check.

### Containment assessment

Verdict: **100% containable, lowest risk of all candidates.**

- Runtime footprint: one Markdown file. No scripts are executed by the skill. `scripts/validate-package.py` and the CI workflow are for the repo's own maintainers and are not needed.
- No hooks, no MCP server, no engine download, no home-directory state, no network access at run time.
- The repo's documented installs are what we must avoid: `npx skills add ... --global` writes to the user's agent folders, the `/plugin marketplace add` route installs at user scope, and even project-mode `npx` fills `~/.npm`. A manual copy of the pinned file avoids all three.
- Removal: deleting `.claude/skills/humanizer/` (or the workspace) removes it completely.

### Install steps (for later; NOT executed)

Run only after the Manager approves D-009 and the main session authorizes an install.

```bash
# 0. Snapshot global locations before install (per operating-rules §7)
mkdir -p /Users/adham/Developer/et-ccc/.tooling
ls -la ~/.claude/skills ~/.claude/plugins 2>/dev/null > /Users/adham/Developer/et-ccc/.tooling/humanizer-pre.txt

# 1. Fetch the pinned file directly (no npx, no git clone into ~)
mkdir -p /Users/adham/Developer/et-ccc/.claude/skills/humanizer
curl -fsSL https://raw.githubusercontent.com/blader/humanizer/9862685f575c65a8247f90369951df1b3416e3d6/SKILL.md \
  -o /Users/adham/Developer/et-ccc/.claude/skills/humanizer/SKILL.md
curl -fsSL https://raw.githubusercontent.com/blader/humanizer/9862685f575c65a8247f90369951df1b3416e3d6/LICENSE \
  -o /Users/adham/Developer/et-ccc/.claude/skills/humanizer/LICENSE

# 2. Verify integrity (SHA-256 of SKILL.md at v3.0.0, measured 2026-09-21)
shasum -a 256 /Users/adham/Developer/et-ccc/.claude/skills/humanizer/SKILL.md
# expect: e8269e236bed06ed0fe4824c274112e54950b0cb46b0bafe5e1576ef7c9f93d5

# 3. Confirm version in frontmatter: metadata.version "3.0.0"
head -12 /Users/adham/Developer/et-ccc/.claude/skills/humanizer/SKILL.md

# 4. Snapshot again and diff; expect no change
ls -la ~/.claude/skills ~/.claude/plugins 2>/dev/null | diff /Users/adham/Developer/et-ccc/.tooling/humanizer-pre.txt - && echo "no global change"
```

- Claude Code sessions started in `/Users/adham/Developer/et-ccc` discover project skills in `.claude/skills/`. Invoke with `/humanizer`, or tell agents "apply the humanizer skill to <file>".
- Uninstall: `rm -rf /Users/adham/Developer/et-ccc/.claude/skills/humanizer`.
- Do not use `npx skills add`, `/plugin marketplace add blader/humanizer` or `/plugin install`.

## Runners-up

1. **avoid-ai-writing** (`conorbronsdon/avoid-ai-writing`, v3.35.0, commit `fc979c6489ec0ac81a77236782ba496da81b24cb`, MIT). The most thorough option. It has about 70 prose patterns, `warm` and `docs` profiles, and a real deterministic detector plus a validator that proves a rewrite did not touch code, links or headings. It lost for three reasons:
   - about 30k tokens of required reading per use;
   - a catalog and tone advice tuned for social posts and blogs;
   - a large, fast-moving surface (6 skills, dozens of scripts, 35 minor releases in six months) that would need pinning and re-review.

   Choose it instead if the Manager wants the lint built in rather than written by us. Contained install would mean copying `skills/avoid-ai-writing/` at a pinned tag into `.claude/skills/` and running its Node scripts with the system `node`, never `npx`, `npm -g`, the MCP server or the user-scope plugin.
2. **stop-slop** (`hardikpandya/stop-slop`, MIT). Popular, tiny and fully containable. It is inactive since March 2026 and too rigid for teaching: blanket bans on adverbs and dashes, with no escape hatch.
3. **vale-ai-tells** (`tbhb/vale-ai-tells`, MIT). The best standalone prose linter found. It is not a writing skill. It needs the Vale binary plus a network `vale sync`, and its rules are tuned for developer docs. A possible lint engine if our own script proves too weak.

## Supplementary recommendations (not a second skill)

A skill instructs a model. It cannot prove that 100+ lesson pages are clean. For "complete elimination", pair Humanizer with two workspace-local pieces owned by the project:

1. **`content/STYLE.md` teaching style guide** (written in a build phase, by a human-quality pass):
   - A **voice sample**: 2 or 3 paragraphs of warm, plain beginner teaching prose, written carefully and edited by hand. Humanizer matches it and it overrides its defaults, so every writer agent lands on the same voice.
   - Teaching rules the skill lacks: define every term on first use; one new idea per paragraph; show code, then explain what it did; address the learner as "you"; at most one short encouraging line where a beginner will predictably struggle; no praise for the learner or the material ("great", "powerful", "amazing").
   - Anthropic's "mannered prose" definition from the Fable 5.1 guide, quoted, with the instruction to remove it.
   - Project hard rules: no em or en dashes in prose; sentence-case headings; no bold labels in lists; no closing "In summary" or "Key takeaways" boilerplate unless the page design calls for a recap box.
2. **A deterministic lint check** (a zero-dependency Node script inside `main-app/`, run in `npm run lint` and CI). It scans lesson prose only, skipping code blocks and inline code, and fails on:
   - any `—` or `–`, and ` -- ` used as a dash;
   - a banned-phrase list: Humanizer §12 words plus "it's worth noting", "it is important to note", "in today's world", "let's dive in", "delve", "embark", "journey" (figurative), "unlock", "harness", "game-changer", "seamless", "robust" (outside technical use), "Great question", "I hope this helps", "Happy coding";
   - not-X-but-Y regexes ("not just", "not only ... but", "isn't X, it's Y");
   - bold-colon list items (`- **Label:**`).

   Softer signals are printed as warnings: three-item lists in a row, one-sentence closing paragraphs, and a heading repeated in the next sentence. Writing our own list keeps false positives low on teaching text (e.g. "Let's run it" stays legal). If more coverage is wanted later, avoid-ai-writing's `detector/patterns.js` (MIT, zero-dependency) can be vendored as the engine.

Suggested content workflow for build phases:

1. The writer agent reads `STYLE.md` and Humanizer's SKILL.md before drafting.
2. The writer drafts.
3. The writer runs Humanizer in file mode on the lesson.
4. The lint check runs.
5. A reviewer agent spot-reads a sample of pages.

## Sources

- Humanizer repo, SKILL.md and README at v3.0.0: https://github.com/blader/humanizer, https://raw.githubusercontent.com/blader/humanizer/v3.0.0/SKILL.md
- Humanizer install count (7.4k via Skills CLI): https://skills.sh/blader/humanizer
- Wikipedia, Signs of AI writing (advice page, WikiProject AI Cleanup): https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- avoid-ai-writing repo, SKILL.md, references/patterns.md at v3.35.0: https://github.com/conorbronsdon/avoid-ai-writing
- stop-slop repo: https://github.com/hardikpandya/stop-slop
- stop-slop review (Florian Narr, 2026-05-24): https://www.codeline.co/thoughts/repo-review/2026/stop-slop-a-skill-for-removing-ai-writing-tells
- vale-ai-tells: https://github.com/tbhb/vale-ai-tells ; Vale: https://github.com/vale-cli/vale
- Analytics Vidhya, Top 5 Claude Skills for Writing (2026-08-06): https://www.analyticsvidhya.com/blog/2026/08/top-5-claude-writing-skills/
- Humanizer issue on merging Humanizer and Stop-slop v2: https://github.com/blader/humanizer/issues/125
- Anthropic, Prompting Claude Fable 5.1 ("mannered prose", 2026-09-01): https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 (via summary at https://paddo.dev/blog/a-dial-worth-turning/)
- Official Anthropic skill and plugin lists (no anti-AI-writing skill): https://github.com/anthropics/skills , https://github.com/anthropics/claude-plugins-official
- Other candidates checked: https://github.com/jalaalrd/anti-ai-slop-writing , https://github.com/realrossmanngroup/no_ai_slop_writing_rules , https://github.com/Nanako0129/sepia , https://github.com/adenaufal/anti-slop-writing , https://github.com/aplaceforallmystuff/the-antislop , https://github.com/gregorymm/humanize-text , https://github.com/jpeggdev/humanize-writing
- Impeccable `clarify` reference (overlap check): https://github.com/pbakaus/impeccable/blob/skill-v4.3.1/.claude/skills/impeccable/reference/clarify.md
