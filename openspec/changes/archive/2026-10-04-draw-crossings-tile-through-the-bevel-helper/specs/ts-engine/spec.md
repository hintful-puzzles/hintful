## MODIFIED Requirements

### Requirement: The engine provides a shared raised-bevel drawing helper

The engine SHALL provide `drawRaisedTile(dr, body, tileSize, face, highlight, lowlight)` in
`src/engine/draw.ts`, where `body` is the rectangle of pixels the tile covers.
It SHALL draw the raised block over `body` — a bottom-right lowlight triangle
and a top-left highlight triangle, lowlight first, in one canonical winding —
and then `face` over the middle, inset by `raisedBevelWidth(tileSize)` on all
four sides. Games that draw a raised tile SHALL call this helper instead of
re-deriving the triangles or the inset locally. A game whose tile keeps a grid
line SHALL pass the box inside the line as `body`, so the border is the same
width on every side.

The engine SHALL provide `raisedBevelWidth(tileSize)`, returning
`max(1, floor(tileSize / 16))`. The `max(1, …)` floor is normative: without it
the inset reaches zero at small tile sizes and the face covers both triangles,
so the bevel disappears rather than thinning.

The engine SHALL also provide `drawRaisedBevel(dr, bounds, highlight, lowlight)`,
the two triangles alone over a pixel box (`{ left, top, right, bottom }`, edges
inclusive), for a relief that has no face of its own.

#### Scenario: A raised-tile game draws its bevel through the helper

- **WHEN** a game with a raised tile (e.g. Fifteen, Sixteen, Mines, Inertia,
  Sokoban, Crossing) draws a tile
- **THEN** it calls `drawRaisedTile` with that tile's own body, its face color
  and its highlight/lowlight colors
- **AND** it computes no bevel width or inner rectangle of its own

#### Scenario: A tile inside a grid line has a border on every side

- **WHEN** `drawRaisedTile` is called with a body one pixel short of the tile
  size in each direction, at any tile size
- **THEN** the face leaves `raisedBevelWidth(tileSize)` pixels of bevel on the
  left, top, right and bottom alike
- **AND** that width is at least one

#### Scenario: A pressed-in tile swaps the two colors

- **WHEN** a game draws a tile that reads as pressed in (Crossing's walls, and
  its selected digit)
- **THEN** it calls the same helper with the highlight and lowlight exchanged

#### Scenario: A game whose bevel is not two triangles keeps its own

- **WHEN** a game draws a beveled shape that is not the two-triangle block —
  Twiddle's four trapezoids meeting a center point, each taking its own
  cursor-highlight color and rotating during its animation
- **THEN** it SHALL NOT be expressed through this helper, and keeps its own
  drawing code

#### Scenario: No game re-derives the bevel

- **WHEN** each game's sample frames are read for a bevel by shape — two
  polygons drawn one after the other that split one box along its diagonal —
  and the game's calls to the shared helpers are counted while those frames
  are drawn
- **THEN** every game draws exactly as many two-triangle bevels as it made
  calls to `drawRaisedTile` and `drawRaisedBevel`
- **AND** exactly as many two-pentagon bevels as it made calls to
  `drawRecessedBorder`
- **AND** the guard fails if it found no game drawing a bevel or no call to a
  helper, so it cannot pass by reading nothing
