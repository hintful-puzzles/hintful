## MODIFIED Requirements

### Requirement: A slide is animated, and completion flashes outward

A slide SHALL be animated by offsetting the moving line, drawing the wrapping
tile in its off-grid position for the duration. The completion flash SHALL
spread from the source along the wires: a tile's position SHALL be its
distance from the source in tiles along the connections, through the wrap of a
wrapping board and never through a barrier.

#### Scenario: A slide is animated

- **WHEN** a frame is captured partway through a row slide
- **THEN** that row's tiles are drawn offset from their grid positions and the
  tile wrapping around is also drawn beyond the far edge

#### Scenario: A neighbor the wires do not join

- **WHEN** a board is won and a tile beside the source has no wire into it
- **THEN** it lights when the highlight has traveled the wires that do reach
  it, later than the tiles the source is wired to

### Requirement: The completion flash lifts the tiles

The completion flash SHALL fill a tile's face with the flash color while the
highlight is on it, and the tile SHALL keep its wires.

#### Scenario: The flash lifts the tiles

- **WHEN** a frame of the completion flash is drawn
- **THEN** the tiles the highlight is on have a face in the flash color, and
  every other tile the cell surface
