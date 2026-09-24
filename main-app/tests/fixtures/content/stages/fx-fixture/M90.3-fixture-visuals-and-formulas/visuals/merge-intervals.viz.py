import vizrec as vz

rec = vz.Recorder()
n = int(rec.readline())
intervals = sorted(tuple(map(int, rec.readline().split())) for _ in range(n))
merged = []
# Pack the intervals onto rows 1-3 so that intervals on one row never overlap.
row_end = []
rows = []
for a, b in intervals:
    for r, end in enumerate(row_end):
        if a > end:
            row_end[r] = b
            rows.append(r + 1)
            break
    else:
        row_end.append(b)
        rows.append(len(row_end))


def frame(i=None, sweep=None):
    ivs = []
    for j, (a, b) in enumerate(intervals):
        state = "current" if j == i else ("done" if i is None or j < i else "unvisited")
        ivs.append((a, b, f"[{a}, {b}]", state, rows[j]))
    for a, b in merged:
        ivs.append((a, b, None, "path", 0))
    return vz.line(0, 12, tick=2, intervals=ivs, sweep=sweep)


rec.step(
    "The intervals are sorted by where they start. The merged blocks will grow on the top row, "
    "and a sweep line visits each start from left to right.",
    a=frame(-1),
)
for i, (a, b) in enumerate(intervals):
    if merged and a <= merged[-1][1]:
        old = merged[-1][1]
        merged[-1][1] = max(old, b)
        what = (
            f"`[{a}, {b}]` starts at {a}, before the current block ends at {old}, so it joins that block"
            + (f", which now ends at {b}." if b > old else ", which already covers it.")
        )
    else:
        merged.append([a, b])
        what = f"`[{a}, {b}]` starts after every block so far ends, so it opens a new block."
    rec.step(what, a=frame(i, (a, f"x = {a}")))
total = sum(b - a for a, b in merged)
rec.step(
    f"Every interval is placed: {len(merged)} block(s) covering {total} units in total.",
    a=frame(),
)
rec.output(f"{len(merged)} {total}\n")
