## MODIFIED Requirements

### Requirement: Flood fill and solve moves transform state purely

A `FloodMove` SHALL be a fill carrying a color (`{ type: "fill", color }`) or a
solve (`{ type: "solve" }`). `interpretMove` SHALL produce a fill only when the
clicked / cursor-selected cell's color differs from the current corner color
and the game is not complete; cursor keys SHALL move the cursor (clamped).
`executeMove` SHALL be pure: a fill floods the corner region to the chosen
color and increments the move count; a solve SHALL run the solver and apply its
fills to reach the solved grid. The state SHALL keep no record of completion or
of the solver: the grid is complete exactly when it is one color, and the
engine records that Solve was used.

#### Scenario: A fill floods the corner region

- **WHEN** a fill move with a color adjacent to the controlled region executes
- **THEN** the corner region and all newly-adjacent same-color squares become
  that color, the move count increases by one, and the source state is unmutated

#### Scenario: A fill that does not change the corner color is rejected

- **WHEN** input targets a cell whose color equals the current corner color
- **THEN** no move is produced

#### Scenario: Solve snaps to a completed grid

- **WHEN** the solve move executes
- **THEN** the grid becomes a single color and the game reports itself solved
  with help
