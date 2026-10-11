## ADDED Requirements

### Requirement: Galaxies' win flash sweeps the cells

The win flash SHALL sweep the cells diagonally. A lit cell SHALL be filled
with the flash color in place of its region's fill, in a white dot's region
and a black dot's alike, and SHALL keep its walls, dots and grid lines.

#### Scenario: A cell in a black dot's region

- **WHEN** the flash is on a cell of a black dot's finished region
- **THEN** the cell is the flash color, and its grid lines are the quiet ones
  a white region's cell has, not the ink a black fill needs
