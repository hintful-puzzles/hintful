# continue-ladder-hints

Filed 2026-10-21 on the owner's word, from a Path hint that drew the 2's and
the 3's first edges and then went to the 4: "We should have engine machinery
to have hints work in chains before progressing to an unrelated one."

## Why

The machinery existed: `HintFrontier` (`src/engine/hint-frontier.ts`) takes,
among the firings a plan could make, the one continuing from its latest
steps. But only the candidate-notes plan (`candidate-plan.ts`) and Map used
it. Every game whose hint runs the deduction ladder through `deduceHintPlan`
takes, at each step, the first firing its scan meets, so its plan wanders
across the board. That is 27 games today (`git grep -l deduceHintPlan
src/games`); nine of them drive the ladder with `singleFirings`, the rest with
a `next` of their own.

Path's session (2026-10-21) gave the ladder the frontier: a technique may
declare `available()`, every firing it could make with what it reads and
writes, and `singleFirings({ continuing: true })` takes the firing that
continues. Path and the grid skeleton are on it, and Path's plan now finishes
the line it is on (`path-hint.test.ts`, "finishes the line it is working on").
The other 26 are not.

## What changes

- **Every `deduceHintPlan` game moves onto `continuing`**: each rung declares
  `available()`, keyed on what the game's player follows (a cell, a clue, a
  region, a line's number; Path's choice and why are in `engine-catalog.md` §
  "`hint-frontier.ts` — which available firing a plan takes next"). A game whose `next` is its own moves onto
  `singleFirings` first, or says why it cannot.
- **A cross-game measure of continuity for ladder plans**, beside the one
  `hint-frontier.test.ts` keeps for candidate plans: jumps a plan made where a
  continuing firing was available. Its population is derived from the games
  that set `continuing`, and a game on `deduceHintPlan` without it is listed
  until it moves.
- **Each game's hint pins and plan tests re-baselined and read**: a plan's
  order is what changes, and each changed sentence or pin is checked against
  the board as the order now has it.

## Not in this change

The candidate-notes games and Map, which already continue.

## Impact

The 26 games' `solver.ts`/`hint.ts`; a guard beside `hint-frontier.test.ts`;
`docs/hints.md` § "The shared plan loop: deduceHintPlan". Player-visible: the
order hints come in, in every one of those games, which is the owner's ask.
