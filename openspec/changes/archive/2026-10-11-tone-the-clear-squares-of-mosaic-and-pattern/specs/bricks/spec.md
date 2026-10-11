## REMOVED Requirements

### Requirement: Bricks draws its board as pieces on a quiet surface

**Reason**: A ruled-out cell is no longer the plain surface with a cross: it
is the collection's clear square, a surface of its own (owner, 2026-10-11).
The requirement said no state is a fill of the whole cell, and its scenario
that the three states share one surface color.

**Migration**: "Bricks draws a shaded cell as a piece and a ruled-out one as
the clear square".

## ADDED Requirements

### Requirement: Bricks draws a shaded cell as a piece and a ruled-out one as the clear square

The board SHALL be drawn as pieces on the collection's quiet surface. A shaded
cell SHALL hold the collection's shaded piece inset on its cell, the square one,
since a cell is a square whatever its row's offset. A ruled-out cell SHALL be
the collection's clear square with its faint cross, and a clue SHALL sit on
the lifted surface of a given. No cell SHALL carry a bevel.

#### Scenario: The three states are a piece, a clear square and nothing

- **WHEN** a board holding a shaded cell, a ruled-out cell and an undecided
  cell is drawn
- **THEN** the shaded one holds a piece in the shaded color, smaller than the
  cell, on the plain surface, the ruled-out one is filled with the clear
  square's color and holds a cross in the square's faint color, and the
  undecided one is plain surface and holds nothing

#### Scenario: A clue is told from a cell the player decides

- **WHEN** a board is drawn
- **THEN** each numbered cell is the lifted surface, and no other cell is
