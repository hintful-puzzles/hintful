## MODIFIED Requirements

### Requirement: An Unreasonable Net board has one answer that the solver does not reach

At Unreasonable the generator SHALL stop the perturbing of the wiring at the
first network the solver cannot settle that the search proves has one answer,
within the engine's dealing budget, and SHALL draw another network where the
solver settles one. The board SHALL be kept only when the solver still stops
short of it as dealt, with its walls drawn.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 3×4 and 4×4 wrapping, at
  5×5 and 4×6, and at 5×5 with a barrier probability of 0.3 wrapping and not
- **THEN** the solver leaves each unfinished
- **AND** exactly one turning fits each, by a count that has no search in it
- **AND** that answer is the network the board was drawn as

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 3×4 wrapping board, a 5×5 board and an 11×13 board
  is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable
