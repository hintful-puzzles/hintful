## ADDED Requirements

### Requirement: A wall-list letter is a run of open borders and the wall that ends it

In a description's wall list a number SHALL be that many walls in a row, a
letter `a` to `y` a run of 1 to 25 borders with no wall followed by one wall,
and `z` 26 borders with no wall and none after them. The wall a final letter
ends on MAY fall past the end of the list. In the clue list a letter SHALL be a
run of empty cells, `a` for 1 to `z` for 26, and a digit `1` to `9` one given.

#### Scenario: The 4×4 description 1a6df3,f1h1

- **WHEN** `1a6df3,f1h1` is read for a 4×4 board
- **THEN** its wall list covers the board's 24 borders: one wall, an open
  border and a wall, six walls, four open borders and a wall, six open borders
  and a wall, then three walls
- **AND** its clue list is six empty cells, a 1, eight empty cells and a 1, so
  the givens are the third cell of the second row and the last cell

#### Scenario: A run past the end of the list

- **WHEN** the wall list of `1a6df3,f1h1` is replaced by `z`, 26 open borders
  on a board that has 24
- **THEN** the description is refused with "This game ID is too long for its
  board."

### Requirement: Seismic's game ID writes Tectonic as T and the difficulty as de or dh

After `{w}x{h}` the params SHALL write `T` in Tectonic mode and nothing in
Seismic mode, and then the difficulty, `de` for Easy or `dh` for Normal, in the
full encoding only. A string with no `T` SHALL decode as Seismic mode, and one
with no `d` as Easy. A `d` followed by any other letter, or by none, SHALL be
refused with "Difficulty must be one of Easy, Normal."

#### Scenario: A Tectonic preset

- **WHEN** `4x4Tde` is decoded
- **THEN** it is a 4×4 Tectonic board at Easy, and its short encoding is `4x4T`

#### Scenario: A Seismic preset

- **WHEN** `4x4dh` is decoded
- **THEN** it is a 4×4 Seismic board at Normal, and its short encoding is `4x4`,
  which decodes as a 4×4 Seismic board at Easy

#### Scenario: A letter that names no difficulty

- **WHEN** the `h` of `4x4dh` is changed to `x`
- **THEN** the params are refused with "Difficulty must be one of Easy,
  Normal."

### Requirement: A Seismic digit enters or pencils, and Backspace, Space or 0 clears

While the highlight shows, a digit SHALL enter that number in the highlighted
cell, or in pencil mode toggle that pencil mark there. Backspace, Delete, Space
and `0` SHALL clear the cell's number, or in pencil mode every pencil mark of
the cell. In pencil mode no key SHALL change a cell that holds a number. A key
that would leave the cell as it is SHALL make no move.

#### Scenario: Clearing a cell that holds nothing

- **WHEN** Backspace is pressed on a highlighted cell that holds no number, out
  of pencil mode
- **THEN** no move is made and Undo is offered no step

#### Scenario: A pencil mark typed twice

- **WHEN** `2` is typed twice in pencil mode on an empty cell with no pencil
  marks, in a region of three
- **THEN** the cell holds no pencil mark again, and each press was a move

### Requirement: A note-less Seismic cell is told by what stands within reach

Where the hint places the one number left for a cell with no notes, it SHALL
ring the cell and say what rules the others out in the mode's own words:
"Every other number is already in this cell's area or within reach along its
row or column, so it can only be 2." in Seismic mode, and "Every other number
is already in this cell's area or in a cell touching it, so it can only be 4."
in Tectonic mode.

#### Scenario: Notes written for a deduction say the same reach

- **WHEN** a Seismic-mode step first writes a note-less cell's notes, and the
  cell's area and the numbers within reach leave it 1 and 3
- **THEN** it says "Only 1 and 3 aren't already in this cell's area or within
  reach along its row or column, so pencil them in."

#### Scenario: A cell nothing reaches yet

- **WHEN** a step writes the notes of a cell no placed number rules anything
  out of
- **THEN** it says "No number stands near enough to rule one out here yet, so
  pencil in every one."
