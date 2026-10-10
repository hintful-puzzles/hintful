# give-mosaic-the-deduction-its-unreasonable-boards-lack

**Status: filed 2026-10-10 by the session that gave Mosaic its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

**A draft since 2026-10-10, for the owner to pick.** A new deduction is
optional work in one game. Its plan is `design.md`, which was its `tasks.md`.

## Why

Mosaic's solver, and its hint, have one rule and apply it to one number at a
time: a number that has its shaded squares clears the rest of its block, and
a number that needs every square it has left shades them. They never compare
two numbers. Two numbers whose blocks overlap differ by what lies outside the
overlap: if the first still needs as many more shaded squares than the second
as it has undecided squares the second does not share, those squares are all
shaded and the second's unshared ones are all clear. It is the standard next
step of this puzzle (Fill-a-Pix), and a person sees it in a 3 beside a 0 or a
6 beside a 9 on the edge.

Measured 2026-10-10 on boards the Unreasonable tier deals: one answer, the
rule stops short. The count is of boards that this comparison, added to the
rule, finishes outright:

| Board | Boards | Finished with it |
| --- | --- | --- |
| 3x3, 3x4, 4x4, 3x12 | 150 | 150 |
| 5x5 | 40 | 36 |
| 10x10 | 40 | 34 |
| 15x15 | 16 | 11 |
| 25x25 | 6 | 5 |
| 10x10, not aggressive | 30 | 30 |
| 25x25, not aggressive | 6 | 6 |

The instrument was a second implementation that shares no code with
`solver.ts`. With the comparison off it finished every Easy board dealt and
none of the Unreasonable ones (288 of 288, 0 of 288), so the difference is
the comparison's.

So most Unreasonable Mosaic boards need no trial and error, and without
aggressive generation none seen does. The hint says "nothing further follows
by deduction" on them where a deduction a player can see does follow. The
tier's name is a promise that its boards need search
(`docs/games/solver-and-generator.md` § "Check, Tactic, Search"), and a rule
the hint never had is a missing rung.

## What Changes

- The solver gains the comparison of two numbers whose blocks overlap.
- The hint gains its rung, with its sentence, its marks (both numbers and
  their blocks, the squares only one of them counts ringed) and its help
  entry.
- The boards the rule does not finish and the two together do become a tier
  of their own, between Easy and Unreasonable, or widen Easy; Unreasonable
  keeps only boards the two do not finish.

## What to settle first

- **Where the boards the comparison finishes go.** Easy is today exactly what
  upstream deals. (a) A middle tier, Easy unchanged: a board dealt as
  Unreasonable today opens as the middle tier once this lands, since a board
  is graded as it loads. (b) Easy widens: its deals differ from upstream's
  from the same seed, which nothing a player holds depends on.
- **What Unreasonable is without aggressive generation.** Hiding stops there
  at the first clue whose loss stops the rule (`unreasonableClues` in
  `mosaic/solver.ts`), and the comparison finished all 36 such boards. It has
  to stop at the first clue whose loss stops both, and be timed again at
  50x50 and 100x100.
- **Which pairs a player can be asked to see.** The measurement compared any
  two numbers within two squares of each other, diagonals included. Count
  what side-by-side pairs alone finish before narrating the rest.

## Capabilities

### Modified Capabilities

- `mosaic`: the solver's deductions, the tiers, what the hint explains.

## Impact

- `src/games/mosaic/solver.ts`, `hint.ts`, `hint-text.ts`, `hint-marks.ts`,
  `state.ts` (tiers, bounds), the game's tests and pins,
  `help/games/mosaic.md`, and the params snapshot if a tier is added.
