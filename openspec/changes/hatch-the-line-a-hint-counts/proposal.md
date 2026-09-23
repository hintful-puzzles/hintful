# hatch-the-line-a-hint-counts

## Why

Owner playtest, 2026-09-22, on Magnets: *"This reads a bit weird, saying
'column', but highlighting parts of two columns."* The step said "this column"
about the column its count was read from, while its biggest mark was an outline
of the *other* column, the met one its reason rested on. An outline of a line and
an outline of the squares a reason rests on are one mark, and the eye cannot tell
which the sentence means.

The owner proposed the fix: *"highlighting the column with some sort of partial
fill (e.g. semitransparent dashed diagonal stripes) … and outlines for the
specific magnets"*, and after trying the prototype on a phone-sized and a desktop
board: *"I love it, yes, please extend it to all games."*

The same playtest found two defects in Magnets' single-domino steps: "it touches a
−, and a + there would overfill its column" said of a square that touches a +
and whose − is what overfills, the two poles swapped whenever both facts are read
through the domino's other end; and "its column" named a line nothing marked.

## What Changes

- **A third board mark, the line hatch**: `GameDrawing.drawHatch(rect, color,
  period)`, translucent diagonal bands laid on the canvas (`engine/hatch.ts`),
  drawn after a square's background and before its content. Every drawing (the
  canvas, the recorder, the SVG view) takes its bands from one `hatchBands`.
- **One meaning per mark**: ring = decided; hatch = the one line the sentence
  names; outline = the particular squares or pieces the reason rests on, joined
  only within a piece; clue in the action color = the count read; clue in the
  evidence color = a line cited only as a reason, named by where it lies ("the
  column beside it").
- **Magnets** first: every line premise hatches its line; a single-domino step
  naming exactly one line ("its column") hatches it; a met line cited as a reason
  is its clue, not an outline; the swapped poles are fixed.
- **Every other hinting game whose sentences name a row or column** adopts the
  same marks, game by game.
- Guards: the hatch is visible on every hatching game's board in both schemes
  (`puzzle/hatch-contrast.test.ts`, which finds its population by the
  `drawHatch` call); Magnets' symbols stay legible under it; the bands form one
  pattern across tiles (`engine/hatch.test.ts`).

## Impact

- `src/engine/` (`game.ts`, `hatch.ts`), `src/puzzle/drawing.ts`, the recording
  and SVG drawings, and every hand-built `GameDrawing` test double.
- Each adopting game's `render.ts` and hint highlights.
- `docs/games/hints.md` § "Hatch the line the sentence names",
  `docs/games/engine-catalog.md`.
- Player-visible: how hints mark the board. Owner-requested and accepted on
  Magnets; each further game is checked in the app.
