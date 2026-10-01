## MODIFIED Requirements

### Requirement: Same Game removes connected groups, scores, and compacts

A `SamegameMove` SHALL be `{ type: "remove"; tiles: number[] }` carrying the grid
indices to clear. `executeMove` SHALL be pure: it SHALL range-check each index,
set those tiles empty, add `max(0, n − scoresub)²` to the score (where `n` is the
number of removed tiles), let remaining tiles fall to the bottom of their
columns, shuffle non-empty columns to the left, and recompute `impossible` (no
two orthogonally-adjacent tiles share a color). `status` SHALL return `"solved"`
when the grid is empty and otherwise `"ongoing"` — a no-moves-left
(`impossible`) position is NOT `"lost"` (it is rescuable by Undo).

#### Scenario: Removing a group scores and compacts

- **WHEN** a `remove` move clearing a group of 4 tiles is executed with
  `scoresub = 2`
- **THEN** the new state's score increases by `(4 − 2)² = 4`
- **AND** tiles above the cleared cells have fallen and empty columns have moved
  right, and the source state is unmutated

#### Scenario: Clearing the last tiles wins

- **WHEN** a `remove` move empties the final non-empty tiles
- **THEN** the new state's grid is empty and `status()` returns `"solved"`

#### Scenario: A stuck board is impossible but not lost

- **WHEN** a state has no two orthogonally-adjacent same-color tiles and is not
  empty
- **THEN** that state's `impossible` flag is set and `status()` returns
  `"ongoing"`
