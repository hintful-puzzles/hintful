## ADDED Requirements

### Requirement: Galaxies draws its cells on the collection's quiet surface

`redraw` SHALL draw a cell that belongs to no finished region as the
collection's cell surface, with the collection's surface grid line between
cells. The edges the player draws and the border of the board keep their
weight and their ink: they are the content, and the grid is not. A locally
valid region of a white dot SHALL be filled with the collection's lifted
surface, which is brighter than the cell surface in both schemes; this is the
fill the rendering requirement calls the dot's color for a white dot.

#### Scenario: A finished region stands off the cells around it in both schemes

- **WHEN** a region symmetric about its single white dot is closed
- **THEN** its cells are filled with the lifted surface
- **AND** the cells around it are the cell surface

#### Scenario: Edges are stronger than the grid

- **WHEN** the player draws an edge
- **THEN** it is drawn in ink, heavier than the grid line beside it
