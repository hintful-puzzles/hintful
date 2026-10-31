## ADDED Requirements

### Requirement: Solver: Towers' ladder is its description

Towers' solver SHALL run the ladder of `towers.description.yaml`: the facing
pairs, the clue bounds and the arrangements it states and the Latin library's
it places, each at the tier the description gives it, checked sound against
the description's rules, a Latin square whose clues count the towers seen
along their lines. The search above them stays the engine's.

#### Scenario: The facing pairs place their towers once

- **WHEN** a board has two facing pairs that sum to one more than its size,
  and the solver is asked at any cap
- **THEN** its first firing places the tallest tower in both lines, recorded
  with each pair
- **AND** no later call of the facing technique is a firing, since both
  towers then stand

#### Scenario: A height no arrangement allows is struck at Hard

- **WHEN** no filling of a clue's line from its cells' candidates, every
  height once, that shows the clue's count puts a height in a cell, at a cap
  of Hard or above
- **THEN** the solver strikes that height from that cell, in a firing of its
  own for the cell, recorded with the clue
