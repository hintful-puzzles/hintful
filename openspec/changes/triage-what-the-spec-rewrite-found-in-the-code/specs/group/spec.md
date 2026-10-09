## MODIFIED Requirements

### Requirement: A diagonal drag fills a whole diagonal at once

A diagonal drag from a cell selected for entry SHALL extend the selection
along that diagonal, and an element entered then SHALL fill every cell of it
at once. With pencil mode on a drag SHALL select no run, and a mark goes in
the one cell. Filling a cell SHALL be idempotent. Setting an immutable cell to
the value it already holds SHALL be permitted, so a multifill need not detour
around it: such a cell is part of the move and is left as it was. An immutable
cell on the diagonal that holds any other element SHALL refuse the whole
entry.

#### Scenario: A diagonal multifill sets several cells at once

- **WHEN** a cell is selected and the pointer is dragged diagonally to another
  cell, then an element is entered
- **THEN** every cell along that diagonal holds the element, an immutable cell
  that already held it included

#### Scenario: A given of another element lies on the diagonal

- **WHEN** the selected diagonal crosses a given cell holding `b`, and `c` is
  entered
- **THEN** no cell changes and no move is made

#### Scenario: A drag from a cell selected for pencil marks

- **WHEN** a cell is selected with the right button and the pointer is dragged
  diagonally, then an element is entered
- **THEN** only the selected cell takes the mark
