## ADDED Requirements

### Requirement: Rome refuses a pencil mark pointing off the grid

Rome SHALL refuse a pencil mark for an arrow that points off the grid, on every
way into notes: the armed keyboard cursor, a typed or on-screen arrow key in
notes mode, and a pencil drag. Such a drag SHALL preview no mark, and its
release SHALL select the square as a drag that commits nothing does. Mark-all
never offers that mark and the solver never considers that arrow, so a hint
meeting one would have no strike to teach. Executing a pencil move SHALL leave
no mark pointing off the grid, so a move log saved before the refusal replays
without one. Placing such an arrow as a real entry SHALL remain a move, which
the board flags as an error.

#### Scenario: Each way into notes refuses an off-grid mark

- **WHEN** the player, in notes mode on a top-row square, presses up with the
  armed cursor, presses the up arrow key, or pencil-drags off the top edge
- **THEN** no move is made, and the drag previews no mark

#### Scenario: A replayed off-grid mark leaves no note

- **WHEN** a pencil move for an arrow pointing off the grid is executed
- **THEN** the square's marks are unchanged by it

#### Scenario: The hint survives the board that found this

- **WHEN** the hint is asked on the pinned board after its move log, which ends
  in the player's off-grid mark
- **THEN** the hint answers instead of throwing
