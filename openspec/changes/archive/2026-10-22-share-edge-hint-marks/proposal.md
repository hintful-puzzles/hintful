# share-edge-hint-marks

Filed by `add-path-ts-port` (archived 2026-10-21) on the owner's word, third of
four, after `share-square-edge-geometry`, whose edge numbers it keys on.

## Why

A hint that decides an edge needs a mark kind for the edge, a way to pack it
into the tile key on both squares, and a drawing. Every edge game writes all
three, and they disagree in ways a player sees:

- **Ten mark kinds for edges**, each keyed its own way: Pearl's `EDGE`
  (`sq:dir`, not canonical, so the same edge named from either side is two
  marks), Path's `EDGE` (edge number), Tracks' `PIECE` (canonicalized to R/D),
  the border grid's `EDGE` (canonicalized), Galaxies' `WALL`, Rect's `LINE`,
  Net's `SIDE`, Slant's `ALIKE`, Dominosa's `SPOT`, Loopy's `EDGE`.
- **Three looks for "the edge the step decides".** Pearl, Path and Tracks
  draw the line or cross the step asks for in the hint color; the border grid
  colors the edge whatever it asks for; Galaxies, Rect and Dominosa draw a
  bar. `docs/hints-marks.md` § "A mark on something that is not a cell" asks
  for the first.
- **Per-side hint bits packed by hand** in each renderer (Pearl's
  `H_LINE_SHIFT`/`H_CROSS_SHIFT`, Path's six bits a side with a chain ordinal,
  Tracks' `H_TRACK_SHIFT`/`H_BLOCK_SHIFT`/`H_CITED_SHIFT`, Net's ring and
  outline sides), each set on both squares by hand.
- **The chain ordinal on an edge** was placed three times before it sat
  where neither the outline nor the line covers it (`add-path-ts-port`
  design D5); no other game has one yet, and the next will meet the same.

## What changes

- **An engine `EDGE` mark kind** keyed by the square-edge number, so one edge
  is one mark however it is named.
- **An engine packer and painter for a hint on an edge**: per-side bits for
  "decides it as a line", "as a cross", "an outlined edge" (drawn thin in the
  outline's color as the line or cross it would be) and a chain ordinal, set on
  both squares, and drawn in each tile under the square's content, with the
  ordinal in Path's corner.
- **Pearl, Path and Tracks move onto it**, their narration and snapshots
  unmoved. **The border grid moves onto it too**, which changes what its hint
  draws (the asked wall or not-wall shape instead of a colored edge): that is
  player-visible in Palisade and Separate, and is put to the owner (design
  D2). Galaxies, Rect, Dominosa, Net and Slant are measured and taken on or
  declined, with reasons.

## Not in this change

Loopy's marks, on the engine's general tiling (`src/engine/grid/`), which
repaints its whole board and draws bands from the tiling.

## Impact

Engine hint-mark module(s) and tests; refactors in the games named; spec
`engine-hints` gains the requirement; `docs/hints-marks.md` § "A mark on
something that is not a cell" points at the module.
