## ADDED Requirements

### Requirement: Galaxies' win flash drops a lit cell to the plain surface

The win flash SHALL sweep the cells diagonally, and a lit cell SHALL drop its
region's fill to the plain cell surface, keeping its walls, dots and grid
lines. It SHALL not lift the cell: the lifted surface is a white dot's
finished region's own fill, so a lifted cell would show nothing on a board of
white dots.

#### Scenario: A board of white dots

- **WHEN** a board whose dots are all white is won and a frame of its flash is
  drawn
- **THEN** the lit cells are the plain surface and the others their region's
  lifted fill
