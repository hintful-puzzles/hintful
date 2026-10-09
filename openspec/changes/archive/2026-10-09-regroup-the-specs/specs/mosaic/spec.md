## MODIFIED Requirements

### Requirement: Mosaic's size limits

A board narrower or shorter than 3 SHALL be refused. `validateParams` SHALL
refuse a board of more than 10000 tiles.

#### Scenario: Invalid params are rejected

- **WHEN** the params of a 2×3 board, or of a board of 101×100 cells, are
  checked
- **THEN** each is refused with a non-null error string
- **AND** a 3×3 board and a 100×100 board are accepted

### Requirement: Mosaic hides the clues a board does not need

Once a generated board is solvable, `newDesc` SHALL hide every clue whose
deduction never narrowed anything. In aggressive mode it SHALL additionally
try hiding each remaining clue and SHALL revert any hide
that makes the board unsolvable.

#### Scenario: An aggressive board still solves

- **WHEN** a board is generated with aggressive generation on
- **THEN** the deductive solver solves it from the clues left showing

### Requirement: Mosaic flags a satisfied clue and a contradicted one

A clue SHALL be flagged `SOLVED` when it is exactly satisfied with no cell of
its neighborhood unmarked, and `ERROR` when it is overcommitted, with more
cells marked than the clue or too few cells left that could be. The flags and
the count of clues left SHALL follow the marks.

#### Scenario: A satisfied clue grays out and a contradicted clue reddens

- **WHEN** a clue's neighborhood is fully determined with exactly the clue's
  count marked
- **THEN** the clue carries the `SOLVED` flag (drawn gray)
- **AND** when more cells are marked around a clue than its value, it carries
  the `ERROR` flag (drawn red)
