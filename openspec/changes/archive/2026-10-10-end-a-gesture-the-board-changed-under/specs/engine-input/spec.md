## MODIFIED Requirements

### Requirement: The engine cancels a drag the board changed under

The midend SHALL end every `GridDrag` on a game's `Ui` whenever it replaces the
game state, the player's own move included. Membership SHALL be derived: the
midend finds a drag by what the `Ui` carries, never by a declaration. A game
that needs a drag to survive a state change SHALL say so in its own
`changedState`, with its reason recorded; the engine's cancel runs first.

#### Scenario: an undo lands while a drag is live

- **GIVEN** a live drag on a game that declares no `changedState`
- **WHEN** the player undoes a move
- **THEN** the drag is no longer running
- **AND** the game needed to declare nothing to get that

#### Scenario: a move is made by a key while a drag is live

- **GIVEN** a live `GridDrag` on a game that declares no `changedState`
- **WHEN** a key the player presses makes a move
- **THEN** the drag is no longer running
- **AND** the game needed to declare nothing to get that

## ADDED Requirements

### Requirement: A board change from outside the input ends the gesture in flight

The midend SHALL end the pointer gesture in flight when the state is replaced
by anything but the player's input: Undo, Redo, a restart, a hint's move,
Solve, a load, a new board. It SHALL do so for every game, whatever the game
holds the gesture in, a declared sweep included. The drags and the release
still to come SHALL reach no game, and the next press SHALL open a gesture as
any press does.

#### Scenario: an undo lands under a drag the engine cannot see

- **GIVEN** a game that holds its drag in fields of its own and declares no
  `changedState`, a move made, and a press dragged a tile away
- **WHEN** the player undoes the move and then releases
- **THEN** the release makes no move, and Redo still brings the move back
- **AND** the game needed to declare nothing to get that

#### Scenario: a sweep is under way

- **WHEN** a declared sweep has marked two targets, the player presses Undo
  with the pointer down, and drags on over a third
- **THEN** the third target is left as it was

### Requirement: An ended gesture leaves the Ui as before its press

When a board change ends a gesture, the midend SHALL put the `Ui` back to what
it was just before the press, as a cancel does, so that no preview of the
gesture stays in the frame. It SHALL keep the moves the gesture made before
the change, and SHALL tell the restored `Ui` of them through the game's
`changedState` before it tells it of the change. A press the midend no longer
holds SHALL be ended without the `Ui` put back.

#### Scenario: a preview is on screen when the board changes

- **WHEN** a drag has painted its preview and the player presses Undo
- **THEN** the frame is the one of the undone board with no gesture on it

#### Scenario: the press had made its move

- **GIVEN** a game that makes its move on the press
- **WHEN** a press there is held and the player presses Undo
- **THEN** the move is undone as any move is, and Redo brings it back

### Requirement: A move made by a key does not end the gesture in flight

A move the player makes with a key while a pointer is down SHALL NOT end the
gesture: a press that selected a cell is what the key types into, and the
selection SHALL stay where the press put it. Such a move SHALL close the open
press, so that a later cancel changes nothing.

#### Scenario: a digit is typed into a held cell

- **WHEN** the player presses a cell of a keypad game, and with the pointer
  still down types a digit
- **THEN** the digit is entered in the pressed cell and the highlight stays on
  it

### Requirement: A gesture the board changed under is guarded in every game

A cross-game guard SHALL, for every registered game, press each probe point
with each button, held and dragged, change the board under it by an Undo and
by a Redo, and send the rest of the gesture. It SHALL fail where a move is made
after the change, where a sweep is left open, or where the `Ui` is not the one
from before the press told of the same boards, and SHALL say how many gestures
it changed the board under in each game.

#### Scenario: a game holds its drag where the engine cannot see it

- **WHEN** a game is registered whose drag is held in fields of its own
- **THEN** the guard covers it with nothing written for it

#### Scenario: no drag was reached in a game

- **WHEN** the probe changes the board under no dragged gesture in some game
- **THEN** the guard fails and names the game
