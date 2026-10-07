## ADDED Requirements

### Requirement: Cube draws its arena as a quiet surface under a lifted solid

`redraw` SHALL draw a plain square of the arena as the collection's cell
surface and the line between two squares as the surface's grid line, so the
arena stands a step off the board and no line of it is heavier than a grid
line. A blue square SHALL keep the game's blue, inside the same grid line.

The solid SHALL be drawn as the one object on the board: a plain face on the
collection's lifted surface, a face that has picked up a square in the game's
blue, and its edges in ink.

#### Scenario: Plain squares are surface and blue squares are blue

- **WHEN** a fresh board is drawn
- **THEN** each plain square is filled with the cell surface and each blue
  square with the blue, all outlined in the surface's grid color

#### Scenario: The solid stands off the arena

- **WHEN** a fresh board is drawn
- **THEN** the solid's plain faces are filled with the lifted surface and
  outlined in ink
