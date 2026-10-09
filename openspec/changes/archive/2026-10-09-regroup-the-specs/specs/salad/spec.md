## MODIFIED Requirements

### Requirement: Salad has two difficulties, both solved by deduction alone

Salad's solver SHALL provide two difficulties, Easy and Normal, and both SHALL
be solvable by pure deduction without guessing. To the shared Latin deductions
it SHALL add one of its own, the border-clue deduction, in ABC End View mode.
Easy SHALL be that deduction and the shared positional and numeric
eliminations, and Normal SHALL add the shared set elimination and forcing
chains.

#### Scenario: The solver deduces the unique solution without guessing

- **WHEN** a generated board is solved at its difficulty
- **THEN** the solver reaches the unique completion using only its deductive
  techniques, never backtracking search
