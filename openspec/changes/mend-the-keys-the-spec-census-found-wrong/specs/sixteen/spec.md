## MODIFIED Requirements

### Requirement: Ctrl or Shift with an arrow key slides the cursor's line

With the cursor showing on a square, Ctrl or Shift with an arrow key SHALL
slide that square's row or column one square the arrow's way, the tile pushed
off the end coming back at the other. Under Ctrl the cursor SHALL go with its
tile, round the grid's edge with it, and under Shift it SHALL stay where it
is. With the cursor hidden either SHALL only show it, and on an edge arrow
either SHALL do nothing.

#### Scenario: Ctrl and Right from the first column

- **WHEN** the cursor is on the first square of a row and Ctrl+Right is pressed
- **THEN** the row slides one square right and the cursor is on the second
  square, with the tile it was on

#### Scenario: Ctrl and Left from the first column

- **WHEN** the cursor is on the first square of a row of three and Ctrl+Left is
  pressed
- **THEN** the row slides one square left and the cursor is on the third
  square, where its tile came round to

#### Scenario: Right from the last column

- **WHEN** the cursor is on the last square of a row reading 4 1 3, and
  Ctrl+Right or Shift+Right is pressed
- **THEN** the row reads 3 4 1
- **AND** under Ctrl the cursor is on the first square, with the 3 it was on

#### Scenario: Down from the last row

- **WHEN** the cursor is on the last square of a column reading 4 2 5 from the
  top, and Ctrl+Down or Shift+Down is pressed
- **THEN** the column reads 5 4 2
