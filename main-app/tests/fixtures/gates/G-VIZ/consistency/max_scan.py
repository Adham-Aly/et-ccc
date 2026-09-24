nums = [int(t) for t in input().split()]
best = nums[0]
for x in nums:
    best = max(best, x)
print(best + 1)
