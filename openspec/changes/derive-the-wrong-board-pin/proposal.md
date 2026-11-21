## Why

`architectural-review-second-pass` item 8 (owner accepted every item,
2026-11-21). `warm-repaint.test.ts`'s `WRONG` pins a board and the moves
that make it wrong for each game whose seeded run never checks a wrong
board: 18 entries at `22ba4e45f`. For a game whose mistakes compare entries
with the answer, a wrong board is derivable: solve, then change one entry.
A new game of that shape should owe no pin.

## What Changes

- The guard derives a wrong board for each game on `entryMistakes` (or the
  shape the census finds), and its pin goes.
- Pins stay for games not of that shape, each with its reason.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

`src/guards/warm-repaint.test.ts`, `src/engine/testing/`.
