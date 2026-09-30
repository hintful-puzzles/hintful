## MODIFIED Requirements

### Requirement: Tiles rotate and lock; no-op inputs are suppressed locally

Left-click SHALL rotate a tile anticlockwise, right-click clockwise, and `f` by 180°.
`s` SHALL toggle a tile's lock, and so SHALL a tap in the middle third of a tile in
notes mode, where the pointer's other taps note sides: outside notes mode both
buttons rotate, so notes mode is where the pointer reaches the lock. A locked tile
SHALL NOT rotate. Inputs that change nothing — a click outside the grid, a click in
the gutter between tiles, or a rotate on a locked tile — SHALL be suppressed in
`interpretMove` by returning no move, WITHOUT comparing serialized game states.

#### Scenario: Rotating a locked tile does nothing

- **WHEN** the player left-clicks a tile that is locked
- **THEN** no move is produced and the board is unchanged

#### Scenario: A tile rotated full circle leaves ordinary undo history

- **WHEN** the player rotates a tile anticlockwise and then clockwise
- **THEN** the board is back to its original wiring and there are two ordinary undo entries —
  the engine performs no state-equality suppression

#### Scenario: A tap in the middle of a tile in notes mode locks it

- **WHEN** notes mode is on and the player taps, or right-clicks, the middle third of a tile
- **THEN** the tile's lock toggles, and a tap nearer one of its sides notes that side instead
