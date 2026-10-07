## ADDED Requirements

### Requirement: A Fifteen tile stands off the well it slides in

`redraw` SHALL draw a tile's face as the collection's lifted surface inside its
bevel, and the gap, with whatever a sliding tile uncovers, as the collection's
cell surface, so a tile is told from the well by more than its bevel in both
schemes. The tile keeps its bevel: it is an object the player moves. Color 0
stays the board.

#### Scenario: A tile is not the board's gray

- **WHEN** a board is drawn at rest in either scheme
- **THEN** every tile's face is the lifted surface
- **AND** the gap is the cell surface, darker than the board around the grid
