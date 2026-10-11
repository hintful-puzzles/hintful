## RENAMED Requirements

- FROM: `### Requirement: The completion flash sweeps two beats over each cell's surface`
- TO: `### Requirement: The completion flash lights each cell's surface`

## MODIFIED Requirements

### Requirement: The completion flash lights each cell's surface

The completion flash SHALL sweep the board's cells. A lit cell's surface SHALL
be drawn in the shared flash color, a given's cell as a player's, so the
highlight reads in both schemes. The cursor's highlight SHALL be hidden while
the flash plays.

#### Scenario: The flash moves

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** the first lit cell is the bottom-left one, and every cell, given or
  not, is lit on some frame
