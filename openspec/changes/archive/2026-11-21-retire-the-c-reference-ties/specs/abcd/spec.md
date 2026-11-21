## MODIFIED Requirements

### Requirement: Generation: ABCD's generator accepts only a uniquely solvable fill

The generator SHALL fill the grid with random letters that respect the no-touch
rule, count the resulting clues, and at Easy accept the puzzle only when the
solver reports it uniquely solvable, retrying otherwise. When "remove clues" is
set, it SHALL then hide clues in a randomized order, keeping each removal only
while the solver still solves the puzzle.

#### Scenario: A board with clues removed still has one solution

- **WHEN** an Easy board is generated with "remove clues" set
- **THEN** the solver reports its description, hidden clues included, uniquely
  solvable
