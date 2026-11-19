## Why

The owner, 2026-11-19, after `full-reference-lists`: with a square selected
in Crossing, tapping the one number the Numbers panel shows as fitting only
picked it up and lit every run it could go in; tapping the same number in
the list under the board wrote it in. A reference aid's `select` could only
change the `Ui`, so the panel could not make the move the list makes.

## What Changes

- `ReferenceAid.select(state, ui, key)` answers as `interpretMove` does: a
  move, `UI_UPDATE`, or `null` for nothing changed. The midend plays a move
  as the player's own, through the same path as a click (checked against the
  hint's plan, committed, undoable).
- Crossing's list click and its panel both go through one `takeNumber`, so
  a number that fits a run through the selected square is written in from
  either, and otherwise picked up.
- Dominosa, Wordguess and Wordtrail answer `UI_UPDATE` or `null` where they
  answered `true` or `false`.

## Capabilities

### Modified Capabilities

- `ts-engine`: what `select` returns, and the midend playing its move.
- `crossing`: selecting a number in the reference writes it in where it fits.

## Impact

`engine/game.ts`, `engine/midend.ts` (`playMove`, extracted from
`interpret`), the three reference games and Crossing's `numbers.ts`; their
tests; `docs/mechanics.md` § "The reference aid".
