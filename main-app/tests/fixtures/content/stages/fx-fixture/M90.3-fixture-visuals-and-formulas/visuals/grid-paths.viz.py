import vizrec as vz

rec = vz.Recorder()
rows, cols = map(int, rec.readline().split())
ways = [[None] * cols for _ in range(rows)]


def frame(cur=None, arrows=None, final=False):
    states = {}
    for r in range(rows):
        for c in range(cols):
            if ways[r][c] is not None:
                states[(r, c)] = "done"
    if cur is not None:
        states[cur] = "current"
        for a in arrows or []:
            states[a[0]] = "compare"
    if final:
        states[(rows - 1, cols - 1)] = "path"
    return vz.table(ways, states=states, row_heads=list(range(rows)), col_heads=list(range(cols)),
                    row_title="r", col_title="c", arrows=arrows)


for c in range(cols):
    ways[0][c] = 1
for r in range(rows):
    ways[r][0] = 1
rec.step(
    "Moving only right or down, there is exactly one way to reach any cell in the top row or the "
    "left column, so those cells hold 1.",
    t=frame(),
)
for r in range(1, rows):
    for c in range(1, cols):
        up, left = ways[r - 1][c], ways[r][c - 1]
        ways[r][c] = up + left
        rec.step(
            f"Cell ({r}, {c}) is entered from above or from the left: {up} + {left} = {up + left} ways.",
            t=frame((r, c), [((r - 1, c), (r, c)), ((r, c - 1), (r, c))]),
        )
rec.step(
    f"The bottom-right cell holds the answer: {ways[rows - 1][cols - 1]} different routes.",
    t=frame(final=True),
)
rec.output(f"{ways[rows - 1][cols - 1]}\n")
