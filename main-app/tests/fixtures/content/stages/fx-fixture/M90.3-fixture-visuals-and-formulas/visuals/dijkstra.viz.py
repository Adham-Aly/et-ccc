import heapq

import vizrec as vz

rec = vz.Recorder()
n, m = map(int, rec.readline().split())
names = rec.readline().split()
index = {name: i for i, name in enumerate(names)}
edges = []
adj = [[] for _ in range(n)]
for _ in range(m):
    a, b, w = rec.readline().split()
    edges.append((a, b, int(w)))
    adj[index[a]].append((index[b], int(w)))
    adj[index[b]].append((index[a], int(w)))
POS = {"A": (0, 1), "B": (1.5, 0), "C": (1.5, 2), "D": (3, 0), "E": (3, 2), "F": (4.5, 1)}
nodes = [(name, POS[name][0], POS[name][1]) for name in names]

dist = [-1] * n
best = {}
parent = {}
heap = [(0, 0)]
best[0] = 0


def frame(current=None, edge=None, edge_state=None, heap_state=None, final=False):
    node_states = {}
    for i, name in enumerate(names):
        if i == current:
            node_states[name] = "current"
        elif dist[i] != -1:
            node_states[name] = "path" if final else "done"
        elif i in best:
            node_states[name] = "frontier"
    edge_states = {}
    for v, u in parent.items():
        if dist[v] != -1:
            edge_states[(names[u], names[v])] = "path" if final else "done"
    if edge is not None:
        edge_states[edge] = edge_state
    values = {}
    for i, name in enumerate(names):
        if dist[i] != -1:
            values[name] = dist[i]
        elif i in best:
            values[name] = best[i]
        else:
            values[name] = "∞"
    items = []
    for d, u in sorted(heap):
        s = heap_state.get((d, u)) if heap_state else None
        items.append((f"{d},{names[u]}", s))
    return {
        "g": vz.graph(nodes, edges, node_states=node_states, edge_states=edge_states,
                      values=values, value_label="distance"),
        "h": vz.heap(items),
    }


rec.step(
    f"{names[0]} starts with distance 0, and the entry (0,{names[0]}) goes into the heap. Heap "
    "entries are (distance,node) pairs. Every other node is at ∞: no route to it is known yet.",
    **frame()
)
while heap:
    d, u = heap[0]
    if dist[u] != -1:
        rec.step(
            f"The smallest entry is ({d},{names[u]}), but {names[u]} is already done with distance "
            f"{dist[u]}. This entry is out of date, so it is thrown away.",
            **frame(heap_state={(d, u): "invalid"})
        )
        heapq.heappop(heap)
        continue
    rec.step(
        f"The smallest entry is ({d},{names[u]}). No shorter route to {names[u]} can appear later, "
        f"because every other entry is at least {d}: {names[u]} is done with distance {d}.",
        **frame(current=u, heap_state={(d, u): "current"})
    )
    heapq.heappop(heap)
    dist[u] = d
    for v, w in adj[u]:
        if dist[v] != -1:
            continue
        edge = (names[u], names[v])
        if v not in best or d + w < best[v]:
            before = best.get(v, "∞")
            best[v] = d + w
            parent[v] = u
            heapq.heappush(heap, (d + w, v))
            rec.step(
                f"Through {names[u]}, {names[v]} is {d} + {w} = {d + w} away, better than {before}. "
                f"({d + w},{names[v]}) goes into the heap.",
                **frame(current=u, edge=edge, edge_state="frontier",
                        heap_state={(d + w, v): "frontier"})
            )
        else:
            rec.step(
                f"Through {names[u]}, {names[v]} would be {d} + {w} = {d + w} away, which does not "
                f"beat {best[v]}. Nothing changes.",
                **frame(current=u, edge=edge, edge_state="compare")
            )
rec.step(
    "The heap is empty. Every distance is final, and the marked edges show the route each "
    "node was reached by.",
    **frame(final=True)
)
rec.output(" ".join(str(x) for x in dist) + "\n")
