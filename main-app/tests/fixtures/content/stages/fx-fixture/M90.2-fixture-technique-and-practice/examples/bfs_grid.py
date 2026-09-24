from collections import deque

rows, cols = map(int, input().split())
grid = [input() for _ in range(rows)]
for r in range(rows):
    for c in range(cols):
        if grid[r][c] == "S":
            start = (r, c)

dist = [[-1] * cols for _ in range(rows)]
dist[start[0]][start[1]] = 0
queue = deque([start])
answer = -1
while queue:
    r, c = queue.popleft()
    if grid[r][c] == "E":
        answer = dist[r][c]
        break
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and dist[nr][nc] == -1:
            dist[nr][nc] = dist[r][c] + 1
            queue.append((nr, nc))
print(answer)
