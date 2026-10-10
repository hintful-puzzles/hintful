# give-crossing-the-deduction-its-unreasonable-boards-lack

**Status: filed 2026-10-10 by the session that gave Crossing its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

**A draft since 2026-10-10, for the owner to pick.** A new deduction is
optional work in one game. Its plan is `design.md`, which was its `tasks.md`.

## Why

Crossing's solver, and its hint, ask one question of a run: which listed
numbers still fit it. They never ask the other: which runs a number still
fits. A number that fits only one run goes there, whatever else that run
could take, and a person scanning the list finds it at once ("where can 735
go? only here").

Measured 2026-10-10 on boards the solver stops short on that have exactly one
answer, which is what the Unreasonable tier deals. The count is of boards that
this one deduction, added to the two the solver has, finishes outright:

| Size | Boards | Finished with it |
| --- | --- | --- |
| 5x5 | 300 | 247 |
| 7x7 | 300 | 267 |
| 9x9 | 300 | 257 |
| 11x11 | 248 | 208 |

The instrument was a second implementation over run domains, sharing no code
with `solver.ts`. Without the deduction it finished every board the solver
finishes and none of the others (8,566 of 8,566 at 5x5, 0 of 300), so the
difference is the deduction's.

So about six Unreasonable Crossing boards in seven need no trial and error.
The hint says "nothing further follows by deduction" on them at a point where
a deduction a player can see does follow. The tier's name is a promise that
its boards need search (`docs/games/solver-and-generator.md` § "Check, Tactic,
Search"), and a rule the hint never had is a missing rung.

## What Changes

- The solver gains the deduction: a listed number that still fits exactly one
  run is that run's number.
- The hint gains its rung, with its sentence, its marks (the number boxed in
  the list, the one run striped, the runs it no longer fits shown as the
  evidence) and its help entry.
- The boards the two old deductions do not finish and the three do become a
  tier of their own, between Easy and Unreasonable, and Unreasonable keeps
  only boards the three do not finish.

## What to settle first

- **Where the boards the new deduction finishes go.** Easy is today exactly
  what upstream deals, and stays byte-for-byte upstream's while its gate is
  the two deductions. Two shapes:
  (a) a middle tier, Easy below it unchanged: three tiers, and a board dealt
  as Unreasonable today opens as the middle tier once this lands, since a
  board is graded as it loads;
  (b) Easy widens to all three: two tiers, Easy deals differ from upstream's
  from the same seed, which nothing a player holds depends on.
  Measure how often the deduction fires on a board of each kind before
  choosing, and what the middle tier's name is in
  `docs/games/solver-and-generator.md`'s tier vocabulary.
- **How rare Unreasonable becomes.** Today it is one draw in 40 to 60 up to
  9x9 and one in 1,250 at 13x13. With a seventh of those left it is one in
  about 300 at the small sizes, and its size bound
  (`MAX_UNREASONABLE_AREA` in `crossing/state.ts`) has to be measured again.
- **Whether the pair follows.** Two numbers that fit only the same two runs
  take both, and every other number leaves those runs. Measure what it
  finishes of what is left before writing it.

## Capabilities

### Modified Capabilities

- `crossing`: the solver's deductions, the tiers, what the hint explains.

## Impact

- `src/games/crossing/solver.ts`, `hint-solver.ts`, `hint-text.ts`,
  `state.ts` (tiers, bounds), `generator.ts`, the game's tests and pins,
  `help/games/crossing.md`, and the params snapshot if a tier is added.
