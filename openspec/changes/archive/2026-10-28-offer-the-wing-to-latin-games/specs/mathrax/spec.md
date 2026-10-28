## MODIFIED Requirements

### Requirement: Generation: What separates Mathrax's difficulty tiers

Beside the Latin deductions, Mathrax's clue deduction SHALL keep in a
cell only the digits every clue at its corners permits, given the candidates of
the cell across that clue. Easy SHALL read an arithmetic clue only when the cell
across it is down to one digit. Easy and Normal SHALL act only where one digit
is left; Tricky SHALL strike all that is ruled out. Normal SHALL add the
set elimination, Tricky the harder one and the wing, and Unreasonable
forcing chains and guess-and-verify.

#### Scenario: The solver solves a generated board

- **WHEN** a generated board is solved
- **THEN** the returned grid is the board's unique Latin-square solution and satisfies
  every clue
