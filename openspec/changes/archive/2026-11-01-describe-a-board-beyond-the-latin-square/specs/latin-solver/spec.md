## REMOVED Requirements

### Requirement: The candidate cube is indexed by cell and then by symbol

**Reason**: The Latin solver's candidates are the engine's marks, a mask a cell, which every described game shares; upstream's cube is no longer what a technique reads.
**Migration**: A generator that reads the cube is given it written from the marks ("The cube a generator reads is written from the marks").

## ADDED Requirements

### Requirement: The cube a generator reads is written from the marks

Where a generator reads upstream's candidate cube (Unequal's, Salad's), `latinSolver` SHALL write it from its marks at every exit that is not a recursion, indexed `(x·o + y)·symbols + (n−1)`, where `symbols` is `o` for a Latin square and `o − times + 1` where a symbol repeats `times` a line.

#### Scenario: A rejected board still writes its cube

- **WHEN** `latinSolver` is given a grid whose givens clash, and a cube to write
- **THEN** it returns `DIFF_IMPOSSIBLE` and the cube holds the marks as they stood

## MODIFIED Requirements

### Requirement: The Latin cube supports a symbol that may repeat in a line

The shared Latin-square solver SHALL support puzzles in which one declared
symbol may appear a stated number of times in each row and column, rather than
exactly once, and SHALL express it in its candidates, so that deduction
techniques can be written about it. The support SHALL be opt-in, and SHALL be
inert when not requested: a puzzle that declares no repeatable symbol SHALL
produce exactly the deductions, in exactly the order, that it produces without
the support.

#### Scenario: A pseudo-Latin puzzle is expressed directly

- **WHEN** a puzzle declares a symbol with a per-line multiplicity greater than
  one
- **THEN** the solver reasons about that symbol's placements in its
  candidates, without the caller translating it into and out of a
  single-occurrence encoding

#### Scenario: Existing consumers are unaffected

- **WHEN** a puzzle declaring no repeatable symbol is solved
- **THEN** the solver's deductions and their order are unchanged
