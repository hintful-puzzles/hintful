## ADDED Requirements

### Requirement: The solver weighs a wing at the single-number set level

`latinSolver` SHALL apply the wing, every value one cell can take each read
off a cell in its row or column down to that value and one other, at the
single-number set elimination's level, after it. It SHALL strike one cell a
firing, and SHALL weigh no cell that could still hold a repeated symbol.

#### Scenario: A wing strikes at the top deductive level

- **WHEN** a cell's candidates are 1 and 2, a cell in its row is down to 1
  and 3, a cell in its column is down to 2 and 3, a fourth cell shares a line
  with both of those, and `maxdiff` reaches the single-number set level
- **THEN** 3 is struck from the fourth cell
