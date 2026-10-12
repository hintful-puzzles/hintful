# add-starbattle

**Status: built 2026-10-13 and waiting for the owner to play it** (§
"Acceptance"). It is the measurement of `fit-a-new-game-in-one-session`,
written from the skeleton, the guides, the one command, the spec rule and
the region division the five changes before it left. `design.md` holds what
was decided and measured, and `findings.md` the log.

## Why

The owner asked for Star Battle by name (2026-10-12): a square grid divided
into regions, in which the player places stars so that every row, every
column and every region holds exactly the same number, and no two stars
touch, even at a corner. With one star to a unit it is the puzzle LinkedIn
publishes as Queens. A plain account of the rules and the usual techniques:
<https://starbattle.online/blog/how-to-play-star-battle/>.

It is not upstream's and has no C to read. It is a square grid of cells the
player marks, solved by deduction: the kind the skeleton is written for.

## This is also the measurement

The goal is a game written whole in one session of under a million tokens
(`docs/doctrine.md` § "The goal"). So the session that writes this:

- **does it in one session**, and if it cannot, stops at the point the
  budget ran out and says what was left;
- **keeps a log, as it goes, of every question it had to answer that was
  not about Star Battle**: which helper, which of two ways, where a thing
  goes, what a guard wanted. Each line is a thing the engine or the index
  should have answered;
- **records its tokens by phase** (reading, state and rules, solver,
  generator, input and drawing, hint, tests, spec and help, verification
  and the gate), as well as it can be told.

The log goes in this change as `findings.md`, and orders the engine work
after it.

## What Changes

- A new game `starbattle`, cataloged as Star Battle, with its solver,
  generator, hint, `findMistakes`, help page, spec and icons.
- **Parameters**: the grid's size, the stars to a unit (one is Queens), and
  a difficulty.
- **Regions**: as many as the grid is wide, of unequal sizes, taken from the
  engine's division (`own-region-division-in-the-engine`) with Star Battle's
  rule: no region holds more stars than the board's number. The game writes
  no division of its own. That change is archived, and its `design.md` §
  "How Star Battle says its rule" has the call (`growFromSeeds` on the stars,
  then `mergeToCount`), how often it is met (86% of tries at 8x8 with two
  stars, 61% at 14x14 with three, measured 2026-10-12) and what it left for
  this change to measure: the spread of region sizes, which a rule that
  holds a size as well can narrow.
- **Marks**: a star and a cross for "no star here", the cross being the
  player's own notation and the hint's.
- **Deductions**, each a named rung that grades and narrates: a unit with
  as many open cells as it still needs stars; a unit that has its stars; the
  cells around a star; a set of units whose stars must all lie in a set of
  other units of the same count, which empties the rest of those; a cell
  whose star would leave some unit too few cells. Which tier each sits at
  is the design's, measured on dealt boards.

## Capabilities

### New Capabilities

- `starbattle`

## Impact

`src/games/starbattle/`, `src/games/index.ts`, `src/puzzle/catalog-data.ts`,
`help/games/starbattle.md`, two icons. An engine helper the game shows to be
missing is filed, not written here.

## Acceptance

The owner's, in the running app: the game is player-visible work they asked
for by name.
