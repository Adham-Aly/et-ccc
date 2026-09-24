n, target = map(int, input().split())
values = list(map(int, input().split()))
lo, hi = 0, n - 1
answer = "none"
while lo < hi:
    total = values[lo] + values[hi]
    if total == target:
        answer = f"{lo} {hi}"
        break
    if total < target:
        lo += 1
    else:
        hi -= 1
print(answer)
