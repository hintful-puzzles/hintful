# answer-a-deal-with-no-board-in-the-engine

**Status: filed 2026-10-10 on the owner's word, by the session that closed
`deal-or-refuse-stretched-unreasonable-rectangles`. What it says of the code
was true that day; re-check before relying on it.**

## Why

What happens when a size has no board, or a rare one, is decided a game at a
time, by measuring that game. The owner (2026-10-10) wants it decided once,
in the engine, and the per-game work to stop:

> everything I've been pushing towards over the last while has been to get
> rid of per-game work as much as possible, in favor of a stronger engine

Two things are written per game today, and each was the subject of a run of
changes.

- **A retry bound sized to the game.** A generator that deals again until a
  board is good counts its tries with `retryLimit`, and where the house bound
  of 10,000 was wrong for it the game sizes its own, from a measurement:
  Rectangles' `MAX_UNREASONABLE_SQUARES_DRAWN`, Bridges' `ISLAND_BUDGET`,
  Map's `retryBudget`, Group's. The population is every call that passes
  `retryLimit` a second argument under `src/games/`
  (`git grep -n "retryLimit(" -- src/games`).
- **A refusal table in `validateParams`**, with `noSuchTier` or
  `tooRareToDeal`, the tests that pin its cells (`describeAbsentTiers`,
  `describeDealtTiers`) and a census behind it. Thirty games hold one
  (`git grep -lE "tooRareToDeal|noSuchTier" -- src/games`).

What the engine has already: a generator that runs its bound out is answered
with a sentence and the board in play stays (`generate` in
`src/engine/deal.ts`, `dealGaveUp`); the next board is dealt ahead in a second
worker; a player can stop a deal they are waiting for. So a size with no
board costs a player one wait and a true sentence, with nothing written in
the game, provided the wait is short. It is the wait that is per-game: a
bound in tries is a twentieth of a second in one game and two minutes in
another, which is why each game sized its own.

**What the per-game route cost, measured 2026-10-10.** The tier added to
twelve games that day filed seven changes named `bound-<game>-to-the-boards-it-deals`
and then one more from one of those. Four of the seven were done, a session
each: none refused a size for its wait, and each became a faster generator,
mostly for sizes past the menu. Three were withdrawn unstarted (the commit that added
this file removed them; `git log --diff-filter=D --name-only` has their
measurements). The eighth, on stretched Unreasonable Rectangles boards,
measured for an hour and found no rule to refuse by
(`openspec/changes/archive/`, `deal-or-refuse-stretched-unreasonable-rectangles`,
`design.md`).

## What Changes

- **The engine bounds a deal in one unit, the same in every game**, so that a
  generator which finds no board is answered after a wait that does not
  depend on the game or the size. A game's generator states no budget of its
  own for the whole deal.
- **The per-game budgets for a whole deal go**, where the engine's bound
  makes them idle.
- **The guide stops asking for a census.** `docs/games/solver-and-generator.md`
  § "A size that cannot carry a tier" was given its new first rule on
  2026-10-10 and still carries, below it, the method for sizing a bound and
  timing the cells beside a refusal. It is rewritten around the engine's
  bound.
- **The refusals that exist stay** unless task 1 finds a reason to move them:
  they are true, tested, and answer at once. No new one is added by this
  change.

## What to settle first

- **The unit.** Wall-clock time is the same in every game with nothing
  measured, and a deal already runs in a worker. Against it: a test that
  calls `newDesc` must not give up for a loaded machine, so a deadline has to
  be armed only by the app's deal (`generate`, or the deal worker) and never
  by a generator called directly; and a board is a function of its seed, so a
  deadline may end a deal and may never change which board a deal that ends
  returns. Counted work (squares drawn, solver calls) is deterministic and is
  what the games size today, a game at a time. Decide by trying the deadline
  on the three games whose budgets were hardest to size (Rectangles
  Unreasonable at 5x13 with an expansion factor of 2, which finds a board
  once in 44,000 draws and is allowed 123,000, so about one deal in sixteen
  runs out; Map; Bridges).
- **How long.** The guide's line for a deal a player waits for is half a
  minute a board on average. A run-out is a wait with nothing at the end, and
  a player can stop it.
- **Where the bound is read.** `retryLimit` is the one guard every
  deal-again loop calls, and the gate holds every such loop to it
  (`src/engine/retry-bound.test.ts`), so a deadline read there reaches every
  generator with no line in any.
- **Whether a count stays as well**, as the guard against a loop that never
  ends where no deadline is armed (tests). It does: see the head of
  `src/engine/retry-limit.ts`.

## Capabilities

### Modified Capabilities

- `engine-difficulty`: the deal's deadline, the count a direct call keeps, and
  what a count on a retry loop means; the requirements on a rare tier, on a
  run-out's answer and on the shared retry limit.
- `abcd`, `salad`, `crossing`, `filling`, `pattern`: each loses the
  requirement, or the sentence, that sized its generator's retry cap.

## Impact

- `src/engine/retry-limit.ts`, `src/engine/deal.ts`, the deal worker under
  `src/puzzle/`, and each generator whose own budget goes.
- No board a seed deals today changes, and no ID stops opening.
