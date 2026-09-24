def calls(k):
    return 1 + (calls(k - 1) + calls(k - 2) if k >= 2 else 0)


print(calls(int(input())))
