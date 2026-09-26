# Postmortem: flipping a mirrored Untangle cluster, withdrawn after measurement

**Date:** 2026-09-26
**Status:** Withdrawn. `unflip-a-mirrored-untangle-cluster` is deleted; no code
from it shipped.
**Came from:** `shorten-the-untangle-endgame` design D8, "What is left".

## TL;DR

The change assumed that the 25-point walks thrash because a whole cluster of
about ten points is drawn as the mirror image of how it must sit, and that
reflecting that cluster as one journey would finish the board. Its first task
was to check that claim before building on it. The claim does not survive
measurement, and a working build of the idea did not move the average. With a
few seconds per request and the termination rule waived, it still did not.

## What was measured

The same 25-point population as D8 (seeds `eg-25-0` … `eg-25-7`, even ones
from the generator's circle with `aux`, odd ones scattered at random),
following whole plans as the app does, against the hint at `d1e1109f`. The
baseline reproduced exactly: **47.4 moves** on average.

**1. The wrong-order set is not one mirrored cluster.** At every request with
30 or fewer crossings, each point of degree 3 or more was classified against
the solved layout as in order, in mirror order, or neither. On the thrashing
stretches the board splits three ways, for example 9 / 11 / 4 or 7 / 16 / 2 on
a 25-point board. The two orientations are often near-even, and 2–13 points
match neither. That is not "a cluster of ten against the rest". It is two
halves joined through points that are tangled locally, or hinged on parts of a
graph that is not 3-connected (the caveat D3 and D8 already raised).

**2. Reflecting the mirrored piece in place rarely helps.** Each connected
piece of mirror-order points, with and without its tangled and degree ≤ 2
neighbors, was reflected across 16 lines through its center and slid back
inside the frame. At most positions no reflection lowered the crossing count.
The best single case went from 15 crossings to 1.

**3. Reflecting and then running the culprit search does not pay once the
hint's gaps are enforced.** An unchecked probe first suggested it would: at
many stuck positions, a reflection followed by `planEndgame` finished the
board. Those hits came from reflections that left points on or beside lines,
because that probe checked no clearance. Built into `planEndgame` with the
hint's point and line gaps:

| variant | flips tried | culprit search placed | clear at full gaps | avg moves |
|---|---|---|---|---|
| 40k spots per flip, 200k per request | 1,712 | 3 | 0 | 47.4 |
| 200k per flip, unlimited per request | 1,657 | 33 | 21 | 47.1 |
| same, first-leg rule waived | 1,625 | 11 | 2 | 47.0 |
| same, wider pieces | 2,947 | 111 | 3 | 47.1 |
| same, crowded reflected points made culprits | 2,947 | 45 | 5 | 47.8 |

In the second row, 20 of the 21 clear flips were then refused by the
termination rule, because no leg of the journey could go first and cut
crossings. The third row waives that rule to see what it was costing. The last four rows cost 0.3–3.6 s per request against the 300 ms bar, and
waiving the first-leg rule gives up the termination argument. Neither is
shippable, and even so the average did not move.

## Why

A reflection keeps every crossing inside the piece and every crossing outside
it. Only the lines between the piece and the rest change. So a flip helps only
when the piece meets the rest through a few points in the right places, which
is what 3-connectedness would give and these graphs mostly lack. Where the
graph hinges instead, "mirrored" is often a legitimate alternative embedding,
and flipping it moves the tangle rather than removing it. The reflected points
also land in space the rest of the board already uses, so most flips fail the
clearance check before the culprit search can finish.

## What would reopen it

A cluster that is *proved* to have to flip, not one that merely disagrees in
neighbor order: for example, the 3-connected components from an SPQR tree
(D3's "principled tool"), restricted to components whose separation pair sits
at the cluster's boundary. Also a placement for the reflected piece that is
searched rather than fixed at its old center. Both are significant new
machinery, and this measurement gives no reason to expect a return large
enough to pay for them. Re-measure against the population above before
proposing either.
