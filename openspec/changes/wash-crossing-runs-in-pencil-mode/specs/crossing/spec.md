## MODIFIED Requirements

### Requirement: Selecting a cell shows which clues fit its runs

Selecting a cell, for digit entry or for pencil marks, SHALL mark the runs
through it on the board. Selecting a cell for digit entry SHALL also indicate
which clues can still go in either run through it, since clicking one places it
in the corresponding run; a cell selected for pencil marks SHALL leave the
clues uncolored, since a click then only holds a clue. Each of the two aids is
a preference, on by default. A clue already written into the grid SHALL remain
distinguishable from one that merely cannot go in the selected run. Pencil
marks in a cell of a marked run SHALL remain legible, and a cell selected for
pencil marks SHALL show that selection whether or not it holds a digit.

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
- **THEN** the other cells of both runs are marked, each in its direction's
  color, the selected cell carries the pencil selection on its own surface, and
  every clue not yet written into the grid is in the plain ink

#### Scenario: Candidates in a marked run can be read

- **WHEN** a run is marked and one of its empty cells holds pencil marks
- **THEN** those marks are drawn in the ink a placed digit takes on the run's
  color, not in the pencil ink

#### Scenario: A filled cell selected for pencil marks

- **WHEN** a cell holding a digit is selected while pencil mode is on
- **THEN** the cell shows the pencil selection
