## MODIFIED Requirements

### Requirement: Pattern accepts drag-fill rectangle and cursor input

A drag SHALL snap to a single row or column, except a drag whose target state
is `Unknown`, which erases a rectangle. A release SHALL change the squares of
the dragged rectangle through one `fill` move. Immutable cells SHALL never be
overwritten.

#### Scenario: A drag that changes cells emits a move

- **WHEN** the player left-drags from an `Unknown` cell across cells not all
  already `Full`
- **THEN** release emits a `fill` move setting the blank cells of that line to
  `Full`

#### Scenario: A no-op drag produces no move

- **WHEN** the player drags over cells that are all immutable
- **THEN** no history-affecting move is produced

### Requirement: Pattern's keyboard paints and cycles as the pointer does

A cursor move with Ctrl held SHALL set the square it leaves and the square it
reaches to `Full`, with Shift to `Empty` and with both to `Unknown`, through
the same rectangle `fill` move. A stroke that paints SHALL carry `onlyBlank`,
as the pointer's paint drag does and upstream's stroke does not; one that
clears SHALL NOT. The cursor-select keys SHALL cycle the cursor's cell: Enter
as a left press does, Space as a right press does.

#### Scenario: A click and Enter agree

- **WHEN** the player clicks a cell, or presses Enter with the cursor on it
- **THEN** the cell moves to the same next state, and likewise a right-click and
  Space

#### Scenario: A keyboard stroke crosses a marked square

- **WHEN** the cursor is on a square the player has marked `Empty` and moves
  with Ctrl held onto an `Unknown` square
- **THEN** the `Unknown` square becomes `Full` and the marked square stays
  `Empty`, as a pointer paint drag over the same two squares would leave them

#### Scenario: A keyboard stroke over two marked squares makes no move

- **WHEN** the cursor moves with Ctrl or Shift held, alone, between two squares
  that are both already `Full` or `Empty`
- **THEN** the cursor moves and no history-affecting move is produced

#### Scenario: A clearing stroke resets marked squares

- **WHEN** the cursor moves with Ctrl and Shift both held between two marked
  squares
- **THEN** both become `Unknown`
