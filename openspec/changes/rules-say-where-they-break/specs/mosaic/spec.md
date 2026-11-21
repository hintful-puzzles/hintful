## MODIFIED Requirements

### Requirement: Rules: Mosaic flags a satisfied clue and a contradicted one

A clue SHALL be drawn done (gray) when it is exactly satisfied with no cell of
its neighborhood unmarked, and in the error color where the board breaks it
(`Game.rules`): more cells marked than the clue, or too few cells left that
could be. Both SHALL be derived from the marks as each frame is drawn, and
the count of clues left SHALL follow the marks.

#### Scenario: A satisfied clue grays out and a contradicted clue reddens

- **WHEN** a clue's neighborhood is fully determined with exactly the clue's
  count marked
- **THEN** the clue is drawn gray
- **AND** when more cells are marked around a clue than its value, it is
  drawn in the error color
