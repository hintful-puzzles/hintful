# drop-the-dark-lightness-factor

Asked for by the owner, 2026-10-04: every color is defined in the engine.

## Why

`declare-bevel-pairs-in-the-game` moved the app's index-keyed dark-mode table
into each game as `Game.paletteScheme`. Two of its three fields name palette
slots. The third, `darkLightness`, was a number that adjusted a color, and its
one user was Pearl: `{ [COL_BACKGROUND]: 1.15 }`, a board 15% lighter than
every other game's in the dark scheme. That is a color decision sitting in a
game's directory.

The factor was never this project's decision. It came with the predecessor's
first dark-mode commit (`05c481fd`, "Support dark mode"), from before pieces
that are black kept an authored black.

## What Changes

- Pearl declares no `paletteScheme`. Its board is the board every game paints,
  in both schemes.
- `darkLightness` leaves `PaletteScheme`, `darkModePalette` and the guide. The
  contract names slots only: `board` and `darkSwaps`.

## Acceptance

Player-visible in one place: Pearl's board in the dark scheme is slightly
darker, the same tone as the rest of the collection. Looked at in the app
before and after; the black pearls stand clearly off it.
