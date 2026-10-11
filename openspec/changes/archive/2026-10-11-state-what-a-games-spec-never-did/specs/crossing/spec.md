## ADDED Requirements

### Requirement: Crossing's own preferences are `auto-advance`, `highlight-runs` and `fit-highlight`

The game SHALL offer three preferences of its own, each a switch that is on by
default: `auto-advance`, whether entering a digit moves the selection along
the run being filled; `highlight-runs`, whether the runs through the selected
cell are marked on the board; and `fit-highlight`, whether the clue list is
colored by where each number could go from the selected cell.

#### Scenario: Auto-advance switched off

- **WHEN** `auto-advance` is off, a run's first cell is selected with the
  keyboard cursor and `4` and then `7` are typed
- **THEN** the cell holds 7 and the cursor has not moved

### Requirement: A held clue is put down by a second click, a click where it cannot go, or an entry

Clicking the held clue again SHALL put it down, and clicking another clue
SHALL act on that one as on any clue. Clicking an open square none of whose runs
can take the held clue SHALL put it down and select the square as any click
does. A digit or a clearing key pressed with a cell selected SHALL put it
down. A clue dropped into a run SHALL leave the clicked square selected. A click on
a wall, a right-click, an arrow and Enter SHALL leave the clue held.

#### Scenario: A click where the clue cannot go

- **WHEN** a three-digit clue is held and a square whose runs are both of
  other lengths is clicked
- **THEN** no clue is held, nothing is written, and that square is selected

#### Scenario: A click on a wall

- **WHEN** 871 is held on `2d2a1a1a5a2a3,16,18,64,88,94,871,893,4687,6633`,
  a `5x5` board whose top row is two open squares and then three walls, and
  the third square of that row is clicked
- **THEN** 871 is still held, and it is still held after a right-click on the
  first square and after an arrow

#### Scenario: A drop leaves the square selected

- **WHEN** a clue is held with no cell selected and a square of a run that can
  take it is clicked
- **THEN** the clue is written into the run and that square is selected

### Requirement: Crossing's hint looks for a whole run first and a note last

Each firing SHALL be the first the board shows of: a run only one listed
number still fits; a number that still fits only one run; a square all of a
run's still-fitting numbers agree on; a square whose across and down numbers
share one digit. Where the board shows none, it SHALL be the earliest note
step that a placement the solver's propagation reaches rests on. Where that
reaches none, it SHALL strike a note no number still fitting one of the
square's runs supports, or the plan ends.

#### Scenario: A whole run before a single square

- **WHEN** the board shows both a run that only one number still fits and, in
  another run, a square every still-fitting number agrees on
- **THEN** the plan's first step writes the number into its run

#### Scenario: A note nothing supports, where deduction has run out

- **WHEN** no placement follows on an Unreasonable board even by propagation,
  and a square's notes hold a digit that no number still fitting its across
  run has in that place
- **THEN** the hint's step strikes that digit from the square's notes
