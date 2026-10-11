## RENAMED Requirements

- FROM: `### Requirement: A genuine Fifteen completion flashes for two frames`
- TO: `### Requirement: A genuine Fifteen completion sweeps the tiles`

## MODIFIED Requirements

### Requirement: A genuine Fifteen completion sweeps the tiles

A genuine completion's flash SHALL sweep the tiles diagonally, a tile's
position being its cell's place in the grid. A lit tile's face SHALL drop to
the well's surface, with its bevel and its number drawn as on any other frame:
a tile is the lifted surface already, and neither bevel color stands off it in
both color schemes. The gap SHALL never be lit.

#### Scenario: The last slide flashes

- **WHEN** the player's slide puts the last tile in order and frames of the
  flash are drawn from start to end
- **THEN** the first tile lit is the bottom-left one, every tile is lit at some
  frame, and the gap in the bottom-right corner stays the well
