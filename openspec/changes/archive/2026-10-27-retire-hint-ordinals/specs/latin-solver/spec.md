## MODIFIED Requirements

### Requirement: The solver applies the generic deductions up to the difficulty ceiling

The engine SHALL provide one generic Latin-square solver, `latinSolver`, for
every Latin-square game. It SHALL apply, up to `maxdiff`, positional and
numeric elimination, row and column set elimination, single-number set
elimination, forcing chains, and guess-and-verify recursion. These SHALL be
interleaved with the game's own `usersolvers` at their declared difficulty
levels and validated by the game's `valid` callback. A forcing chain, a
supposition, SHALL run only at the recursive level.

#### Scenario: Respects the difficulty ceiling

- **WHEN** a board requires a deduction above `maxdiff` and recursion is not
  permitted
- **THEN** `latinSolver` returns `DIFF_UNFINISHED` rather than guessing

#### Scenario: A chain waits for the recursive level

- **WHEN** a board's next deduction is a forcing chain and `maxdiff` is below
  the recursive level
- **THEN** the chain's elimination is not made
