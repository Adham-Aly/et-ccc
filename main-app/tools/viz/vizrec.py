"""vizrec: the small recorder API a `<name>.viz.py` uses to emit step-through frames.

Runs under PyPy 3.8, standard library only (plan 4.11.6). `npm run gen:viz` runs a `.viz.py`
once per preset of its `.viz.yaml`, with the preset's stdin on standard input (the same input
the shown example reads), and collects the recorded steps into `<name>.frames.json`.

A `.viz.py` looks like:

    import vizrec as vz

    rec = vz.Recorder()
    n = int(rec.readline())
    ...
    rec.step("Caption: what changed and why.", grid=vz.grid(rows), queue=vz.queue(items))
    rec.output("%d\\n" % answer)   # what the shown example prints (consistency check)
    rec.done()

Panel keyword names are the panel ids of the `.viz.yaml`. States are words ("current") or the
one-letter codes of lib/viz/schema.ts.
"""

import atexit
import json
import os
import sys

STATE_CODES = {
    "none": "_",
    "unvisited": ".",
    "frontier": "q",
    "queued": "q",
    "current": "c",
    "done": "d",
    "visited": "d",
    "path": "p",
    "compare": "m",
    "compared": "m",
    "invalid": "x",
    "wall": "#",
}
CODES = set(STATE_CODES.values())


class VizrecError(Exception):
    pass


def code(state):
    """A state word or code -> its one-letter code."""
    if state is None:
        return "_"
    if state in CODES:
        return state
    if state in STATE_CODES:
        return STATE_CODES[state]
    raise VizrecError(f"unknown state {state!r}")


def _value(v):
    if isinstance(v, bool):
        return str(v)
    if v is None or isinstance(v, (int, str)):
        return v
    if isinstance(v, float):
        if v == float("inf"):
            return "∞"
        return round(v, 4)
    return str(v)


def _states(states, n):
    """states: None, a code string, a list of words/codes, or a {index: state} dict."""
    if states is None:
        return None
    if isinstance(states, str):
        if len(states) != n:
            raise VizrecError(f"state string {states!r} has {len(states)} codes for {n} items")
        for ch in states:
            code(ch)
        return states
    if isinstance(states, dict):
        out = ["_"] * n
        for i, s in states.items():
            out[i] = code(s)
        return "".join(out)
    return "".join(code(s) for s in states)


def _clean(d):
    return {k: v for k, v in d.items() if v is not None}


# ---- frame builders (one per visualizer) ------------------------------------------------------


def array(values, states=None, pointers=None, ranges=None, compare=None, name=None, index_base=None,
          indices=None, circular=None):
    """ArrayViz frame. pointers: {"i": 2} or [("i", 2, "above", True)]; ranges: [(from, to, label)]."""
    vals = [_value(v) for v in values]
    ptrs = None
    if pointers:
        ptrs = []
        items = pointers.items() if isinstance(pointers, dict) else pointers
        for p in items:
            p = tuple(p)
            entry = {"name": p[0], "at": p[1]}
            if len(p) > 2 and p[2]:
                entry["side"] = p[2]
            if len(p) > 3 and p[3]:
                entry["strong"] = True
            ptrs.append(entry)
    rng = None
    if ranges:
        rng = []
        for r in ranges:
            entry = {"from": r[0], "to": r[1], "label": r[2]}
            if len(r) > 3 and r[3]:
                entry["side"] = r[3]
            rng.append(entry)
    cmp_ = {"a": compare[0], "b": compare[1], "text": compare[2]} if compare else None
    return _clean({
        "values": vals,
        "states": _states(states, len(vals)),
        "pointers": ptrs,
        "ranges": rng,
        "compare": cmp_,
        "name": name,
        "indexBase": index_base,
        "indices": indices,
        "circular": circular,
    })


def grid(rows, values=None, indices=None):
    """GridViz frame. rows: list of code strings (or lists of states); values: 2D list or None."""
    cells = [r if isinstance(r, str) else "".join(code(s) for s in r) for r in rows]
    for r in cells:
        for ch in r:
            code(ch)
    vals = [[_value(v) for v in row] for row in values] if values is not None else None
    return _clean({"cells": cells, "values": vals, "indices": indices})


def graph(nodes, edges, node_states=None, edge_states=None, values=None, labels=None, directed=None,
          value_label=None):
    """GraphViz frame.

    nodes: [(id, x, y)] in layout units; edges: [(a, b)] or [(a, b, weight)];
    node_states: {id: state}; edge_states: {(a, b): state}; values: {id: value}.
    """
    node_states = node_states or {}
    edge_states = edge_states or {}
    values = values or {}
    labels = labels or {}
    out_nodes = []
    for n in nodes:
        nid = str(n[0])
        out_nodes.append(_clean({
            "id": nid,
            "x": n[1],
            "y": n[2],
            "label": labels.get(n[0]),
            "value": _value(values[n[0]]) if n[0] in values else None,
            "s": code(node_states[n[0]]) if n[0] in node_states else None,
        }))
    out_edges = []
    for e in edges:
        key = (e[0], e[1])
        s = edge_states.get(key)
        if s is None and not directed:
            s = edge_states.get((e[1], e[0]))
        out_edges.append(_clean({
            "a": str(e[0]),
            "b": str(e[1]),
            "w": _value(e[2]) if len(e) > 2 else None,
            "s": code(s) if s is not None else None,
        }))
    return _clean({"nodes": out_nodes, "edges": out_edges, "directed": directed, "valueLabel": value_label})


def node(nid, label, children=None, state=None, note=None, edge=None):
    """A TreeViz node."""
    return _clean({
        "id": str(nid),
        "label": str(label),
        "note": note,
        "s": code(state) if state is not None else None,
        "e": code(edge) if edge is not None else None,
        "children": children or None,
    })


def tree(root):
    """TreeViz frame (root may be None for an empty tree)."""
    return {"root": root}


def table(cells, states=None, row_heads=None, col_heads=None, row_title=None, col_title=None,
          arrows=None):
    """TableViz frame. states: list of code strings or {(r, c): state}; arrows: [((r, c), (r, c))]."""
    vals = [[_value(v) for v in row] for row in cells]
    st = None
    if isinstance(states, dict):
        grid_ = [["_"] * len(vals[0]) for _ in vals]
        for (r, c), s in states.items():
            grid_[r][c] = code(s)
        st = ["".join(row) for row in grid_]
    elif states is not None:
        st = [r if isinstance(r, str) else "".join(code(s) for s in r) for r in states]
    arr = [{"from": list(a[0]), "to": list(a[1])} for a in arrows] if arrows else None
    return _clean({
        "cells": vals,
        "states": st,
        "rowHeads": [_value(v) for v in row_heads] if row_heads is not None else None,
        "colHeads": [_value(v) for v in col_heads] if col_heads is not None else None,
        "rowTitle": row_title,
        "colTitle": col_title,
        "arrows": arr,
    })


def struct(kind, items, name=None):
    """StructViz frame. items: values, (value, state), (id, value, state) or dicts."""
    out = []
    for it in items:
        if isinstance(it, dict):
            entry = dict(it)
            if "s" in entry:
                entry["s"] = code(entry["s"])
            if "v" in entry:
                entry["v"] = _value(entry["v"])
            if "k" in entry:
                entry["k"] = _value(entry["k"])
            out.append(_clean(entry))
        elif isinstance(it, tuple):
            if len(it) == 3:
                out.append(_clean({"id": str(it[0]), "v": _value(it[1]), "s": code(it[2]) if it[2] else None}))
            else:
                out.append(_clean({"v": _value(it[0]), "s": code(it[1]) if it[1] else None}))
        else:
            out.append({"v": _value(it)})
    return _clean({"kind": kind, "items": out, "name": name})


def stack(items, name=None):
    return struct("stack", items, name)


def queue(items, name=None):
    return struct("queue", items, name)


def heap(items, name=None):
    return struct("heap", items, name)


def line(lo, hi, tick=None, points=None, intervals=None, sweep=None, kind=None, at=None):
    """LineViz frame. points: [(x, label, state)]; intervals: [(a, b, label, state, row)]."""
    pts = None
    if points:
        pts = []
        for p in points:
            pts.append(_clean({
                "x": p[0],
                "label": p[1] if len(p) > 1 else None,
                "s": code(p[2]) if len(p) > 2 and p[2] else None,
            }))
    ivs = None
    if intervals:
        ivs = []
        for iv in intervals:
            ivs.append(_clean({
                "a": iv[0],
                "b": iv[1],
                "label": iv[2] if len(iv) > 2 else None,
                "s": code(iv[3]) if len(iv) > 3 and iv[3] else None,
                "row": iv[4] if len(iv) > 4 else None,
            }))
    sw = _clean({"x": sweep[0], "label": sweep[1] if len(sweep) > 1 else None}) if sweep else None
    return _clean({
        "kind": kind,
        "min": lo,
        "max": hi,
        "tick": tick,
        "points": pts,
        "intervals": ivs,
        "sweep": sw,
        "at": at,
    })


def plot(x, y, series, markers=None, vline=None, band=None):
    """PlotViz frame. x/y: (min, max, label[, ticks]); series: [(id, label, pts, style, state)]."""

    def axis(a):
        return _clean({"min": a[0], "max": a[1], "label": a[2], "ticks": list(a[3]) if len(a) > 3 else None})

    ser = []
    for s in series:
        ser.append(_clean({
            "id": s[0],
            "label": s[1],
            "pts": [[_value(px), _value(py)] for px, py in s[2]],
            "style": s[3] if len(s) > 3 else None,
            "s": code(s[4]) if len(s) > 4 and s[4] else None,
        }))
    mk = None
    if markers:
        mk = [_clean({"x": m[0], "y": m[1], "label": m[2] if len(m) > 2 else None,
                      "s": code(m[3]) if len(m) > 3 and m[3] else None}) for m in markers]
    vl = _clean({"x": vline[0], "label": vline[1] if len(vline) > 1 else None}) if vline else None
    bd = _clean({"a": band[0], "b": band[1], "label": band[2] if len(band) > 2 else None}) if band else None
    return _clean({"x": axis(x), "y": axis(y), "series": ser, "markers": mk, "vline": vl, "band": bd})


# ---- the recorder -------------------------------------------------------------------------------


class Recorder:
    """Collects the steps of one preset run and prints them as JSON when the script ends.

    A `.viz.py` must not print anything itself: standard output carries the recording.
    """

    def __init__(self):
        self.preset = os.environ.get("VIZREC_PRESET", "")
        self._stdout = sys.stdout
        self.stdin = sys.stdin.read()
        self._lines = self.stdin.split("\n")
        self._pos = 0
        self.steps = []
        self.recorded_output = None
        self._done = False
        atexit.register(self.done)

    def readline(self):
        """Next line of the preset's stdin, without the newline (like input())."""
        if self._pos >= len(self._lines):
            raise VizrecError("preset stdin has no more lines")
        text = self._lines[self._pos]
        self._pos += 1
        return text

    def step(self, caption, **panels):
        if not caption or not caption.strip():
            raise VizrecError("every step needs a caption")
        if not panels:
            raise VizrecError("a step needs at least one panel frame")
        self.steps.append({"caption": caption.strip(), "panels": panels})

    def skip(self, caption, count, **panels):
        """A "skip ahead" step standing for `count` steps the visual does not show one by one."""
        self.step(caption, **panels)
        self.steps[-1]["skipped"] = int(count)

    def output(self, text):
        """The exact text the shown example prints on this preset (consistency check)."""
        self.recorded_output = text

    def done(self):
        if self._done:
            return
        self._done = True
        data = {"steps": self.steps}
        if self.recorded_output is not None:
            data["output"] = self.recorded_output
        self._stdout.write(json.dumps(data, ensure_ascii=False) + "\n")
        self._stdout.flush()
