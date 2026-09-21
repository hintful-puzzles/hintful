# bridges-teaches-sealing-off-at-normal

## Why

The owner met a board whose hint stopped short and pointed at a deduction it
never made: "1s that have two options, one of them being another 1". Bridging
two 1s finishes both into a pair cut off from the rest, so the 1 must bridge the
other way. Upstream grades that as stage 3, Tricky only. Asked where it belongs,
the owner: *"This seems conceptually easy to me, but if it fits better with
normal, that's ok too. Up to you."*

## What changes

Normal gains a rung, `stage2-sealing`: block a first bridge that would seal
the island and its neighbor off as a finished group. It sits beside the loop
rule, the other Normal rule about the shape of the network. Easy stays pure
arithmetic on one island's count and room, which is why the rule goes to Normal
rather than Easy. The rest of stage 3 (the "at most" limits, a starved island,
filling every other direction) stays Tricky.

Which boards each tier deals changes: Normal may now need sealing off, and a
Tricky board is rejected as too easy if Normal with sealing solves it.

With one bridge per line no limit can exist, and Tricky then has almost nothing
a Normal board could not need. Measured with the rung in place: generating a
Tricky board with `maxb` 1 gave up on 3 of 4 seeds at 7x7 and 10x10 and 2 of 4
at 15x15, where every other size and bridge limit took milliseconds. So Custom
refuses Tricky at `maxb` 1, as a generation-only bound (an existing board still
opens). No shipped preset is affected: all have `maxb` 2.
