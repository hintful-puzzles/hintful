## MODIFIED Requirements

### Requirement: Unruly draws a cursor outline and a completion flash

A keyboard cursor SHALL be drawn as an outline on the focused cell. The
completion flash SHALL sweep the cells diagonally, a cell's position being its
place in the grid, and a lit cell SHALL be filled with the flash color and
keep its piece, a given as any other cell.

#### Scenario: The completion flash plays once

- **WHEN** the completion flash is on a cell
- **THEN** `redraw` fills that cell with the flash color, under its piece
- **AND** once the flash has left it the cell is on its own surface again, and
  is not lit a second time
