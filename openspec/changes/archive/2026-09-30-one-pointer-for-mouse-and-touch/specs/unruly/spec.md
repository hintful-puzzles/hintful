## MODIFIED Requirements

### Requirement: Unruly marks cells via three-state cycling moves

An `UnrulyMove` SHALL place a color or empty at a cell (upstream's `P{c},{x},{y}`)
or apply a full solution grid (upstream's `S`). `executeMove` SHALL be pure,
reject an out-of-bounds or immutable-cell target, and recompute `completed` as
counts-valid plus run-valid after the placement (a solve move marks the state
cheated and completed). Left-button / select on a non-immutable cell SHALL cycle
empty → one → zero → empty; right-button / select2 SHALL cycle
empty → zero → one → empty; the `1` key SHALL place one, `0`/`2` zero, and
Backspace clear; an immutable cell SHALL be inert. A keyboard
cursor SHALL move within the grid. A click or key that would not change the
target cell SHALL produce no history move.

#### Scenario: Left and right cycle in opposite directions

- **WHEN** an empty non-immutable cell receives a left-button action, then
  another, then another
- **THEN** it passes one → zero → empty
- **AND** the same cell under three right-button actions passes zero → one →
  empty

#### Scenario: Immutable cells reject marking

- **WHEN** a marking action targets an immutable clue cell
- **THEN** `interpretMove` produces no move and the cell is unchanged

#### Scenario: Completing the board is detected

- **WHEN** a move fills the final cell of a valid solution
- **THEN** `completed` becomes true, `status` returns `"solved"`, and a flash
  plays
