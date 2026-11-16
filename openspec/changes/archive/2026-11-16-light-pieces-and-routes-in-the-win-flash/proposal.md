# light-pieces-and-routes-in-the-win-flash

## Why

Asked by the owner, 2026-11-16, after `draw-dominoes-in-the-engine`: fix the
Boats win flash, and have Signpost's follow the solved sequence as Tracks'
follows its track.

- Boats' flash lit squares one by one, and a boat, now one hull over its
  squares, showed it only in the slivers beside the hull.
- Dominosa's lit domino lost its numbers: white on the flash's white edge.
- Signpost's flash already ran in number order, but consecutive numbers are
  seldom neighbors, so it read as squares popping at random.

## What Changes

- **Boats** lights each boat whole, at its middle's place in the sweep, its
  hull in the flash's color; the water sweeps as before.
- **Dominosa** draws the number on a lit domino black, as a number on any
  piece of color is.
- **Signpost** draws its route while the flash runs: the lit stretch of a
  line from each number's square to the next, stopping short of their
  numbers, repainting every square the frame after.
- `engine-colors` § "A solved flash drawn as a color takes a shared color"
  allows the one recoloring the flash needs: a glyph the flash would hide.
