## MODIFIED Requirements

### Requirement: Mathrax's reading of a description refuses a malformed one

The reading `newState` builds a board from SHALL refuse a description whose
grid part carries more squares than the grid holds, that contains a digit
larger than the grid size, that uses an unknown character, that names an
unknown clue or a clue number outside what that clue can show on a board of
that size, or whose grid or clue part stops short of covering the grid.

#### Scenario: An out-of-range digit is rejected

- **WHEN** a description containing a given digit larger than the grid size is
  validated
- **THEN** it is rejected

#### Scenario: A clue number the board cannot show is rejected

- **WHEN** a description of a size-5 board carries an addition clue of 11
- **THEN** it is rejected

#### Scenario: A quotient of 1 is rejected

- **WHEN** a description carries a division clue of 1
- **THEN** it is rejected, because two equal cells are shown by the `=` clue,
  which is a difference of 0

### Requirement: Mathrax input and keypad

Mathrax SHALL be played with the Solo-style control scheme: a cell is selected
by left-click or cursor, for ink outside pencil mode and for pencil marks in
it; digit keys enter a value or toggle a pencil mark; and backspace, space or
zero clear. Immutable given cells SHALL NOT be editable. Entering the value
already present in a cell SHALL be a no-op. The on-screen keypad SHALL offer
the digits 1 to the grid size and a clear key.

#### Scenario: A digit is entered into a selected cell

- **WHEN** an empty mutable cell is selected and a digit within range is typed
- **THEN** that digit is placed in the cell

#### Scenario: A given takes no entry

- **WHEN** the cursor is on a given cell and a different digit is typed
- **THEN** no move is made

#### Scenario: A left-click in pencil mode

- **WHEN** pencil mode is on under the sticky pencil preference and the player
  left-clicks an empty cell and types a digit
- **THEN** the digit is toggled as a pencil mark in that cell
