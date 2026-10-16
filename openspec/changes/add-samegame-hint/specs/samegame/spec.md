## ADDED Requirements

### Requirement: Hint: Same Game has a hint that keeps the board clearable

Same Game SHALL have a hint. Each step SHALL offer a removal after which the
board can still be cleared, mark the group it removes, and say what the
hint's search proves about it.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Same Game board
- **THEN** a step marks a group to remove and says why removing it leaves the
  board clearable
