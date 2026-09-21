# bridges-hint-cites-an-unwritable-cap

**Status: scaffolded, not started.** Found 2026-09-21 by
`share-the-single-firing-driver` (its design.md § "Found on the way").

## Why

Bridges' stage-3 connectivity rung can conclude a **per-direction maximum**:
"at most one bridge east, because two would seal this group off". The player
has no way to write that down, so the hint hides the firing (no op, no
reason), but the working board keeps it: `maxh`/`maxv` narrow `possibles`, and
`islandAdjspace` reads them. A later `exactSpace` step then counts spaces on a
board the player cannot see:

> This 3 still needs one more bridge and has room for exactly one, so it must
> be drawn there.

on a board where the player sees room for two. That breaks AGENTS.md's hint
rule 6 (a hint relies only on marks the player can make).

Measured 2026-09-21 by a throwaway census (every preset × 25 seeds, 225
boards): **62 of 3,395** shown `exactSpace` steps are unsupported by the
player's view (same board, maxima reset to `maxb`, `mapUpdatePossibles`). All
62 are on boards where a hidden maximum stood, and none on a board without
one. Tricky only, the tier that has stage 3. `everyNeighbor` was checked the
same way and never disagreed. The other stage-3 premises were not checked.

Pinned board (params:desc, as the census found it; the defect is a shown
`exactSpace` step for island 5 at (0,2), clue 3, in the plan from the fresh
board):

    7x7i30e10m2d2:2e2a2a5a2a3a2g5b43i2c2a3c3

Two more: `7x7i30e10m2d2:3d2b2d4g4e5a2a3j2b3b2` (island 4 at (0,3), clue 4) and
`7x7i30e10m2d2:2e3a1a4a2a3a3g2b32d1h2a4b2a` (island 5 at (0,2), clue 3).

## The decision

This is player-facing, so the owner chooses. Rule 6 offers three shapes:

1. **Narrate the cap where it is used.** The `exactSpace` step's premise
   carries the cap's own reason: "a second bridge east would cut this group
   off, so this 3 has room for only one more". There is no new notation. The
   cost is that a stage-3 argument sits inside a stage-1 sentence, so the step
   is really a Tricky step.
2. **Give the player the notation.** A way to mark "at most N" on a span,
   which the hint places as its own step. This is the most faithful to rule 6,
   and it is new input and rendering.
3. **Stop narrating from capped boards.** The recording pass runs its rungs
   against a player-view board (maxima never kept), so a cap's consequence
   must be re-derived by a premise the player can check. This may leave some
   Tricky boards without a deduction the hint can teach, which would then need
   the tier's contract revisited.

## What changes

To be settled once the decision above is made. Whichever shape is chosen, the
census becomes a committed test in `bridges-hint.test.ts`, pinned on the descs
above: every shown step's premise holds on the player's view.
