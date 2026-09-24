import vizrec as vz

rec = vz.Recorder()
nums = [int(t) for t in rec.readline().split()]
best = nums[0]
rec.step("The largest value seen so far is the first one.", a=vz.array(nums, states="c" + "." * (len(nums) - 1)))
for i in range(1, len(nums)):
    best = max(best, nums[i])
    states = "d" * i + "c" + "." * (len(nums) - i - 1)
    rec.step(f"The scan reaches {nums[i]}; the largest value seen so far is {best}.", a=vz.array(nums, states=states))
rec.output(f"{best}\n")
