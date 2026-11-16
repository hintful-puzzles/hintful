# draw-dominoes-in-the-engine

Asked by the owner, 2026-11-16, playtesting Norinori: two shaded squares
side by side should be shown as a pair, like a domino, since that is the
help's metaphor. "Please make it look more like a domino … and whatever you
choose here, please have it apply to other games like Dominosa (and
Boats?) too, managed by the engine."

## What was tried

A prototype in `add-norinori`'s session drew Norinori's two pieces as they
were (`drawPiece`, a rounded square inset on each cell) and joined them with
a bar of the piece's height from each piece's middle to the shared edge,
stopping at a region wall. The owner's verdict, with a dark-scheme
screenshot: "whatever this shape is, it's really unclear". The two rounded
squares and the bar meet in notches, so the pair reads as a lumpy blob, not
one tile. The prototype was reverted; its pairing rule is kept below.

## What a domino looks like

One tile across both squares: a rounded rectangle, rounded only at its four
outer corners, inset from the cells' outer edges as a piece is, with a thin
line across its middle where the two halves meet (a domino's divider). Each
cell paints its own half, so a tile cache repaints one square without its
neighbor: the half is the piece's rect extended to the cell's edge on the
joined side, with that side's corners square.

## What this change does

- **An engine piece that spans cells** (`engine/piece.ts`): a cell's part of
  a piece joined to its neighbors on some of its four sides, in a color,
  with the divider drawn or not. One routine, so a domino and a ship look
  alike wherever they appear.
- **Norinori** draws a shaded square whose one shaded neighbor has only it
  beside it as half of a domino (the prototype's rule: each of the two
  touches only the other; a run of three stays separate pieces, red). The
  partner's side goes in the tile key. A domino that crosses a region wall:
  decide by looking whether the wall shows through the tile or the tile
  covers it; the prototype stopped at the wall.
- **Dominosa** draws its placed dominoes with it (today its own rounded
  rects and corner circles in `dominosa/render.ts`), numbers on top. Check
  the clash color and the flash still apply.
- **Boats**: its ships are segments with round ends (`drawSegment`, upstream
  `boats_draw_ship`). With the corner radius at half the piece, the same
  routine draws a capped end; whether Boats takes it, with or without
  dividers between segments, is the owner's question ("and Boats?"): show
  them both in the browser before choosing.

## Before it starts

- Read `docs/rendering.md` for the tile cache and the piece's inset.
- Look at all three games in both color schemes, at a small and a large
  tile size: the owner's screenshot was the dark scheme.
