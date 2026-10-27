## MODIFIED Requirements

### Requirement: Generation: Each Towers tier adds deductions to the one below

An Easy board SHALL fall to the singles of the Latin square and to the clue
deductions that enumerate nothing. Normal SHALL add a clue's arrangements,
every way of filling its line that shows the clue's count, and the row and
column sets; Tricky the single-number sets; and Unreasonable forcing chains
and a guess that is verified.

#### Scenario: The solver capped at Easy

- **WHEN** the solver is run on a board with its cap at Easy
- **THEN** it tries no clue's arrangements and no set, and reports a board
  that needs either as unfinished
