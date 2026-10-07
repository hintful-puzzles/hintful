## ADDED Requirements

### Requirement: Mines tells a covered square from an opened one by two flat surfaces

`redraw` SHALL draw the board with no bevel. An opened square SHALL be the
plain cell surface and a covered square the lifted surface, with the surface's
grid line between two squares and a frame round the grid no heavier than that
line, so that "covered" reads at a glance in both color schemes. A square held
down by the pointer SHALL take the opened surface until it is released. The
count digits SHALL keep their own colors, and the flag, the mine and the
too-many-flags tint SHALL be drawn on these surfaces unchanged.

The keyboard cursor SHALL be drawn at the square's edge and SHALL NOT fill it,
so the square under the cursor still shows whether it is covered. A hint's ring
and outline and a mistake's frame SHALL sit at the edge of the square's
surface. The flash on a win SHALL lift every square to the covered surface on
its lit beats, and the flash on a death SHALL fill every square in the error
color on its lit beats; the mine the player trod on SHALL keep the error color
throughout.

The game SHALL declare no palette swap for the dark scheme: neither surface is
half of a bevel.

#### Scenario: Two surfaces and no bevel

- **WHEN** a board with opened and covered squares is drawn, with no flag down
- **THEN** each opened square is a flat fill in the cell surface and each
  covered square a flat fill in the lifted surface
- **AND** nothing on the frame is a polygon

#### Scenario: The cursor leaves the square readable

- **WHEN** the keyboard cursor is on a covered square, and then on an opened one
- **THEN** each square keeps its own surface under the cursor's mark
- **AND** the square the cursor left is repainted with no trace of the mark

#### Scenario: A pressed square previews the opened surface

- **WHEN** the pointer is held down on a covered square
- **THEN** the square is drawn in the opened surface
- **AND** it returns to the covered surface when the press is released without
  opening it
