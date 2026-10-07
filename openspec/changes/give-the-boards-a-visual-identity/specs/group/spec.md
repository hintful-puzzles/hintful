## ADDED Requirements

### Requirement: Group draws its table on a quiet surface, with a given's cell lifted

`redraw` SHALL draw every cell of the table the player fills on the
collection's cell surface, and every cell holding a given element on the
collection's lifted surface of a given, so that a given is told by the cell
under it as well as by its ink. The line between cells and the frame round the
table SHALL be the collection's surface grid line, the frame no heavier than
the line. A subgroup divider is the player's own mark and SHALL stay in ink.
The legend stays on the board, outside the surface.

The leading diagonal SHALL be drawn as a stroke in the surface grid line's
color from corner to corner of each cell on it, under the cell's element and
pencil marks, and SHALL NOT be told by a shade of the cell's surface.

The selection's wash and its pencil-mode corner SHALL be drawn over whichever
surface the cell has. The hint's marks SHALL stay at the cell's edge.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with given elements is drawn
- **THEN** each given's cell is the lifted surface
- **AND** every other cell of the table is the cell surface

#### Scenario: Only a divider is heavy

- **WHEN** a board with one subgroup divider is drawn
- **THEN** the divider is ink
- **AND** every other line of the table, and its frame, is the surface grid
  line

## MODIFIED Requirements

### Requirement: Group input, gameplay aids and rendering

Group SHALL be played with mouse and keyboard: selecting a cell and typing an
element letter or number fills it, right-click selects a cell for pencil marks,
and a diagonal drag from a selected cell fills a whole diagonal at once. Filling
a cell SHALL be idempotent, and setting an immutable cell to the value it already
holds SHALL be permitted so a multifill need not detour around it.

Group SHALL provide two structural gameplay aids: dragging a row or column header
SHALL reposition that element's entire row and column so a player can group a
subgroup with its cosets, and dropping a divider between two adjacent elements
SHALL mark a boundary, cleared automatically when those two elements are dragged
apart. Group SHALL provide `findMistakes`, since the puzzle is uniquely solvable,
so Check & Save applies.

Rendering SHALL draw the element legend along the top and left, stroke the
leading diagonal through its cells, draw dividers as edges in ink against the
quiet grid, lay out pencil marks in a grid, highlight the selection, annotate
Latin duplicates and associativity failures in the error color, and flash on
completion.

#### Scenario: A diagonal multifill sets several cells at once

- **WHEN** a cell is selected and the pointer is dragged diagonally to another
  cell, then an element is entered
- **THEN** every cell along that diagonal is set to the element, skipping any
  immutable cell that already holds it

#### Scenario: Reordering rows carries its divider correctly

- **WHEN** a row header is dragged to a new position such that a divider's two
  bordering elements are no longer adjacent
- **THEN** the affected divider is removed

#### Scenario: A completed valid table wins

- **WHEN** every cell is filled so the grid is Latin and associative
- **THEN** the game is reported solved and flashes
