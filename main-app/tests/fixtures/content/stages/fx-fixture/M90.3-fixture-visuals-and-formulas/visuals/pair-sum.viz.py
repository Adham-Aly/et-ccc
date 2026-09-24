import vizrec as vz

rec = vz.Recorder()
n, target = map(int, rec.readline().split())
values = list(map(int, rec.readline().split()))
out = set()


def frame(lo, hi, found=False, compare=None):
    states = []
    for i in range(n):
        if found and i in (lo, hi):
            states.append("path")
        elif i in (lo, hi):
            states.append("current")
        elif i in out:
            states.append("done")
        else:
            states.append("unvisited")
    return vz.array(
        values,
        states=states,
        pointers=[("lo", lo, "above", True), ("hi", hi, "above", True)],
        compare=compare,
        name="values",
    )


lo, hi = 0, n - 1
rec.step(
    f"The list is sorted. lo starts at the smallest value and hi at the largest; "
    f"the goal is a pair that adds up to {target}.",
    a=frame(lo, hi),
)
answer = "none"
while lo < hi:
    total = values[lo] + values[hi]
    sign = "=" if total == target else ("<" if total < target else ">")
    cmp_ = (lo, hi, f"{values[lo]} + {values[hi]} = {total} {sign} {target}")
    if total == target:
        answer = f"{lo} {hi}"
        rec.step(
            f"{values[lo]} + {values[hi]} is exactly {target}: the pair is at indices {lo} and {hi}.",
            a=frame(lo, hi, found=True, compare=cmp_),
        )
        break
    if total < target:
        rec.step(
            f"{values[lo]} + {values[hi]} = {total} is too small. Every partner of {values[lo]} is at "
            f"most {values[hi]}, so {values[lo]} can never reach {target}: lo moves right.",
            a=frame(lo, hi, compare=cmp_),
        )
        out.add(lo)
        lo += 1
    else:
        rec.step(
            f"{values[lo]} + {values[hi]} = {total} is too big. Every partner of {values[hi]} is at "
            f"least {values[lo]}, so {values[hi]} is always too big: hi moves left.",
            a=frame(lo, hi, compare=cmp_),
        )
        out.add(hi)
        hi -= 1
if answer == "none":
    rec.step(
        f"lo and hi have met, so every pair has been ruled out: no two values add up to {target}.",
        a=frame(lo, hi),
    )
rec.output(f"{answer}\n")
