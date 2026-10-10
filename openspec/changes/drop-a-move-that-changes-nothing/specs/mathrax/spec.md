## MODIFIED Requirements

### Requirement: Mathrax input and keypad

Mathrax SHALL be played with the Solo-style control scheme: a cell is selected
by left-click or cursor, for ink outside pencil mode and for pencil marks in
it; digit keys enter a value or toggle a pencil mark; and backspace, space or
zero clear. Immutable given cells SHALL NOT be editable. The on-screen keypad
SHALL offer the digits 1 to the grid size and a clear key.

#### Scenario: A digit is entered into a selected cell

- **WHEN** an empty mutable cell is selected and a digit within range is typed
- **THEN** that digit is placed in the cell

#### Scenario: A given takes no entry

- **WHEN** the cursor is on a given cell and a different digit is typed
- **THEN** no move is made
