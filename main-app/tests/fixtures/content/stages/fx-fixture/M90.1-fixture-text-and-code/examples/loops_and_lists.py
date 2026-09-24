def total_of(values):
    running = 0
    for v in values:
        running += v
    return running


def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)


numbers = [3, 1, 4, 1, 5]
print(total_of(numbers))
print(factorial(4))
