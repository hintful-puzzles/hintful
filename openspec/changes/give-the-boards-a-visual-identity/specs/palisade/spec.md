## ADDED Requirements

### Requirement: Palisade draws its cells on the collection's quiet surface

`redraw` SHALL draw every cell's body on the collection's cell surface. A cell
that holds a clue SHALL sit on the lifted surface of a given, so the clues the
puzzle fixed are told by the cell under them, with the digit in ink. The edges
keep their own roles and strengths, since they are what the player draws: a
wall in ink, an edge ruled out and an edge undecided each in its own color.

A completed correct region SHALL shade whole, its clue cells included, in the
shared completed-region color derived from the cell surface. The solved flash
SHALL lift every cell to the given's surface on its lit beats, a step that
reads in both schemes.

#### Scenario: A clue is told by the cell under it

- **WHEN** an untouched board is drawn
- **THEN** every cell holding a clue is the lifted surface
- **AND** every other cell is the plain cell surface

#### Scenario: The edges keep their three colors

- **WHEN** a board holds a wall, an edge ruled out and an edge undecided
- **THEN** each is drawn in its own color, as before the surface was applied
