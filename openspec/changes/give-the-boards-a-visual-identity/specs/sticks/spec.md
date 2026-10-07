## ADDED Requirements

### Requirement: Sticks draws its cells on the collection's quiet surface

`redraw` SHALL draw an open cell as the collection's cell surface, with the
collection's surface grid line between cells and a frame round the grid no
heavier than that line. A block SHALL be a solid fill in the collection's wall
color, over its whole tile, so that adjacent blocks read as one mass, with its
number in a white that is the same in both schemes. A number on an open cell
SHALL be drawn in ink. A line the player draws SHALL be drawn at its
own weight in the collection's color for a placed piece, the theme pair's first
member: it is the content, and the grid is not. The keyboard cursor SHALL be
the collection's cursor color. The hint's evidence ring on a block
SHALL carry a line in the number's white inside it, so the ring is told from
the block in both schemes. The game's words (its hint, its help page and its
Custom dialog) SHALL call the cell a block, never a black cell.

#### Scenario: The grid recedes behind the lines

- **WHEN** a board with a line drawn in it is painted
- **THEN** the line between two open cells is the surface's grid line
- **AND** the player's line is drawn in its own color over the cell surface

#### Scenario: Adjacent blocks are one mass

- **WHEN** two blocks are adjacent
- **THEN** no grid line is drawn between them
