## MODIFIED Requirements

### Requirement: Bridges input drags bridges between islands

A left-drag from an island along its row or column to the next in-line island
SHALL add a bridge between them, or one more to those there, wrapping back to
zero once the span's limit is exceeded. The island the drag points at SHALL be
tracked as the pointer moves, and the move SHALL be committed on release. A
drag that does not run cleanly between two in-line islands SHALL be canceled
with no change. A secondary drag is Requirement: A secondary drag lowers a
Bridges span's limit by one.

#### Scenario: Dragging cycles the bridge count

- **WHEN** the player left-drags from an island to an in-line neighbor three
  times on a `maxb = 2` board
- **THEN** the bridge count between them goes 1, then 2, then 0

#### Scenario: An off-line drag is canceled

- **WHEN** the player starts a drag on an island and releases where no in-line
  island lies
- **THEN** the board is unchanged

#### Scenario: A drag that overshoots the canvas still draws

- **WHEN** a drag from an island toward its left neighbor runs on past the
  canvas's left edge and is released there
- **THEN** the bridge to that neighbor is drawn

## REMOVED Requirements

### Requirement: A canceled press on an island draws no bridge

**Reason**: It described the frontend's old report of a cancel, a drag far off
the canvas's top left corner and a release there, and covered only a press
that had not moved. A cancel no longer reaches a game as a drag.

**Migration**: `engine-input`, "A canceled press leaves the game as it was
before the press", covers every game, moved or not. Its scenario "A drag that
overshoots the canvas still draws" is kept under "Bridges input drags bridges
between islands".
