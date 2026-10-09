# close-the-solver-hint-gap-in-filling

**Status: filed 2026-10-10 by the session that archived
`refuse-a-board-an-untiered-solver-cannot-finish`, whose census of dealt
boards found it. What it says of the code was true that day; re-check before
relying on it. Measured by calling the game's own functions; the crash was
not reproduced in the app.**

## Why

Filling deals boards its own hint cannot finish: 14 of 6,688 dealt at 7x9 and
9x13, about one in 480 (measured 2026-10-10). On such a board the hint gives
correct steps, then returns the deduction-exhausted refusal with squares
still empty, and `Midend.computeHintPlan` throws on that refusal from a game
with no tier that allows search, which is the "Something went wrong" dialog.

- **Two such boards:** `7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b`, where
  the hint stops after 15 steps with 12 squares empty, and
  `9x13:3d6c2b84664d8a6a8838b9a48b9g6a49a77b6b777c3c244d4b473d1a4a8c77a7c4c38c5c52b2`,
  after 32 steps with 26 empty. No step either plan gives is wrong.
- **The cause is that the solver is not monotone in what is filled in.**
  `solveFilling` finishes both boards from their clues. `deduceHintPlan`
  (`src/games/filling/solver.ts`) builds a fresh `FillingSolver` from the
  working board at every step, and from the half-filled board the hint
  reaches, the same solver stalls. Its doc comment says a correct partial is
  a superset of the clues "from which the deductions still complete the
  board", and that is what is false. Which technique loses its footing is
  not known: `learnBitmapDeductions`, the one that infers a region with no
  clued square, is the first place to look, since it reads only the board
  and so cannot tell a clue from a square a region grew into.
- **The generator asks the solver, not the hint.** `generator.ts` keeps a
  board when `solveFilling` solves it.

Because of this, Filling's `finishesByDeduction` asks its solver alone and
not `hintAndSolveFinish`, with a comment saying why. The other eight games
that took the shared test refused none of their dealt boards.

## What Changes

- Filling's hint finishes every board its solver does, so no dealt board runs
  its hint out. Preferred, by `docs/games/solver-and-generator.md` ("one
  deduction engine, so the hint knows what the solver does"): find the
  deduction the restarted solver loses and make the hint keep it, as
  `close-the-solver-hint-gap-in-net-and-rect` did, by tracing.
- Filling's `finishesByDeduction` becomes `hintAndSolveFinish`, and its
  generator deals only boards the hint finishes.
- If some boards cannot be closed, refusing them at load is a compatibility
  break for a player holding one, and is the owner's call with the rate
  stated.

## Capabilities

### Modified Capabilities

- `filling`: what its hint finishes, and what loads.

## Impact

- `src/games/filling/solver.ts`, `generator.ts`, `index.ts`, their tests, and
  the Filling entry of `src/engine/untiered-load.test.ts`.
