## ADDED Requirements

### Requirement: Solo draws its digits on a quiet surface, with a given's cell lifted

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, and every cell holding a given digit on the collection's lifted
surface of a given, so that a given is told by the cell under it as well as by
its ink. The line between two cells of one block SHALL be the collection's
surface grid line. A block's boundary and the frame round the grid, which is
the boundary of the blocks along it, SHALL stay in ink, and so SHALL nothing
else that is content: a killer cage's outline and sum keep their own color.

On an X board the two main diagonals SHALL be drawn as a stroke in the surface
grid line's color from corner to corner of each cell on them, under the cell's
digit and pencil marks, and SHALL NOT be told by a shade of the cell's surface.

The selection's wash and its pencil-mode corner SHALL be drawn over whichever
surface the cell has. The hint's marks SHALL stay in the gutter at the cell's
edge.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with given digits is drawn
- **THEN** each given's cell is the lifted surface
- **AND** every other cell is the cell surface

#### Scenario: Only a block's boundary is heavy

- **WHEN** a board is drawn
- **THEN** the line between two cells of one block is the surface grid line
- **AND** the line between two blocks, and the frame, are ink

## MODIFIED Requirements

### Requirement: Solo renders blocks, cages, diagonals, digits, pencil marks, and overlays

`redraw` SHALL draw the grid with thick sub-block boundaries derived from the block
partition (so rectangular and jigsaw-irregular blocks use the same pass), the
killer cage dashes and cage-sum labels (at each cage's top-left-most cell) when
`killer`, the two diagonals stroked through their cells when `xtype`, given
digits distinct from player digits, an auto-sized grid of pencil marks per empty
cell, the cursor and pencil-mode highlights, live rule-violation errors, the
Check & Save mistake overlay, and a completion flash. A CapsLock-style
pencil-mode indicator SHALL be shown while persistent pencil mode is on. The
palette SHALL keep the upstream color enum's indices, with the fork's own
colors appended past it. Rendering SHALL use a per-tile diff cache keyed on an
`Int32Array`, with every overlay that is not part of the tile value (the mistake
overlay) included in the diff key so it repaints on an already-drawn cell.

#### Scenario: Variant decorations are drawn

- **WHEN** a jigsaw, killer, or X board is rendered to a recording drawing
- **THEN** a jigsaw board draws block boundaries along the irregular partition
- **AND** a killer board draws the cage-sum label at each cage and dashed cage
  outlines
- **AND** an X board strokes the two main diagonals through their cells

#### Scenario: Mistake overlay repaints on an already-drawn cell

- **WHEN** a cell is drawn, then `findMistakes` flags it, then the board is
  redrawn against the same draw state
- **THEN** the mistake highlight is painted on the second redraw
