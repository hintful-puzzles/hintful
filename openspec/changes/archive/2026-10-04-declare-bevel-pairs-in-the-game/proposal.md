# declare-bevel-pairs-in-the-game

Found by `keep-colors-apart-in-dark-mode`.

## Why

Dark mode exchanges each bevel's highlight with its lowlight, and the pairs were
written in `src/puzzle/augmentation.ts` as raw palette indices, away from the
game whose indices they are. Mines dropped a color above its bevel; its pair
went on naming the old slots, and the dark scheme drew a dark red grid from
then until 2026-10-04 with every test green.

`palette-swap-names.test.ts` read each pair back through the game's `COL_*`
constants, which caught that. It was a scan of names standing in for a
declaration: the game knows which two of its colors are a bevel, and can say
so with the constants themselves, where a moved index cannot leave the pair
behind.

The same file's `paletteOverrides` and `paletteBgIndex` were index-keyed too
(Pearl and Untangle were the two games using them), and the `ts-engine`
requirement "A game's palette index order is stable" existed only because of
this keying.

## What Changes

- `Game.paletteScheme` (`PaletteScheme` in `engine/types.ts`): `board`,
  `darkSwaps`, `darkLightness`, each optional, written with the game's own
  constants beside its palette.
- It reaches the view in `PuzzleStaticAttributes`, which already crosses the
  worker once at construction, so there is no new message. The proposal's first
  idea was `Midend.darkPalette`; that call is made only in the dark scheme, and
  the board color is needed in both.
- All three index-keyed fields moved, so `src/puzzle/augmentation.ts` is
  deleted, not only its swaps.
- `paletteOverrides` accepted `false`, a factor or a fixed OKLCH color. Only
  the factor had a user (Pearl's board), so `darkLightness` is a factor and the
  other two forms are gone.
- The declaration is of the pairs to exchange, not of every bevel: Pearl and
  Unequal have a highlight and a lowlight they do not swap, Twiddle's cursor
  slots stay out, and Slide leaves its exit's trio alone, all as before.
- `palette-swap-names.test.ts` and `palette-override-claims.test.ts` retire,
  with the comments in the render modules that the second one checked.
  `dark-palette.test.ts` gains a check on every declared pair: the lighter of
  the two in the light scheme is the lighter in the dark one.
- The index-stability requirement is removed. Nothing outside a game addresses
  its palette by number.

## Acceptance

Internal. The palettes every game paints are unchanged in both schemes:
`schemePalettes` for every registered game was dumped before and after and
the two dumps are byte-identical. The comparison was seen to differ, and the
new pair check to fail for every game, with one swap skipped.
