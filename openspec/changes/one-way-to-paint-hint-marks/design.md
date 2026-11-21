## Census (2026-11-21, at `56cd5fd80`)

Query: for each `src/games/<g>/`, which of `HintMarks`, `MarkOutlines`,
`OverlaySidecar`, `drawMarkSides` and `drawRing` its non-test `.ts` files
name (`git grep -lw <Name> -- src/games/<g> ':!*.test.ts'`), then each call
site read (`git grep -n -E 'drawMarkSides|drawRing\(|HintMarks|outlineSides'
-- 'src/games/*.ts' ':!*.test.ts'`). Shared renderers counted with their
games: `engine/edge-clue-latin/render.ts` (Adjacent, Unequal) and
`engine/mechanics/border-grid-render.ts` (Palisade, Separate, Rect).

The forms sort into four real variants:

1. **A cell's band and ring, painted after the tile loop** (`HintMarks`).
   The engine's painter already. With a gutter band and its erase: Keen,
   Solo, Group, Undead, Clusters, Samegame, Adjacent, Unequal. Inside the
   box: ABCD, Filling, Mathrax, Norinori, Rome, Salad, Seismic, Starbattle,
   Towers, Crossing; with joined pieces, Dominosa, Magnets, Tents.
2. **A cell's band and ring, painted inside its own tile**, because the
   content goes over the outline (a cross on a side, Pearl and Path) or the
   tile is the unit of repaint and animation. Every game writes this one by
   hand, and there are two shapes of it:
   - *contour*: the game computes `outlineSides` and packs it into its own
     key: Path, Pearl, Wordtrail, Rect, Tracks, Slide, Flip, Mosaic, the
     edges skeleton;
   - *a box a cell*: every evidence cell gets all four sides (`MARK_ALL`),
     so a contiguous area reads as a grid of boxes, not one area: Lightup,
     Mines, Range, Singles, Slant, Numgame, Signpost, Sticks, Boats,
     Galaxies, and the border grid (Palisade, Separate).
   The ring is hand-sized in each: `ts >> 4`, `ts / 10`, `ts >> 3`, the
   band's `inner`, a line's thickness.
3. **A mark on something that is not a cell** (a side, a span, a peg, a
   vertex, a face, a tally entry): a `drawRing` round the element's own
   box, through `edge-hint.ts` or the border grid where a side. The ring is
   the engine's already; no copy of a band.
4. **A mark on a tile that moves** (Netslide, Sixteen, Fifteen, Twiddle):
   the mark is part of the tile (`hints-marks.md` § "Marks on tiles vs
   marks on cells"); the ring is `drawRing`.

Copies of one shape are all in variant 2.

## Decisions

### D1. Variant 2's painter is `drawCellRing` beside `drawMarkSides`, with the sides from the overlay

The engine gives the in-tile form the same two things `HintMarks` gives the
after-loop form:

- **The outline is the contour**, `outlineSides`, never `MARK_ALL`. A game
  on `OverlaySidecar` reads the sides it already keys on,
  `OverlaySidecar.outlineSides(i)`; a game keying its own word packs
  `outlineSides` into it as Path does.
- **The ring is `drawCellRing(dr, band, clear, inside?)`**: round the band's
  box, as thick as the band (`ringThickness`, the rule `HintMarks` uses),
  within the band's room, centered. A game picks the band, as before, and
  no longer a ring thickness.

Two calls, not one `paintCell`, because the z-order is the game's: the
outline goes under a cross on a side (Pearl, Path, the edges skeleton) and
over a bevel (Slide), and the ring over the content.

Rejected: moving every variant-2 game to `HintMarks.paint` after the loop.
Pearl and Path need the outline under their side crosses, and a tile that
animates needs its mark in the tile.

### D2. A game whose hint bits ride its own tile word moves onto `OverlaySidecar`

Where a game folds "ringed" and "evidence" into its own flags (Singles,
Mines, Lightup, Range, Slant, Numgame, Signpost, Sticks), the contour needs
the sides in the key, and `OverlaySidecar.pack` is the engine's one way to
key them (`hints-marks.md` § "What every game does", step 4). A game whose
word already carries `outlineSides` (Path, Pearl, Wordtrail, Rect, Tracks,
Slide, the edges skeleton) keeps it: the sides come from the engine's
function either way.

### D4. An outline joins cells only within one reference

Found piloting D1 on Singles: the app repaints each reference's marks in a
color of its own (`hints-marks.md` § "The engine colors the marks"), and
`outlineSides` joined any two adjacent evidence cells, so where two
references touched, the side between them was drawn by neither and each
shape was left open. This was true of every `HintMarks` game and every
game packing `outlineSides` itself; the grid skeleton had worked round it
with `joinEvidence: () => false`.

The rule is now the engine's: two cells share an outline when exactly the
same references name them (`StepMarks.together`), so a contiguous
reference is one contour and two references, or a cell a second reference
also names, are closed shapes. `evidenceSides(words)` gives the sides;
`OverlaySidecar.pack` keys on them, and `HintMarkStyle.words` is required
so `HintMarks` joins by it, with a game's own `joinEvidence` on top. A game
packing sides into its own word moves to `evidenceSides` in task 2.1.

### D3. Kept as their own forms

- A clue or premise the step names that is not an evidence cell keeps its
  own mark where its game draws one (Lightup's ringed wall clue, Range's
  doubled shaded-premise outline, Mines' mistake frame): different roles.
- Galaxies' inset band: the cell border is where a wall lives
  (`hints-marks.md` § "Where the band goes, and who rubs it out").
