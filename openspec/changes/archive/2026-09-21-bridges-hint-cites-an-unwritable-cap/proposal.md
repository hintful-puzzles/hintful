# bridges-hint-cites-an-unwritable-cap

**Status: implemented (shape 2, the owner's choice).** Found 2026-09-21 by
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

Measured 2026-09-21 by a throwaway census: every preset × 200 seeds (1,800
boards) plus the three pinned descs, walking each board's whole plan from
empty. For every shown step the census rebuilt the board as the player sees it
(the same bridges, crosses and marks, maxima reset to `maxb`,
`mapUpdatePossibles`) and re-ran that step's premise there: stage 1 and 2 by
re-running the rung on the step's island and comparing the reason and the ops,
stage 3 by re-running the one trial the step names.

| premise | shown | unsupported on the player's view |
| --- | ---: | ---: |
| `exactSpace` | 27,011 | 426 |
| `everyNeighbor` | 6,184 | 0 |
| `needsThisWay` | 2,355 | **419** |
| `wouldSealGroup` | 204 | 0 |
| `wouldStarve` | 43 | 0 |
| `mustReachOut` | 42 | 9 |

It is not an edge case: **477 of the 603 Tricky boards** show at least one
unsupported step. Every unsupported step stood on a board holding a hidden
maximum, and not one of the steps on an uncapped board was flagged, which is the
instrument's negative control. Easy and Normal never set a maximum, so they are
untouched. The scaffold's first count (62 `exactSpace` steps on 225 boards)
checked only two premises; `needsThisWay` is the larger half.

Confirmed in the app (Chrome, 2026-09-21) on the first pinned board, following
the hint from empty: step 8 says of the top-right 2 *"This 2 can take at most
1 bridge from its other neighbors, so one must run this way"*, while the
other neighbor it outlines is the top-left 2 across an empty row, where the
player can draw a double bridge. The unstated reason is the cap: a double
bridge would seal the two 2s off as a finished pair.

Pinned boards (params:desc), with the unsupported shown steps of the plan from
empty:

    7x7i30e10m2d2:2e2a2a5a2a3a2g5b43i2c2a3c3
      step 7  needsThisWay, the 2 at (0,0)
      step 8  needsThisWay, the 2 at (6,0)
      step 11 exactSpace,   the 3 at (0,2)
    7x7i30e10m2d2:3d2b2d4g4e5a2a3j2b3b2
      step 8  exactSpace,   the 4 at (0,3)
    7x7i30e10m2d2:2e3a1a4a2a3a3g2b32d1h2a4b2a
      step 12 exactSpace,   the 3 at (0,2)

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

What each costs, measured on the census above:

- **Shape 3 is the dearest.** With the maximum rung disabled, the ladder
  leaves **153 of 603** Tricky boards (25%) unsolved, against 0 with it (the
  control). Those boards would need either a hint that stops partway, or a
  generator that grades without maxima, which changes every Tricky board and
  makes the tier easier.
- **Shape 2 is smaller than it sounds.** Every shipped preset has `maxb` 2, so
  the only maximum a shipped board can hold is "at most one bridge here". That
  is one more mark state on a span, beside the no-bridge cross. It needs a
  gesture, a drawing, a move op, a help paragraph and the hint step that places
  it ("two bridges here would shut these 2 islands off, so at most one can run
  this way"). A custom board with `maxb` 3 or 4 would need "at most 2" and
  "at most 3" as well.
- **Shape 1 adds no input, but the sentences grow.** A step leaning on a cap has
  to carry the cap's own seal-or-starve argument inside its counting sentence,
  and one step can lean on more than one cap. It also turns a Normal-looking
  step into a Tricky one without saying so.

## What changes

The owner chose shape 2. Bridges gains a player-writable limit on a span ("at
most N bridges", drawn `≤N`), set by the secondary drag, which now lowers the
limit one step at a time down to the cross (touch reaches it by the held-finger
drag that already drew the cross). The hint writes a stage-3 limit as a step of
its own, `findMistakes` flags a wrong limit or cross, and
`bridges-hint.test.ts` holds every shown step to the player's board. Details in
design.md.
