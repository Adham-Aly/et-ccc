from collections import deque

import vizrec as vz

rec = vz.Recorder()
rows, cols = map(int, rec.readline().split())
grid = [rec.readline() for _ in range(rows)]
for r in range(rows):
    for c in range(cols):
        if grid[r][c] == "S":
            start = (r, c)
        if grid[r][c] == "E":
            end = (r, c)

dist = [[-1] * cols for _ in range(rows)]
parent = {}
state = [["#" if grid[r][c] == "#" else "." for c in range(cols)] for r in range(rows)]


def name(cell):
    return f"{cell[0]},{cell[1]}"


def frame(queue):
    values = []
    for r in range(rows):
        row = []
        for c in range(cols):
            if dist[r][c] >= 0:
                row.append(dist[r][c])
            elif grid[r][c] in "SE":
                row.append(grid[r][c])
            else:
                row.append(None)
        values.append(row)
    items = []
    for i, cell in enumerate(queue):
        items.append((name(cell), name(cell), "frontier"))
    return {
        "grid": vz.grid(["".join(row) for row in state], values=values),
        "queue": vz.queue(items),
    }


dist[start[0]][start[1]] = 0
queue = deque([start])
state[start[0]][start[1]] = "q"
rec.step(
    "The search starts at S: its distance is 0 and it is the only cell in the queue.",
    **frame(queue)
)
answer = -1
while queue:
    r, c = queue.popleft()
    state[r][c] = "c"
    if (r, c) == end:
        answer = dist[r][c]
        rec.step(
            f"E comes off the front of the queue with distance {answer}. Every cell nearer to S was "
            f"taken out before it, so {answer} is the shortest distance.",
            **frame(queue)
        )
        break
    added = []
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and dist[nr][nc] == -1:
            dist[nr][nc] = dist[r][c] + 1
            parent[(nr, nc)] = (r, c)
            queue.append((nr, nc))
            state[nr][nc] = "q"
            added.append(name((nr, nc)))
    if added:
        joined = " and ".join(added) if len(added) <= 2 else ", ".join(added[:-1]) + " and " + added[-1]
        what = (
            f"Its open neighbours not seen before, {joined}, join the back of the queue "
            f"with distance {dist[r][c] + 1}."
        )
    else:
        what = "It has no open neighbour that is not already seen, so nothing joins the queue."
    rec.step(
        f"Cell {name((r, c))} leaves the front of the queue and becomes current "
        f"(distance {dist[r][c]}). {what}",
        **frame(queue)
    )
    state[r][c] = "d"

if answer >= 0:
    cell = end
    while cell != start:
        state[cell[0]][cell[1]] = "p"
        cell = parent[cell]
    state[start[0]][start[1]] = "p"
    rec.step(
        "Walking back from E to the cell each one was reached from gives one shortest path, "
        f"{answer} moves long.",
        **frame(queue)
    )
rec.output(f"{answer}\n")
