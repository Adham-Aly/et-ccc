# P3 final containment verdict (G-CONTAIN), 2026-09-23

Snapshot label `p3-setup`: before 22:28:21, final after/diff ~22:58. Raw outputs: `p3-final-diff-report.txt` and `p3-final-backstop-classified.txt` (every path newer than the marker, with its classification). The auditor's independent run is in `p3-after-diff-report.txt`.

**Verdict: PASS.** No path outside the workspace was written by a project tool. HARD-FAIL (tool-named) = 0.

The tool's raw RESULT line says FAIL because of 2 UNLISTED paths. I reviewed both by hand; neither comes from the project:

| Path | Evidence | Owner |
|---|---|---|
| `~/Desktop/resume.pdf` (+ the `~/Desktop` dir mtime) | born 22:49:36; quarantine xattr from **Brave**; `kMDItemWhereFroms` = https://www.overleaf.com/; creator "LaTeX with hyperref" | The Manager, downloading their own file while P3 ran. Deliberately **not** allow-listed: Manager reports land on the Desktop and must stay visible to the proof. |

Other items, all classified by the tool:
- `~/Downloads` dir mtime at 22:49:49: Brave's temporary download entry for the same file. Allow-listed as the directory mtime only; any new file there still fails.
- `~/.npm/_logs/*`: exempted only after checking each log's content. It must be Homebrew npm running `npm --global config get prefix` (the harness's periodic probe; D-034).
- The pip-cache incident (D-039) was remediated before this diff. The auditor verified that the `~/Library/Caches/pip` snapshots before and after are identical.
- The auditor's live B-1 test installed a public npm package into `.tooling/npm-global` (inside the workspace) and removed it. `.tooling/npm-global` now holds only an empty `lib/`.
