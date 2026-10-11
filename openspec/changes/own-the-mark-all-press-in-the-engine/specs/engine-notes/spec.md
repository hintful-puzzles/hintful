## REMOVED Requirements

### Requirement: The Mark-all action is the M key

**Reason**: The press was a letter each game read for itself, and a letter is a
value in some games: the control typed 22 into a Solo square, and Group had to
refuse small `m` on every board.

**Migration**: "The Mark-all press is the engine's, from the game's hook".

## ADDED Requirements

### Requirement: The Mark-all press is the engine's, from the game's hook

A game with the action SHALL give its move as a `markAll` hook, and SHALL NOT
read a key for it. The engine SHALL make that move for the control's own
button code, which is no letter, and the app shell SHALL show the control
exactly when the game has the hook and send that code.

#### Scenario: The control is pressed with a cell selected

- **WHEN** a cell is selected on a board where `M` is a value, and the player
  activates the control
- **THEN** the game's mark-all move is made, and nothing is entered in the cell

#### Scenario: A game without the hook

- **WHEN** the control's code reaches a game with no `markAll`
- **THEN** it is declined, and the game's `interpretMove` is not asked

### Requirement: The letter M is Mark-all where the board has no M key

The engine SHALL make the game's mark-all move for `M` or `m` on a board whose
keypad has no key for that letter. Where the keypad has one, the letter SHALL
go to the game as any other key does, and the control alone marks all.

#### Scenario: A small m on a board without one

- **WHEN** `m` is pressed on a Group board of six elements
- **THEN** every empty cell with no notes is filled with its candidates

#### Scenario: M on a board that types with it

- **WHEN** `M` is pressed on a board whose keypad has an M key
- **THEN** the game is offered the key, and no mark-all move is made for it
