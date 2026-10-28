## MODIFIED Requirements

### Requirement: Generation: Keen's tiers are the Latin-square deductions a board needs

The solver SHALL accept a completed grid only when every cage's digits satisfy
its clue. Of the shared Latin-square deductions, Easy and Normal SHALL allow
the simple ones, Tricky the set deductions, Hard the deeper set deductions and
the wing, and Unreasonable forcing chains and recursion.

#### Scenario: Solver grades a known board

- **WHEN** the solver is run on a generated board at its difficulty
- **THEN** it returns that difficulty and fills the grid with the unique solution
