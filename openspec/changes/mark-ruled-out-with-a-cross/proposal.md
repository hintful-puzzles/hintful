# mark-ruled-out-with-a-cross

Owner, 2026-10-08, on Tracks after `give-the-boards-a-visual-identity`: *"Why
did you add these squares? Also, what's the reasoning for swapping the x marks
to circles?"* Then: the cross back, the same mark for "ruled out" in every
game, and the whole square colored for a square that carries track, in place
of the brown block.

## Why

The restyle's review step changed two marks in Tracks that the owner had not
asked about. A square with no track went from a cross to the ruled-out dot of
the shading games, and a square that carries track lost its tone and gained a
brown block, which also appears on a fresh board beside every given. Neither
was put to the owner. The cross was never ambiguous; the dot it was traded
for was a mark the same restyle had introduced the day before.

The owner liked the cross, and wants one mark for "ruled out" across the
collection. A cross is also what Tracks, Loopy, Pearl and Bridges already
draw on an edge that carries nothing.

## What Changes

- **"Ruled out" is a cross in every game that has the state.**
  `drawRuledOutCross` (`engine/piece.ts`) replaces `drawRuledOutDot`: two thin
  strokes, half the cell wide. Pattern, Mosaic, Range, Bricks, Light Up,
  Subsets, Black Box and Tracks take it. This reverses the dot the owner chose
  for the five shading games on 2026-10-07, on the owner's word. Mosaic draws
  it small in the corner of a cell that has a number.
- **Tracks: a square that carries track is the track bed**, a full-cell purple
  (`TRACKS_BED`, `palette-games.ts`), with or without rails. The block is
  gone. The owner chose purple over green, yellow, teal and white on a sheet
  of the running board in both schemes, since it is the theme's hue and
  nothing else in Tracks uses it.
- **The bed is deeper than the palette's purple wash in the light scheme.**
  The wash is paler than the cell and sat beside a given's near-white surface
  as the same thing. The owner asked for the dark scheme's purple in both;
  tried in the app, black rails and the brown sleepers sink into it, so the
  light value is halfway between the two washes and the dark value is the
  dark wash.
- **The words follow**: seven help pages, the Controls verbs and the
  hint-marks legends that named a dot, and the two guides.

A player who marked cells with a dot sees a cross in the same place. Nothing a
player has saved or shared changes, and no control behaves differently.

## Capabilities

### Modified Capabilities

- `tracks`: a square's state is its surface (cell, given, bed) and a cross.
- `pattern`, `mosaic`, `range`, `bricks`, `lightup`, `subsets`, `blackbox`:
  the mark for a cell ruled out.

## Acceptance

The owner's, by eye, in both schemes.
