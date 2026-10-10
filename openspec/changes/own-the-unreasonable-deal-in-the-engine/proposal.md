# own-the-unreasonable-deal-in-the-engine

**Status: filed 2026-10-10 on the owner's word, by the session that closed
`deal-or-refuse-stretched-unreasonable-rectangles`. What it says of the code
was true that day; re-check before relying on it.**

## Why

Twelve games gained an Unreasonable tier on 2026-10-10
(`add-an-unreasonable-tier-to-the-untiered-deductive-games`). The engine took
the search that counts a board's answers, the tier's contract, its params
item and the check that the hint finishes a board
(`src/engine/answer-search.ts`, `hint-finishes.ts`, `redivide.ts`). Each game
kept a generator for the tier, and between the commit before that work and
the end of the day the games' own code grew by about 4,900 lines outside
tests against the engine's 480
(`git diff --shortstat 2030eeff edf30bf6 -- src/games ':!*test*'`, and the
same for `src/engine`).

Two of those generators were read on 2026-10-10 and have one shape. Sticks
(`unreasonableBoard` in `sticks/generator.ts`): draw a full board, strip
clues while the search still says one answer, keep the board if the solver
does not finish it. Rectangles (`unreasonableBoard` in `rect/generator.ts`):
draw a division, move numbers until the search says one answer, keep the
board if neither the solver nor the hint finishes it. The other ten were not
read. If they share it, the loop is the engine's and a game supplies what is
about its puzzle: how a candidate is drawn, and how one is changed toward a
single answer.

Per the doctrine (`AGENTS.md`, "Where several games write the same thing, the
framework should own it"), and the owner's direction that day: per-game work
gives way to a stronger engine.

## What Changes

- The engine owns the deal of an Unreasonable board: the loop, its bound, the
  test that the search says one answer, and the test that deduction and the
  hint stop short. A game supplies its draw and, where it has one, its step
  toward a single answer.
- Each game's generator for the tier shrinks to those, or the change records
  why that game's does not fit, in a sentence.
- A game that gains the tier later writes the two functions and nothing else.

## What to settle first

- **Whether the twelve share a shape.** Read every one before designing:
  `git grep -nE "function unreasonable" -- src/games`, and Pattern, Mosaic,
  Crossing and Range, whose generators are not named that way. Tabulate, for
  each: what is drawn, what is changed and how the change is chosen (strip a
  clue, move a number, redraw a region), what the keep test is, and what its
  bounds are. The engine takes what at least most of them share. A game that
  differs for a reason about its puzzle keeps its own, and says why.
- **Whether the boards move.** A shared loop may draw from the random stream
  in another order, which changes the board a seed deals. That breaks nothing
  a player holds (`AGENTS.md`, "The app hands out boards, never seeds"), and
  it retires any fixture pinned to a seed, which is a cost to count first.
- **The cost of asking whether the hint finishes a board.** Two changes
  measured it growing with the square of the board, in Rectangles
  (`rungsFinish`, since made cheaper) and in Net (`finishes` in
  `net/deduce.ts`: 0.24 s a deal at 20x20, 4.6 s at 40x40, 46 s at 70x70,
  measured 2026-10-10 at Easy). `hintFinishes` in the engine replays the hint
  a step at a time. Measure it on three games, and if the cost is in the
  replay and not in the game, fix it there, once.

## Capabilities

### Modified Capabilities

- `engine-difficulty`: "An Unreasonable tier is the one exemption from the
  narratable policy" and the requirements beside it, for what the engine
  deals and what a game supplies.
- A game's own capability only where its spec describes the loop that moves.

## Impact

- `src/engine/answer-search.ts`, and the generators of the twelve games.
- `docs/games/solver-and-generator.md` § "Giving a deductive game an
  Unreasonable tier", and `docs/games/engine-catalog.md`.
