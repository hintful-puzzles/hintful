## MODIFIED Requirements

### Requirement: A UI-only input redraws without a history entry

`interpretMove` SHALL be able to report a UI-only change, cursor or other UI
state changed in place, distinctly from a move and from nothing having
happened. On a UI-only result the midend SHALL redraw and notify without
creating a history entry; on nothing having happened it SHALL claim nothing
and announce nothing; on a move it SHALL apply the move to the history, unless
the move left the board as it was.

#### Scenario: A UI-only input redraws without a history entry

- **WHEN** input changes only UI state, such as moving a keyboard cursor
- **THEN** the engine redraws and emits a state notification
- **AND** undo offers no extra step for that input

## ADDED Requirements

### Requirement: A move that leaves the board as it was is no step of the history

The midend SHALL compare the state a player's move returns with the state
before it, part for part, and SHALL NOT record a move that leaves it the same.
It SHALL answer that input as a UI-only change, after the game's
`changedState`, with no animation. A game writes nothing for this. A state that
differs only where no frame shows it has changed, and its move is a step. A
move replayed from a save or through `playMoves` SHALL be recorded as written.

#### Scenario: An erase key on an empty square

- **WHEN** a game answers the erase key on an empty square with a move that
  empties the square
- **THEN** the input is claimed and the frame repainted, the move counter
  stays where it was, and the moves ahead of the cursor are kept for Redo

#### Scenario: A drag passes over a mark that changes nothing

- **WHEN** a drag marks one square, passes a square its mark leaves as it was,
  and marks a third
- **THEN** the two marks that changed the board are one step of Undo

#### Scenario: A drag whose first mark changes nothing

- **WHEN** a move is in the history, and a drag's first mark leaves the board
  as it was and its second changes it
- **THEN** one Undo takes back the drag and leaves the earlier move

#### Scenario: A save holds such a move

- **WHEN** a save whose move log holds a move that left the board as it was is
  loaded
- **THEN** it loads with every move where the save has it, and saves again as
  it was

#### Scenario: A hint asks for such a move

- **WHEN** the gesture of a hint's step makes only a move that leaves the
  board as it was
- **THEN** the step never completes, and the hint is thrown as the game's
  defect

### Requirement: A `Ui` changed under "nothing happened" is painted

Where `interpretMove` answers that nothing happened and has changed the `Ui`,
the midend SHALL ask for a repaint, so the frame on screen is never one the
`Ui` has moved on from. The input SHALL still be reported as not claimed, and
no transition SHALL be announced. An input that changes what is painted is a
UI-only change, and the game SHALL answer it as one.

#### Scenario: A press that hides the cursor and is declined

- **WHEN** a game hides its shown cursor on a press and answers that nothing
  happened
- **THEN** the cursor is gone from the next frame, and the press is not
  claimed

#### Scenario: A declined input that touched nothing

- **WHEN** a game answers that nothing happened and its `Ui` is as it was
- **THEN** no repaint is asked for
