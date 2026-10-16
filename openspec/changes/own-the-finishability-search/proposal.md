# own-the-finishability-search

**Status: filed 2026-10-16 by `add-samegame-hint` (its task 2.4), as the
engine's.**

## Why

Two games now write the same search: "can this position still be finished?",
depth-first, with an exact memo of positions proved lost, budgeted in
positions and drawing on a request's `Allowance`, returning a
`SearchOutcome`: `exhaust` in `src/games/pegs/solver.ts` and `search` in
`src/games/samegame/solver.ts` (read 2026-10-16; re-check). Each re-derives
the same soundness rules: a key compared exactly, never hashed; a position
marked lost only when every child was searched to the end; a budget cut that
proves nothing. A third searching game would write it again.

## What changes

- An engine helper beside `search-outcome.ts` that owns the loop, the memo,
  the budget and the allowance. The game supplies its position's key, its
  moves in the order to try them, the position after a move, a finished test
  and a cheap sound "lost at a glance" cut (Pegs' frozen peg, Same Game's
  last-of-color square).
- Same Game's restarts (ties broken another way, memo shared, a last try
  with the rest of the budget) as an option of the helper, since they cure
  the heavy tail any ordered depth-first search has. Measure on Pegs whether
  they help its proof too.
- Pegs and Same Game move onto it, with their measured budgets unchanged.

## What has to be settled

- Pegs mutates one board in place and undoes; Same Game copies a board a
  child. Measure the helper both ways on Pegs' 9x9 Cross before choosing.
- Whether the "lost at a glance" cut is also the rival trap a hint leads with
  in both games, so that the hint layer can share that much too.

## Impact

- `src/engine/`: the helper and its test against brute force.
- `src/games/pegs/solver.ts`, `src/games/samegame/solver.ts`.
- `docs/hints-search.md` § "Find with one search, prove with another" names
  the helper.
