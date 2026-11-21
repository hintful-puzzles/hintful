## Why

`architectural-review-second-pass` item 8 (owner accepted every item,
2026-11-21). `warm-repaint.test.ts`'s `WRONG` pins a board and the moves
that make it wrong for each game whose seeded run never checks a wrong
board: 17 entries at `98b281e63`. A pin had to be found again by hand
whenever a change moved which board the seed dealt, and a new game of that
shape owed one.

The filing proposed deriving the wrong board for games on `entryMistakes`
only: solve, then change one entry. That needs each game to declare how it
spells an entry move, and leaves pins for the rest. The census found a
derivation that needs nothing of the game. `docs/rendering.md` already told
a porter how to find a pin: play seeded input on the run's own deal until
`findMistakes` flags the board. The guard now does that itself. Each of the
17 games reaches a mistake within 517 input events, Group the furthest
(2026-11-21).

## What Changes

- `repaintDifferential` takes a `seek` bound in place of pinned moves: it
  plays input on the deal, checking after each event, until the check finds
  a mistake.
- The guard runs a seeking run for each game that finds mistakes and whose
  seeded run checked no wrong board. `WRONG` and its census checks go.
- No game owes a pin. A game whose input reaches no mistake within
  `SEEK_EVENTS` fails.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engine-drawing`: the warm-frame comparison finds its own wrong board, and
  no game pins one.

## Impact

`src/guards/warm-repaint.test.ts`, `src/engine/testing/repaint-differential.ts`,
`docs/rendering.md`, `docs/testing.md`.
