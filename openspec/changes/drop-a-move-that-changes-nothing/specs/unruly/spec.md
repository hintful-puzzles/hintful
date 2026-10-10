## MODIFIED Requirements

### Requirement: Unruly marks cells via three-state cycling moves

Left-button / select on a non-immutable cell SHALL cycle
empty → one → zero → empty; right-button / select2 SHALL cycle
empty → zero → one → empty. An immutable cell SHALL be inert.

#### Scenario: Left and right cycle in opposite directions

- **WHEN** an empty non-immutable cell receives a left-button action, then
  another, then another
- **THEN** it passes one → zero → empty
- **AND** the same cell under three right-button actions passes zero → one →
  empty

#### Scenario: Immutable cells reject marking

- **WHEN** a marking action targets an immutable clue cell
- **THEN** `interpretMove` produces no move and the cell is unchanged

### Requirement: Unruly's keys place and clear at the cursor

A keyboard cursor SHALL move within the grid. At the cell under a shown cursor,
the `1` key SHALL place one, `0` or `2` SHALL place zero, and Backspace or
Delete SHALL clear the cell.

#### Scenario: A digit sets the cell under the cursor

- **WHEN** the cursor is shown on an empty non-immutable cell and `1` is pressed
- **THEN** a move places one in that cell
