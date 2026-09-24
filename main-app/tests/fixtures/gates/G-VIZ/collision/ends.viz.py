import vizrec as vz

rec = vz.Recorder()
nums = [int(t) for t in rec.readline().split()]
# Wrong on purpose: two long pointer names on neighbouring cells print over each other.
rec.step(
    "The pointers `left_end` and `right_end` start on neighbouring cells.",
    a=vz.array(nums, pointers={"left_end": 0, "right_end": 1}),
)
rec.output(f"{nums[0] + nums[-1]}\n")
