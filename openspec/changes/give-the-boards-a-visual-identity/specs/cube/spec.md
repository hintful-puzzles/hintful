## ADDED Requirements

### Requirement: Cube draws its arena as a quiet surface under a lifted solid

`redraw` SHALL draw a plain square of the arena as the collection's cell
surface and the line between two squares as the surface's grid line, so the
arena stands a step off the board and no line of it is heavier than a grid
line. A painted square SHALL be the collection's color for a thing the player
carries, the theme pair's first member, inside the same grid line.

The solid SHALL be drawn as the one object on the board: a plain face on the
collection's lifted surface, a face that has picked up a square in the same
color as a painted square, and its edges in ink.

#### Scenario: Plain squares are surface and painted squares are the pair's first color

- **WHEN** a fresh board is drawn
- **THEN** each plain square is filled with the cell surface and each painted
  square with the color of a thing carried, all outlined in the surface's grid
  color

#### Scenario: The solid stands off the arena

- **WHEN** a fresh board is drawn
- **THEN** the solid's plain faces are filled with the lifted surface and
  outlined in ink

## MODIFIED Requirements

### Requirement: Cube renders the solid, grid, and rolling animation

The Cube `redraw` SHALL draw the arena's grid squares (painted squares
distinguished from plain ones), the solid projected to two dimensions with its
isometric shear and back-face culling, and a roll animation interpolating the
solid's orientation from the previous square to the current one over the roll
duration. Cube fully repaints every frame (its scene is a handful of polygons)
— there is no per-tile cache and **no win flash** (upstream's `flash_length`
is 0; completion is reported only in the status bar). Cube SHALL fill its
background rect on every frame, which erases the previous one.

#### Scenario: Draw output contains grid squares and the solid

- **WHEN** `redraw` runs against a recording `GameDrawing` double for a fresh
  board
- **THEN** the recorded operations include the grid squares (with painted
  squares drawn in the paint's color) and the solid's projected polygons

#### Scenario: A roll animates between squares

- **WHEN** a roll move has just executed and `redraw` runs mid-animation
- **THEN** the solid is drawn at an interpolated orientation between its
  previous and current squares, settling exactly on the destination square at
  animation end
