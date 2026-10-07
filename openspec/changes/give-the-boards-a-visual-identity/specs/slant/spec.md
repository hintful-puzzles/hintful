## ADDED Requirements

### Requirement: Slant draws its squares on the collection's quiet surface

`redraw` SHALL draw every square of the grid on the collection's cell surface,
slashed or not, with the surface's thin grid line between squares: the slash is
the content, and a filled square takes no tint of its own. The ring of tiles
round the grid, which holds the border clues, SHALL stay the board's tone. A
clue SHALL be drawn on a disc of the lifted surface of a given, with its ring
and its number as before. The completion flash SHALL lift the squares to the
given's surface on its lit beats, a step that reads in both schemes.

#### Scenario: A slashed square keeps the surface

- **WHEN** a board holds a slashed square and an empty one
- **THEN** both are drawn on the same cell surface
- **AND** the slashed one holds its diagonal in ink

#### Scenario: A clue is lifted

- **WHEN** a board with a clue is drawn
- **THEN** the clue's disc is the lifted surface

## MODIFIED Requirements

### Requirement: Slant renders diagonals, clues, errors and the completion flash

`redraw` SHALL render: chessboard-colored thick diagonals (color parity
`(x^y)&1`), grid lines, corner dots where neighboring squares' diagonals
meet the tile, clue circles with parity-colored rings and ink numbers,
red error coloring for loop-edge slashes (including their corner dots) and
unmet clue circles, the cell surface under every square of the grid, the
cursor highlight, the grounded fade (per pref), and the upstream 3-phase
completion flash.
The drawstate SHALL diff a `(w+2) × (h+2)` packed `Int32Array` covering the
border ring, with the findMistakes overlay carried in the diff key (a
packed bit of the per-frame-rebuilt word).

#### Scenario: A mistake overlay repaints an unchanged tile

- **WHEN** a tile is painted, `findMistakes` flags it, and `redraw` runs
  again with no tile change
- **THEN** the second paint renders the red mistake styling

#### Scenario: Border clue circles draw

- **WHEN** a clue sits on the outer border of the point grid
- **THEN** the border-ring tile pass draws its circle and number
