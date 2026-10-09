## MODIFIED Requirements

### Requirement: The fleet display fits the canvas for every legal fleet

The boats drawn beneath the board SHALL lie entirely within the width the game
reports for its canvas, for every fleet configuration parameter validation
admits. Rows SHALL break between whole batches of one boat size, and also
within a batch that is too wide for a row. The canvas SHALL be as wide as the
board and its column of numbers, or as the fleet's longest boat where that is
wider, because one boat has no break to take.

#### Scenario: A fleet wider than one row wraps instead of overflowing

- **WHEN** the fleet holds more boats of one size than fit across the board
- **THEN** that batch wraps onto a further row, every boat is drawn inside the
  canvas width, and the reported canvas is tall enough for the extra row

#### Scenario: A row's last boat would end past the column of numbers

- **WHEN** three one-square boats and two two-square boats are drawn beneath a
  board five squares wide
- **THEN** the two two-square boats start a new row together, since the batch
  breaks before its first boat where the whole of it does not fit

#### Scenario: A boat longer than the board is wide

- **WHEN** a nine-square boat is drawn beneath a board two squares wide and
  nine tall
- **THEN** the reported canvas is wider than the board and its numbers, and
  the whole boat is drawn inside it

### Requirement: A fleet whose batches fit is laid out by the batch rule alone

Wherever breaking rows only between whole batches keeps every boat
inside the canvas width, the layout SHALL be identical to the one that rule
alone gives.

#### Scenario: A fleet that already fitted is laid out unchanged

- **WHEN** a fleet whose every batch fits within a row is drawn
- **THEN** each size's boats stay together on one row, positioned as the
  batch-only rule places them
