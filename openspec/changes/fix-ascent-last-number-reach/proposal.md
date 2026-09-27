# fix-ascent-last-number-reach

## Why

Upstream's Ascent rungs stop one short of the last number on the path. Reach
never measures it from the number below it, `overlap` never narrows it or ties
the number before it to it, and a placement leaves it a candidate in the square
just filled. So "49 must sit next to 48", the plainest deduction in the game,
was one no rung made. A board could need a harder tier than a player does, and
the generator's tier gate then labeled it one tier too high.

`add-ascent-hint` found it: the hint had to patch its own reading to avoid a
Hard step on a Tricky board, and that patch was the solver's defect showing
through. The owner approved changing existing boards (2026-09-27).

## What changes

1. The four bounds in `solver.ts` include the last number
   (`solverPlace`, `solverProximitySimple`, `solverProximityFull`,
   `solverOverlap`).
2. The hint's own patch (`reachLast`) is deleted, since the rungs it projects
   now make the deduction.
3. Rung-level tests, each seen failing with its fix reverted.

**Player-visible:** some boards generated from a seed change, because the tier
gate now rejects boards that were really a tier easier. Descriptions already
shared stay valid and solvable; only their label could have been generous.
