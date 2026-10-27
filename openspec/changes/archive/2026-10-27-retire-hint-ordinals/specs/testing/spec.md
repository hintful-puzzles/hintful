## MODIFIED Requirements

### Requirement: A hint test does not walk seeds to find its position

A hint test SHALL NOT walk seeds to find the position it asserts on. A test
that asserts a property of every board or step it walks is a sweep and not a
scan for a position, and is not covered by this requirement.

#### Scenario: A refusal

- **WHEN** a test wants a board the hint refuses
- **THEN** it keeps the board by hand and says why beside it, because a
  refusal has no step for a pin's loader to return

#### Scenario: A cross-game guard needs a frame only some games produce

- **WHEN** a guard over every hinted game checks a frame that only some
  games' hints produce
- **THEN** it pins one position for each such game and searches for none on a
  normal run
- **AND** a walk another guard already makes fails on such a step from a game
  with no pin, so which games are checked stays derived from what their hints
  do
