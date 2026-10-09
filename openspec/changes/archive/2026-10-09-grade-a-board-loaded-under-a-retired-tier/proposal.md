# grade-a-board-loaded-under-a-retired-tier

Taken on with the owner's word (2026-10-09), from a defect that
`turn-the-specs-into-a-reference` turned up while checking a requirement
against the code.

## Why

A Bricks game ID or save written while upstream's Tricky was a tier carries the
letter `dt`. The tier is retired: it loads, and it has no name. The midend kept
such a board at the retired index, so `permitsSearch` read no name and
answered that the board permits no search. Every Bricks board that needs its
Unreasonable tier runs out of deduction under the hint (twelve of twelve dealt
on 2026-10-09), and at that point the midend threw, saying "the game has no
tier that allows trial and error", where the player should have read that the
board's difficulty allows positions that need it. A player meets it only
through an ID or a save that carries `dt`.

## What Changes

- A board loaded under a retired tier is graded as a board whose ID states no
  tier: it takes the lowest offered tier at which the game's solver solves it.
  A Bricks `dt` board becomes an Easy or an Unreasonable one, by what it needs.
- The ID the app then shows and saves for that board names the tier it took.
  The old ID still opens the same board.

## Capabilities

### Modified Capabilities

- `engine-difficulty`: "A tier with no boards is retired and still loads" says
  what tier such a board takes.

## Impact

- `src/engine/midend.ts`, `withBoardTier`. `src/games/bricks/bricks.test.ts`
  holds it for both tiers.
- Bricks is the one game with a retired tier
  (`git grep -n "retired:" -- src/games`).
