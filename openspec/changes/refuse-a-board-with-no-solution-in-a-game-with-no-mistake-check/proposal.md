# refuse-a-board-with-no-solution-in-a-game-with-no-mistake-check

**Status: filed 2026-10-10 by the session that archived
`refuse-a-board-an-untiered-solver-cannot-finish`, which found it while
sorting the untiered games. What it says of the code was true that day;
re-check before relying on it. Read in the code and not run in the app.**

## Why

A game ID nobody's generator wrote can open a board that has no solution, in
a game whose own solver can prove it has none.

- `answerVerdict` in `src/engine/desc-error.ts` asks a game's `solve` about a
  board only where the game has `findMistakes`, since the rule it was written
  for is that a mistake check needs exactly one answer. A proof that a board
  has no answer at all does not depend on a mistake check, and three games
  that have none can give one: Flip (`shortestAnswer` is linear algebra over
  the presses), Slide (its search is exhaustive) and Untangle (the planarity
  test). Each returns `NO_SOLUTION` from `solve`.
- So such a board loads. In Flip the hint then says "This puzzle's solution
  can't be determined." and Show solution says "This puzzle has no solution."
  The player has been handed a board that cannot be finished and is told so
  only on asking.
- `engine-params`, "A board with a mistake check loads only with exactly one
  answer", is true as written. What is missing is the rule for a game
  without one.

It is reached only through a hand-written game ID or a save holding one.

## What Changes

- A board whose game's `solve` proves it has no solution is refused at load
  with `DESC_CONTRADICTORY`, whether or not the game checks mistakes.
- The population is derived first: every registered game with a `solve` and
  no `findMistakes`, and what its `solve` can say of the opening position.

## What to settle first

- **Cost.** `solve` would run on every pasted ID and every opened save. Slide's
  is a breadth-first search that took 30 s to deal one board
  (`desc-error-games.test.ts`, on the cap), so asking it at load may not be
  affordable, and a save must not take seconds to open. Measure `solve` on
  each game's largest preset before deciding which games are asked.
- **Whether `solve(state, state)` at the opening is the right question** for a
  game whose `solve` reads `aux` (Untangle, Netslide): a pasted ID has none.

## Capabilities

### Modified Capabilities

- `engine-params`: the answer verdict for a game with no mistake check.

## Impact

- `src/engine/desc-error.ts`, and a test beside
  `src/engine/untiered-load.test.ts`.
