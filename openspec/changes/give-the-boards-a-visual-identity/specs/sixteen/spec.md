## ADDED Requirements

### Requirement: A Sixteen tile stands off the board, and its arrows are Netslide's

`redraw` SHALL draw a tile's face as the collection's lifted surface inside its
bevel, so a tile is told from the board by more than its bevel in both schemes.
The tile keeps its bevel: it is an object the player moves. Color 0 stays the
board.

A slide arrow SHALL be filled as Netslide fills its own in both schemes: a
gray a step off the board, outlined in ink, which the bevel's dark-scheme swap
does not reach. The arrow the keyboard cursor is on SHALL be filled in the
collection's cursor color, and the arrow a hint names in the hint's.

#### Scenario: A tile is not the board's gray

- **WHEN** a board is drawn at rest in either scheme
- **THEN** every tile's face is the lifted surface

#### Scenario: The arrows match Netslide's in the dark scheme

- **WHEN** Sixteen and Netslide are drawn in the dark scheme
- **THEN** a plain slide arrow has the same fill in both
