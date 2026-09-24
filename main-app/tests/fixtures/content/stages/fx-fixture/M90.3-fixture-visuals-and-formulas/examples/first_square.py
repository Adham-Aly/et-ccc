target = int(input())
lo, hi = 0, 10
while lo < hi:
    mid = (lo + hi) // 2
    if mid * mid >= target:
        hi = mid
    else:
        lo = mid + 1
print(lo)
