## MODIFIED Requirements

### Requirement: The solver applies the generic deductions up to the difficulty ceiling

The engine SHALL provide one generic Latin-square solver, `latinSolver`, for
every Latin-square game. It SHALL apply, up to `maxdiff`, the game's described
ladder, which places the Latin library's techniques (singles, set and
single-number set elimination, the wing) among the game's own, then forcing
chains and guess-and-verify recursion, a filled grid judged by the game's
compiled answer check. A forcing chain, a supposition, SHALL run only at the
recursive level.

#### Scenario: Respects the difficulty ceiling

- **WHEN** a board requires a deduction above `maxdiff` and recursion is not
  permitted
- **THEN** `latinSolver` returns `DIFF_UNFINISHED` rather than guessing

#### Scenario: A chain waits for the recursive level

- **WHEN** a board's next deduction is a forcing chain and `maxdiff` is below
  the recursive level
- **THEN** the chain's elimination is not made

## ADDED Requirements

### Requirement: A game's answer check is compiled from its rules

A described game's module SHALL export `isAnswer`, compiled from its domain,
shape, rules and clue meanings, and a described game SHALL decide that a
board is solved, and its solver that a filled grid is an answer, only by it.
A rule a variation adds SHALL hold only where the board has the variation on.

#### Scenario: A value outside the domain is no answer

- **WHEN** a filled grid satisfies every clue but holds a value outside a
  cell's domain
- **THEN** `isAnswer` is false and the game's status is not solved

#### Scenario: A variation's rule holds only where it is on

- **WHEN** an Unruly grid repeats a row and the unique-rows rule is off
- **THEN** `isAnswer` holds of it, and with the rule on it does not
