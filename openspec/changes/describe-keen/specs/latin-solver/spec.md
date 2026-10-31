## ADDED Requirements

### Requirement: A compiled technique may read a partition the board deals

A description's `space.regions` SHALL name a partition the board deals,
whose parts a compiled technique binds as elements and reads the cells of
with `cells(r)`, each part's cells in reading order, and a clue kind SHALL
be able to sit at a part. The partition SHALL be dealt with the clues, and
a partition and a clue kind SHALL NOT share a name.

#### Scenario: A cage's clue read at the cage

- **WHEN** a technique binds `r in cage` on a board dealt cages and a sum
  clue at some of them
- **THEN** `clue(sum, r)` is the sum dealt at that cage, or `none` at a cage
  that has another kind

### Requirement: A technique may run only below a tier

A described technique SHALL be able to say `until` a tier above its own, and
the ladder SHALL run it only at a cap below that tier, so that a technique a
higher one strikes all of does not set a grade at a cap where the higher
one runs.

#### Scenario: Keen's Easy cage reading above Easy

- **WHEN** Keen's solver is asked at a cap of Normal or above
- **THEN** the Easy cage reading does not run, and a cage deduction is made
  by Normal's
