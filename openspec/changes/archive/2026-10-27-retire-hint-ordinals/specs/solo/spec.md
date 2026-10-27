## MODIFIED Requirements

### Requirement: Solver: The techniques Solo's solver implements

The solver SHALL implement, in difficulty order, the standard techniques
(positional and numeric elimination, block/row/column intersection, set
elimination, and, at the recursive level, forcing chains and bounded
recursion) and the killer techniques (single-cell sums, min/max elimination,
sum-combination enumeration, and cage/line intersection). A forcing chain is a
supposition, so it SHALL NOT run below the recursive level.

#### Scenario: A board that needs a guess is graded at recursion

- **WHEN** `solveSolo` is run, with recursion allowed, on a uniquely solvable
  board that no deduction technique finishes
- **THEN** it returns the recursion difficulty and the unique solution

#### Scenario: A board that needs a chain is graded at recursion

- **WHEN** `solveSolo` is run on a board whose next deduction at Extreme
  would be a forcing chain
- **THEN** capped at Extreme it does not finish the board, and with recursion
  allowed it returns the recursion difficulty

### Requirement: Hint: The eliminations Solo's hint teaches

A deductive elimination SHALL be one technique *firing*: a positional or
numeric single, a block/line intersection, a naked or hidden subset or, on a
killer board, a single-square cage, a cage min/max bound, a cage
sum-combination, or a deduced extra-cage.

#### Scenario: A killer-cage deduction is taught on a killer board

- **WHEN** the player asks for a hint on a killer board where a cage's sum clue
  rules a digit out of one of its cells
- **THEN** the hint returns a `pencilStrike` step naming the cage by the total
  it must make and concluding in the necessity voice
