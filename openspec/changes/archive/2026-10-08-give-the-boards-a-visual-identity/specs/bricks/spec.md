## ADDED Requirements

### Requirement: Bricks draws its shaded cells as pieces on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. A shaded cell SHALL
hold the collection's shaded piece, in its color and shape, inset on its cell;
a cell is a square whatever its row's offset, so the piece is the square one. A
cell the player has ruled out SHALL be the same surface as an undecided cell
with the collection's ruled-out dot on it, and an undecided cell SHALL be the
plain surface: no state SHALL be a fill of the whole cell or a step of gray. A
clue SHALL sit on the lifted surface of a given. The line between cells SHALL
be the surface's grid line, and no cell SHALL carry a bevel.

The keyboard cursor and both of a hint's rings SHALL be drawn in the margin a
piece leaves round itself, so none lands on a piece. A gravity mark, which
straddles the edge between two cells, SHALL carry a rim that parts it from the
pieces it overlaps.

The game SHALL name no hue: its hint sentences and its control words SHALL say
"shaded" for the one state and the collection's word for the other, and its
help page SHALL name the piece's color by placeholder and say its shape.

#### Scenario: The three states are told apart without a fill

- **WHEN** a board holding a shaded cell, a ruled-out cell and an undecided
  cell is drawn
- **THEN** all three cells have the same surface color
- **AND** the shaded one holds a piece in the shaded color, the ruled-out one a
  dot, and the undecided one nothing

#### Scenario: A clue is told from a cell the player decides

- **WHEN** a board is drawn
- **THEN** each numbered cell is the lifted surface and each other cell is the
  plain one

#### Scenario: A control names the ruled-out state by the collection's word

- **WHEN** the controls list describes the key that rules a cell out
- **THEN** it says the collection's word for a cell that is not shaded
