## MODIFIED Requirements

### Requirement: ABCD's solver classifies a clue set by deduction alone

ABCD's solver SHALL report a clue set uniquely solvable, ambiguous or
contradictory. It SHALL apply, to a fixpoint and without backtracking, three
techniques: satisfied clue, striking a letter from a line whose count is met;
single possibility, placing a cell's one remaining candidate; and runs,
forcing letters when the most a line can still take equals the count it needs.
A firing census SHALL walk boards generated at every preset on the menu and
assert that every technique fires.

#### Scenario: The solver classifies a puzzle

- **WHEN** the solver is run on a clue set
- **THEN** it reports uniquely solvable, ambiguous, or contradictory, and for a
  uniquely solvable set it yields the solution grid

#### Scenario: A technique the corpus never reaches fails the census

- **WHEN** a technique is removed from the ladder
- **THEN** the census reports it as never fired, even though the generator, gated
  on the same solver, deals only boards the weakened ladder finishes

#### Scenario: A preset is added to the menu

- **WHEN** a preset is added to ABCD's preset list
- **THEN** the census walks boards generated at it with no edit to the census
