import vizrec as vz

rec = vz.Recorder()
depth = int(rec.readline())
# Wrong on purpose: ids count calls in order, so "c2" sits under a different parent per preset.
count = [0]


def chain(k):
    cid = f"c{count[0]}"
    count[0] += 1
    kids = [chain(k - 1), chain(k - 2)] if k >= 2 else []
    return vz.node(cid, f"f({k})", children=kids)


rec.step("The whole call tree for this input, drawn at once.", t=vz.tree(chain(depth)))
rec.output(f"{count[0]}\n")
