## MODIFIED Requirements

### Requirement: Pattern's keyboard paints and cycles as the pointer does

A cursor move with Ctrl held SHALL set the square it leaves and the square it
reaches to `Full`, with Shift to `Empty` and with both to `Unknown`, through
the same rectangle `fill` move. That stroke SHALL overwrite a mark either
square already holds, as upstream's does: it carries no `onlyBlank`, which is
the pointer's multi-cell paint drag's alone. The cursor-select keys SHALL
cycle the cursor's cell: Enter as a left press does, Space as a right press
does.

#### Scenario: A click and Enter agree

- **WHEN** the player clicks a cell, or presses Enter with the cursor on it
- **THEN** the cell moves to the same next state, and likewise a right-click and
  Space

#### Scenario: A keyboard stroke crosses a marked square

- **WHEN** the cursor moves with Ctrl held onto a square the player has marked
  `Empty`
- **THEN** that square becomes `Full`, where a pointer paint drag over the same
  two squares would have left it `Empty`
