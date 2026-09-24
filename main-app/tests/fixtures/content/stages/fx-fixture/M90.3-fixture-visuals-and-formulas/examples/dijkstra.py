import heapq

n, m = map(int, input().split())
names = input().split()
index = {name: i for i, name in enumerate(names)}
adj = [[] for _ in range(n)]
for _ in range(m):
    a, b, w = input().split()
    adj[index[a]].append((index[b], int(w)))
    adj[index[b]].append((index[a], int(w)))

dist = [-1] * n
heap = [(0, 0)]
while heap:
    d, u = heapq.heappop(heap)
    if dist[u] != -1:
        continue
    dist[u] = d
    for v, w in adj[u]:
        if dist[v] == -1:
            heapq.heappush(heap, (d + w, v))
print(" ".join(str(x) for x in dist))
