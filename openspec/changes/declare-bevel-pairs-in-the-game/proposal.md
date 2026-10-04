# declare-bevel-pairs-in-the-game

**Status: scaffolded, not started (2026-10-04).** Found by
`keep-colors-apart-in-dark-mode`.

## Why

Dark mode exchanges each bevel's highlight with its lowlight, and the pairs are
written in `src/puzzle/augmentation.ts` as raw palette indices, away from the
game whose indices they are. Mines dropped a color above its bevel; its pair
went on naming the old slots, and the dark scheme drew a dark red grid from
then until 2026-10-04 with every test green.

`palette-swap-names.test.ts` now reads each pair back through the game's
`COL_*` constants, which catches that. It is a scan of names standing in for a
declaration: the game knows which two of its colors are a bevel, and could say
so with the constants themselves, where a moved index cannot leave the pair
behind.

The same file's `paletteOverrides` and `paletteBgIndex` are index-keyed too
(Pearl and Untangle are the two games using them), and the `ts-engine`
requirement "A game's palette index order is stable" exists only because of
this keying.

## What Changes

To be designed. The shape to try first: the game declares its pairs beside its
palette, by constant, and the app is sent them the way it is already sent the
authored dark values (`Midend.darkPalette`, across the worker). Then
`paletteSwaps` leaves `augmentation.ts`, the name scan retires, and the
index-stability requirement is re-read against what is left.

One thing to settle before designing: a game that uses its bevel highlight as
a cursor or a selection does not swap it today, so the declaration is of the
pairs to exchange, not of every bevel.

## Acceptance

Internal. The dark palettes every game paints are unchanged, held by comparing
`schemePalettes` before and after.
