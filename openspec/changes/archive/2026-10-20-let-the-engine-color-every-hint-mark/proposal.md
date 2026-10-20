# let-the-engine-color-every-hint-mark

**Status: filed 2026-10-19 by `keep-a-repainted-mark-off-the-content-under-it`,
as the engine's**, on the owner's word that day: "aiming in general to get
rid of per-game exceptions as much as possible, and just have the engine
determine all of this sort of presentation logic".

## Why

While a hint shows, the app repaints every reference's marks in the
reference's color with an edge that reads on any content (`edgeFor` and
`edged`, `puzzle/mark-flash.ts`). What a game draws under the repaint is
still its own decision: each game's `render.ts` declares hint colors
(`COL_HINT`, `COL_HINT_EVIDENCE`, and more), and some chose them against
their own legend (`docs/hints-marks.md` § "When the game has already spent
the hint hue": Crossing's green, Galaxies' purple, Slide's orange, Samegame's
keyline). A player sees those choices only where the repaint is not drawn:
in Copy image, which takes the game's canvas, and until a step's marks are
measured. So every game carries hint-color decisions the player almost never
sees, and the export shows different colors from the screen.

## What changes

- One way for every game: the game draws its marks' shapes, and the engine
  decides their colors and edges, on the screen and in an exported image
  alike. No game declares a hint color of its own, and the section of
  `hints-marks.md` that tells a game how to pick one is retired.
- Copy image shows the marks as the screen does.

## What has to be settled

- Measure first: which games' hint colors are read by anything but their
  own frame (a test, a help page's `{{hint-marks}}` legend, a cursor that
  took a color to clear the hint's), with the query, not by reading.
- Where the colors are decided: the repaint over the game's frame, as now,
  with the export composited from both; or the game drawing its marks in
  palette entries the engine fills per reference. Weigh at dozens of games.
- What a help page's legend says once a mark's color is the reference's,
  not the game's.

## Impact

- `src/puzzle/components/view.ts`, `src/puzzle/puzzle.ts` (`copyImage`),
  `src/puzzle/mark-flash.ts`.
- Every hinting game's `render.ts` hint colors, and the tests that name them.
- `docs/hints-marks.md` § "When the game has already spent the hint hue" and
  § "The element-type color legend".
