import vizrec as vz

rec = vz.Recorder()
target = int(rec.readline())
curve = [(x / 2, (x / 2) ** 2) for x in range(21)]


def frame(lo, hi, mid=None, state=None):
    markers = [(mid, mid * mid, f"{mid * mid}", state)] if mid is not None else None
    return vz.plot(
        (0, 10, "x"),
        (0, 100, "x * x"),
        [("sq", "x * x", curve, 0), ("t", f"y = {target}", [(0, target), (10, target)], 1)],
        markers=markers,
        vline=(mid, f"mid = {mid}") if mid is not None else None,
        band=(lo, hi, "search range"),
    )


lo, hi = 0, 10
rec.step(
    f"x * x only grows as x grows, so the smallest whole x with x * x ≥ {target} lies in [0, 10]. "
    "Each question halves that range.",
    p=frame(lo, hi),
)
while lo < hi:
    mid = (lo + hi) // 2
    if mid * mid >= target:
        rec.step(
            f"mid = {mid}: {mid} * {mid} = {mid * mid} is at least {target}. The answer is {mid} or "
            f"smaller, so the range becomes [{lo}, {mid}].",
            p=frame(lo, hi, mid, "done"),
        )
        hi = mid
    else:
        rec.step(
            f"mid = {mid}: {mid} * {mid} = {mid * mid} is below {target}. The answer is bigger than "
            f"{mid}, so the range becomes [{mid + 1}, {hi}].",
            p=frame(lo, hi, mid, "invalid"),
        )
        lo = mid + 1
rec.step(
    f"The range is a single value: {lo} is the smallest whole x with x * x ≥ {target}.",
    p=frame(lo, hi, lo, "path"),
)
rec.output(f"{lo}\n")
