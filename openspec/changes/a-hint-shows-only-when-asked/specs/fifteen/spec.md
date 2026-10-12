## MODIFIED Requirements

### Requirement: Fifteen offers a greedy full-solution hint plan

`hint()` SHALL return the whole greedy solution as a multi-step plan. Each
step SHALL be the next single-cell gap slide the greedy solver chooses,
highlighting the tile it slides. The solver SHALL fill the shorter of the top
row and the left column tile by tile, moving the next tile toward its home,
with a fixed shortest-move table for the end-of-line corner. Following the
plan from any solvable board SHALL reach the solved state.

#### Scenario: Hint plan solves a solvable board

- **WHEN** `hint()` is requested on an unsolved board and every step's move is
  applied in order
- **THEN** the steps are legal single-cell gap slides and the board reaches the
  solved arrangement within `5·n³` moves

#### Scenario: Hint highlights the tile it moves

- **WHEN** `hint()` is requested on an unsolved board
- **THEN** the first step's move is a slide whose target is one cell from the
  gap, and its highlight names the tile that will slide into the gap
