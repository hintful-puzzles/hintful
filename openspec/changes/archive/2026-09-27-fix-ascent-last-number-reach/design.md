# fix-ascent-last-number-reach — design

## D1. What moved, measured

Scratch census, 2026-09-27, grading each board at the lowest tier the solver
finishes it, before and after the fix:

- **The 22 frozen upstream boards above Easy**: 7 already fall to a lower tier
  (upstream never gated tiers), and still 7 after. None moved.
- **150 boards the shipped generator dealt before the fix** (7x7; square, no
  diagonals, hexagon, hidden ends and Edges; 10 seeds per tier): 0 graded lower
  before; after, **2 of the 50 labeled Normal are Easy**. None of the Tricky or
  Hard ones moved.

So the dishonesty was real and small, and it sits at the bottom of the ladder,
where `proximity-simple` now makes the one-step version of the deduction.

## D2. What replaces the oracle

Byte-parity with upstream is released, and nothing pinned these rungs to it: the
ladder-equivalence test compares the runner with the hand-written ladder, which
calls the same rung functions, and the frozen differential asks only that each
upstream board still solves at its tier, which a stronger solver cannot break.
Both pass unedited, so neither is evidence for the fix. What is:

- `ascent.test.ts` § "ascent treats the last number like any other" reads a
  board with the last number blanked and asserts each rung narrows it. Each of
  the four fixes, reverted alone, turns it red.
- "ascent difficulty tiers bind" still holds every generated board to exactly
  its tier, now against the honest solver.
- The hint's tests hold every step to its board's tier with the hint's patch
  gone, including the pinned Tricky board that needed it.

The second half of the `overlap` fix, tying the number before the last to the
last's candidates, has no probe of its own; the loop bound beside it does.
