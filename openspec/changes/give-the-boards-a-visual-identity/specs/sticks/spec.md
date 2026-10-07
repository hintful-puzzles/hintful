## ADDED Requirements

### Requirement: Sticks draws its cells on the collection's quiet surface

`redraw` SHALL draw a white cell as the collection's cell surface, with the
collection's surface grid line between cells and a frame round the grid no
heavier than that line. A black cell SHALL be a solid block in a black that is
the same in both schemes, over its whole tile, so that adjacent black cells
read as one block, with its number in a white that is the same in both
schemes. A number on a white cell SHALL be drawn in ink. A line the player
draws keeps its color and its weight: it is the content, and the grid is not.

#### Scenario: The grid recedes behind the lines

- **WHEN** a board with a line drawn in it is painted
- **THEN** the line between two white cells is the surface's grid line
- **AND** the player's line is drawn in its own color over the cell surface

#### Scenario: A black cell is one block

- **WHEN** two black cells are adjacent
- **THEN** no grid line is drawn between them
