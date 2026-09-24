import vizrec as vz

rec = vz.Recorder()
n = int(rec.readline())
calls = {}
order = []
active = []


def build(cid):
    c = calls[cid]
    kids = [build(k) for k in c["kids"]]
    if cid in active:
        state = "current" if cid == active[-1] else None  # waiting for a child: drawn plain
    else:
        state = "done"
    note = f"= {c['value']}" if c["value"] is not None else None
    return vz.node(cid, f"f({c['n']})", children=kids, state=state, note=note, edge=state)


def show(caption):
    rec.step(caption, t=vz.tree(build("r")))


def fib(k, parent=None, side=""):
    # Ids name the call's position (r, rL, rLR, ...), so an id means the same place in every
    # step and every preset: TreeViz lays out the union of all of them.
    cid = "r" if parent is None else parent + side
    order.append(cid)
    calls[cid] = {"n": k, "kids": [], "value": None}
    if parent is not None:
        calls[parent]["kids"].append(cid)
    active.append(cid)
    if k < 2:
        show(f"`f({k})` is a base case: it returns `{k}` straight away, with no further calls.")
        value = k
    else:
        show(f"`f({k})` needs `f({k - 1})` and `f({k - 2})`, so it calls `f({k - 1})` first and waits.")
        a = fib(k - 1, cid, "L")
        show(f"`f({k - 1})` handed back `{a}`. `f({k})` now calls `f({k - 2})`.")
        b = fib(k - 2, cid, "R")
        value = a + b
    calls[cid]["value"] = value
    active.pop()
    if k >= 2:
        show(f"`f({k})` adds the two answers, `{a} + {b}`, and returns `{value}`.")
    return value


answer = fib(n)
show(
    f"Every call has returned: `f({n}) = {answer}`. The tree made {len(order)} calls, and some, "
    "like `f(1)`, were made more than once."
)
rec.output(f"{answer}\n")
