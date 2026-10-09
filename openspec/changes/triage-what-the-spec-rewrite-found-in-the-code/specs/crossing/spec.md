## MODIFIED Requirements

### Requirement: Crossing advances the selection along the number being filled

Entering a digit SHALL move the selection to the next cell of the run being
filled, also where the cell already held that digit and no move is made. The
behavior SHALL be a preference, enabled by default. The selection SHALL NOT
advance after clearing a cell or after a pencil mark. After the run's last
digit the cursor SHALL stay in the run, and a highlight the pointer placed
SHALL be put away, as after any pointer entry; a keyboard cursor stays shown.

#### Scenario: A number typed over a cell that already holds its digit

- **WHEN** a run's first cell holds a 4 and the player selects it and types 4
  and then 7
- **THEN** the 4 makes no move and the selection steps on, and the 7 goes in
  the second cell

#### Scenario: A whole number is typed after one selection

- **WHEN** a cell at the start of a run is selected and digits are typed
- **THEN** each digit fills the next cell of that run in turn, and the selection
  remains visible throughout

#### Scenario: The selection stops at the end of the run

- **WHEN** the first cell of a run is clicked and every digit of the run is
  typed
- **THEN** the cursor does not leave the run, and after the last digit no cell
  is highlighted, no run is marked and no clue is colored

### Requirement: Selecting a cell shows which clues fit its runs

Selecting a cell for digit entry SHALL indicate which clues can still go in
either run through it, since clicking one places it in the corresponding run;
each of the two aids is a preference, on by default. A clue already written
into the grid SHALL remain distinguishable from one that merely cannot go in
the selected run. A cell selected for pencil marks SHALL show neither the
marked runs nor the colors of the clues that fit.

#### Scenario: Both runs through the selected cell are answered for

- **WHEN** a cell lying in both a horizontal and a vertical run is selected
- **THEN** both runs are marked on the board, each in its direction's color,
  and each clue is written in the color of the run it fits, or dimmed when it
  fits neither

#### Scenario: A clue on the board stays distinguishable from an unavailable one

- **WHEN** one clue has been written into the grid and another simply cannot go
  in the selected run
- **THEN** the two are shown differently

#### Scenario: The same cell selected for pencil marks

- **WHEN** a cell lying in both a horizontal and a vertical run is selected
  while pencil mode is on
- **THEN** the cell carries the pencil selection alone, no run is marked for
  it, and every clue not yet written into the grid is in the plain ink
