## MODIFIED Requirements

### Requirement: Pattern accepts drag-fill rectangle and cursor input

`interpretMove` SHALL reproduce upstream's input with two deliberate
divergences: drag-paint skips placed marks, and a press **cycles** the pressed
cell as the cursor-select keys do, for a mouse and a finger alike (upstream
filled on a mouse press and cycled only on a stylus). A left press SHALL begin a
drag whose target state is the pressed cell's next state in the cycle
`Unknown` → `Full` → `Empty` → `Unknown`, and a right press the same cycle the
other way. A drag snaps to a single row or column, except a drag whose target
state is `Unknown`, which erases a rectangle; release emits a `fill` move
covering the dragged rectangle **only when at least one non-immutable cell in it
would change** (otherwise a UI update).

A **multi-cell paint drag** (the value is `Full` or `Empty` and the rectangle
covers more than one cell) SHALL fill only cells currently `Unknown`, leaving
already-marked cells untouched, so dragging across the board never rewrites a
mark the player already placed. A **single-cell** action SHALL overwrite the
cell (so a deliberate click can change a mark), and a **clear** drag (value
`Unknown`) SHALL still reset marked cells. This is carried by an `onlyBlank`
flag on the `fill` move, honored by `executeMove` and previewed consistently by
`redraw`.

Keyboard cursor movement with the control/shift modifiers SHALL set cells to
`Empty` / `Full` / `Unknown` via the same rectangle move, and the cursor-select
keys SHALL cycle a cell's state: Enter as a left press does, Space as a right
press does. Immutable cells SHALL never be overwritten.

#### Scenario: A drag that changes cells emits a move

- **WHEN** the player left-drags from an `Unknown` cell across cells not all
  already `Full`
- **THEN** release emits a `fill` move setting the blank cells of that line to
  `Full`

#### Scenario: A multi-cell paint drag leaves placed marks

- **WHEN** the player drag-paints a line that crosses a cell they have already
  marked the opposite color
- **THEN** that already-marked cell keeps its color and only the blank cells of
  the line are painted

#### Scenario: A single click still overwrites a mark

- **WHEN** the player clicks a single already-marked cell
- **THEN** the cell takes the next state in that button's cycle

#### Scenario: A no-op drag produces no move

- **WHEN** the player drags over cells that already hold the target state (or are
  all immutable)
- **THEN** no history-affecting move is produced

#### Scenario: A click and Enter agree

- **WHEN** the player clicks a cell, or presses Enter with the cursor on it
- **THEN** the cell moves to the same next state, and likewise a right-click and
  Space
