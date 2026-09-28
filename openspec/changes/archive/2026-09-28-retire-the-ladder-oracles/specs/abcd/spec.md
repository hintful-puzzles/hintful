## MODIFIED Requirements

### Requirement: ABCD's solver is a certified deduction ladder

ABCD's solver SHALL run its three techniques (satisfied clue, single possibility,
runs) as a `runDeductionFixpoint` ladder. A firing census SHALL walk generated
boards covering every preset shape, diagonal mode and a thin board, and assert
that every technique fires on the corpus, with a count of the boards solved. The
hand-written loop the ladder replaced SHALL NOT be kept once the adoption is
proved; git holds it.

#### Scenario: A technique the corpus never reaches fails the census

- **WHEN** a technique is removed from the ladder
- **THEN** the census reports it as never fired, even though the generator, gated
  on the same solver, deals only boards the weakened ladder finishes
