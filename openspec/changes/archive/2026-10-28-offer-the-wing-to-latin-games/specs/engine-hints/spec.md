## MODIFIED Requirements

### Requirement: A hypothesis is classified as Check, Tactic or Search

A deduction that reaches its conclusion through a hypothesis SHALL be
classified by whether each link writes a mark the player can make. A Check is
a look at the placement, with no propagation, narratable at any tier. A Tactic is a chain whose every link is a fact the game's ordinary
marks record, taught as ordinary steps that each write their mark. A Search
runs the solver from a hypothesis, backtracks, or follows a chain of
suppositions no mark records, however short.

#### Scenario: A trial that propagates is not thereby a Search

- **WHEN** a technique tries a value and follows its forced consequences
- **THEN** it is classified by whether each consequence is a fact the player
  can mark, not by whether a trial propagates nor by the technique being called
  "forcing"

#### Scenario: A chain of suppositions is a Search

- **WHEN** a rung's links are "if this, then that" between values no mark
  records, as a Latin forcing chain's are
- **THEN** it runs only at Unreasonable, and the hint below it refuses it as a
  Search

#### Scenario: Weighing one element's values is a Check

- **WHEN** a rung takes every value one element can hold, reads each off the
  board as it stands, and concludes what every value agrees on, as the wing
  (Map's weighing and the candidate games' wing) and Path's weighed square do
- **THEN** it is a Check, and may define a tier below Unreasonable
