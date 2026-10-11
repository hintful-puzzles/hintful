## MODIFIED Requirements

### Requirement: Unruly draws a cursor outline and a completion flash

A keyboard cursor SHALL be drawn as an outline on the focused cell. The
completion flash SHALL sweep the cells diagonally, a cell's position being its
place in the grid. A lit cell SHALL swap its surface and keep its piece: a
cell the player colored takes the lifted surface a given sits on, and a given
takes the plain one, so that every cell shows the highlight.

#### Scenario: The completion flash plays once

- **WHEN** the completion flash is on a cell that is not a given
- **THEN** `redraw` draws that cell on the lifted surface
- **AND** once the flash has left it the cell is on its own surface again, and
  is not lifted a second time

#### Scenario: The flash is on a given

- **WHEN** the completion flash is on a given
- **THEN** `redraw` draws that cell on the plain surface, with its piece
