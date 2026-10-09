## ADDED Requirements

### Requirement: A canceled press leaves the game as it was before the press

The midend SHALL keep, at every pointer press, the `Ui` as it is and its place
in the history, and on `cancelPress` SHALL put both back. No move the gesture
made SHALL remain, the moves that were ahead of the press for Redo SHALL be
back, and the `Ui` SHALL be what it was just before the press, restored in
place. A cancel that takes a move back SHALL drop a stored hint plan, as Undo
does.

#### Scenario: A press is canceled where it was made

- **WHEN** a press the game claimed is canceled before the pointer moves
- **THEN** the board, the history and the `Ui` are what they were before the
  press

#### Scenario: A drag is canceled after it has moved

- **WHEN** a press the game claimed is dragged a tile away and then canceled
- **THEN** the board, the history and the `Ui` are what they were before the
  press, and no move is made toward any edge of the board

#### Scenario: A press that made its move is canceled

- **GIVEN** a game that makes its move on the press, and a board with a move
  undone and waiting for Redo
- **WHEN** a press there is canceled
- **THEN** the move it made is gone and Redo still brings back the undone one

### Requirement: A game hears nothing of a cancel

A game SHALL NOT hear of a cancel through `interpretMove`, as a drag, a release
or a button code, and SHALL write nothing for one. A `Ui` that holds an object
the engine cannot copy SHALL be refused by name at the press, never copied
wrongly.

#### Scenario: Every game is covered by being a game

- **WHEN** the cross-game guard presses and cancels across each registered
  game's board, moved and unmoved, with both buttons
- **THEN** no game is left other than it was, and the guard says how many
  presses it canceled in each

#### Scenario: A Ui holds a Date

- **WHEN** a game's `Ui` holds an object whose content is not its own
  properties, and a pointer press arrives
- **THEN** the press throws, naming the kind of object

### Requirement: A cancel with no press open changes nothing

A press SHALL stop being open at its release, and when anything other than the
gesture's own pointer events replaces the state or writes the `Ui`. A cancel
with no press open SHALL change nothing.

#### Scenario: The board changed under the press

- **WHEN** a press is open, the player undoes a move, and the press is then
  canceled
- **THEN** the cancel changes nothing

#### Scenario: The press was released

- **WHEN** a press is released and a cancel arrives after it
- **THEN** the cancel changes nothing
