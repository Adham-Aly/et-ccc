def total(values):
    result = 0
    for v in values:
        result += v
    return result


def countdown(n):
    if n == 0:
        return [0]
    return [n] + countdown(n - 1)


nums = [4, 1, 3]
same = nums
same.append(2)
print(total(nums))
k = int(input())
print(countdown(k))
