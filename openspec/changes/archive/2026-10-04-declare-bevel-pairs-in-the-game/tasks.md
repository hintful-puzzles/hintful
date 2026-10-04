## 1. Design

- [x] 1.1 Where the declaration lives on `Game`, and how it reaches the view:
      `Game.paletteScheme`, sent in `PuzzleStaticAttributes`.

## 2. Move

- [x] 2.1 Each game with a `paletteSwaps` entry declares its pairs by constant.
- [x] 2.2 `paletteSwaps` leaves `augmentation.ts`; `palette-swap-names.test.ts`
      retires.
- [x] 2.3 The same question asked of `paletteOverrides` and `paletteBgIndex`:
      both move to the game, `augmentation.ts` is deleted, and
      `palette-override-claims.test.ts` retires with the comments it checked.
- [x] 2.4 `docs/games/rendering.md` says how to declare a scheme and that the
      palette's order is the game's own.

## 3. Verify

- [x] 3.1 Every game's dark palette is unchanged.
- [x] 3.2 The new pair check and the palette comparison were each seen to fail.
