# Phase 3 (Setup): plain-language summary for the Manager report

**What this phase did:** it prepared the workshop. Nothing in the app was built yet; that starts in Phase 4.

## What happened

- **Private GitHub repository created:** https://github.com/Adham-Aly/et-ccc. It is private and uses your existing GitHub login and git name without changing either. The whole project so far is saved there, and each later phase will save its work there too.
- **Tools installed, all inside the project folder:** the JavaScript runtime that builds the app (Node 24, the same version Vercel uses to build the site), a Python 3.8 (PyPy) that matches the contest grader's language level, and two Python checkers. Every download was verified against its official checksum.
- **Both approved skills installed, in this project only:** Impeccable (design) and avoid-ai-writing (plain, non-robotic teaching prose). Both were smoke-tested: the design checker flagged the problems in a deliberately bad sample page, and the writing checker flagged a sample full of AI cliches and passed a plain one.
- **Safety rails added:** agents may only use the project's own tools, never the ones installed on your Mac. An automatic check stops any command that tries otherwise, and any attempt to change your GitHub login or git settings. A proof tool photographs the parts of your Mac outside the project before and after installs and reports any difference.

## What was found

- **Containment proof:** nothing was left outside the project folder apart from normal background activity by macOS, your own apps and the Claude app itself. One slip happened and was cleaned up: early on, one install step briefly used your Mac's shared download cache for Python packages. Its new files were removed straight away, and the cause was fixed so it cannot happen again. The only lasting effect is that one old cached download in that cache is gone; the system fetches it again if it is ever needed. Nothing you use is affected.
- The build-tool version Vercel uses was checked on Vercel's own documentation (Node 24), and the project is pinned to it.

## What needs you

- **Please restart the Claude Code session** before Phase 4 starts. The project's safety settings and the two skills only fully switch on in a fresh session.
- Nothing else. Linking Vercel comes in Phase 4.

## What comes next

Phase 4 builds the app's foundation: the design, the reading pages, the animation system and the first deployment to Vercel, where you will review the look and feel on a live link.
