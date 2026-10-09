## MODIFIED Requirements

### Requirement: Pattern's keyboard paints and cycles as the pointer does

A cursor move with Ctrl held SHALL set the square it leaves and the square it
reaches to `Full`, with Shift to `Empty` and with both to `Unknown`, through
the same rectangle `fill` move. A stroke that paints `Full` or `Empty` SHALL
carry `onlyBlank`, as the pointer's multi-cell paint drag does, so it fills
only a square currently `Unknown` and never rewrites a mark the player already
placed; this diverges from upstream, whose stroke overwrites. A stroke that
clears, with both held, SHALL still reset marked squares. A stroke that would
change neither square SHALL produce no history-affecting move, and SHALL still
move the cursor. The cursor-select keys SHALL cycle the cursor's cell: Enter as
a left press does, Space as a right press does, and they are the keyboard's
way to change a square already marked.

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
