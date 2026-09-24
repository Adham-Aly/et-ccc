n = int(input())
intervals = sorted(tuple(map(int, input().split())) for _ in range(n))
merged = []
for a, b in intervals:
    if merged and a <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], b)
    else:
        merged.append([a, b])
print(len(merged), sum(b - a for a, b in merged))
