## ADDED Requirements

### Requirement: A compiled technique may read a Sudoku's boxes and diagonals

The partition a description lists among its `units` SHALL be the compiled
space's boxes, lines like its rows, and `space.diagonals` SHALL give the two
diagonals as lines; the space's units SHALL be scanned in the description's
order. A partition named as a function SHALL give the part holding a cell.

#### Scenario: A box's hidden single

- **WHEN** a technique binds `u in box` on a Sudoku board and a value has one
  place left in a box
- **THEN** `cells(u)` is the box's cells in reading order, and `box(c)` of
  that place is the box

### Requirement: A ladder may grade on more than one scale

A description SHALL be able to name grading scales besides its tiers, and a
technique's tier SHALL be a tier of one of them, which its compiled ladder
entry names. A technique SHALL be able to name a tier, `from`, below which
cap on its scale the ladder does not run it.

#### Scenario: A killer reading graded on the killer scale

- **WHEN** a Solo killer technique fires
- **THEN** it raises the killer grade, never the sudoku one

### Requirement: The compiler reads a description with every variation applied

The compiled ladder SHALL be built from the description with every variation
applied, and a name a board's variations do not deal SHALL be empty on it.

#### Scenario: A killer technique on a board without cages

- **WHEN** Solo's compiled ladder runs on a board with no killer cages
- **THEN** its killer techniques bind nothing and fire nothing
