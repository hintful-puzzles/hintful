## MODIFIED Requirements

### Requirement: The solver takes an explicit difficulty cap

The grading solver, `subsetsSolveGame`, SHALL take an explicit difficulty cap,
with no default: an implicit cap is how a caller silently measures a tier it
did not mean. At the lowest tier the rule set SHALL be upstream's compiled
strength exactly, without upstream's disabled advanced-rule branch. `solve`,
`findMistakes` and `hint` SHALL run at the top tier whatever tier the board
states, and `solve` SHALL refuse a board that leaves unfinished.

#### Scenario: A lowest-tier board is solved at the lowest cap

- **WHEN** a board generated at the lowest tier is solved with the cap named as
  the lowest tier
- **THEN** the solver reaches a complete solution

#### Scenario: Solve on a board dealt at the lowest tier

- **WHEN** Solve is asked for on a board whose ID states the lowest tier
- **THEN** the solver runs with the top tier's rules and the board is filled

#### Scenario: A board whose arrows settle nothing

- **WHEN** `solve` is given a board with no givens, which no tier finishes
- **THEN** it returns "This puzzle's solution can't be determined." and no
  partly filled board
