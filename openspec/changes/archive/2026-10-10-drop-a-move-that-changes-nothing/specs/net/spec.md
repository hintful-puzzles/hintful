## ADDED Requirements

### Requirement: A Net click off a tile or on a locked tile makes no move, and a turn back is a move

A click outside the grid, a rotating click in the gutter between tiles, and a
rotate on a locked tile SHALL produce no move. A turn that undoes the turn
before it SHALL still be a move of its own.

#### Scenario: Rotating a locked tile does nothing

- **WHEN** the player left-clicks a tile that is locked
- **THEN** no move is produced and the board is unchanged

#### Scenario: A tile rotated full circle leaves ordinary undo history

- **WHEN** the player rotates a tile anticlockwise and then clockwise
- **THEN** the board is back to its original wiring and there are two ordinary undo entries

## REMOVED Requirements

### Requirement: No-op inputs are suppressed locally

**Reason**: Restated as "A Net click off a tile or on a locked tile makes no move, and a turn back is a move", with both scenarios and Net's three refusals and its departure word for word. Only the title and the opening words "An input that changes nothing SHALL produce no move" go: that rule is `ts-engine`, "A move that leaves the board as it was is no step of the history", and it is not held by each game suppressing the move for itself, which is what the title said.
