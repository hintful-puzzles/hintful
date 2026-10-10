## MODIFIED Requirements

### Requirement: A UI-only input redraws without a history entry

`interpretMove` SHALL be able to report a UI-only change, cursor or other UI
state changed in place, distinctly from a move and from nothing having
happened. On a UI-only result the midend SHALL redraw and notify without
creating a history entry; on nothing having happened it SHALL claim nothing
and announce nothing, unless what the `Ui` shows has changed; on a move it
SHALL apply the move to the history, unless the move left the board as it was.

#### Scenario: A UI-only input redraws without a history entry

- **WHEN** input changes only UI state, such as moving a keyboard cursor
- **THEN** the engine redraws and emits a state notification
- **AND** undo offers no extra step for that input

## REMOVED Requirements

### Requirement: A `Ui` changed under "nothing happened" is painted

**Reason**: It left the input unclaimed and held each game to answer a change
of what is painted as a UI-only change, which seven games did not. The midend
answers for the game.

**Migration**: "An input that changes what the `Ui` shows is a UI-only
change" states what is claimed, and keeps the repaint of a `Ui` changed where
nothing shows.

## ADDED Requirements

### Requirement: An input that changes what the `Ui` shows is a UI-only change

Where `interpretMove` answers that nothing happened and what the `Ui` shows
has changed, the midend SHALL treat the input as a UI-only change: claimed,
announced and painted. A part of the `Ui` hidden before and after shows the
same wherever it sits. Where only such a part changed, the midend SHALL ask
for a repaint, claim nothing and announce nothing. A game writes nothing for
this, and the suite SHALL assert over every registered game that no input
left unclaimed changes the frame.

#### Scenario: A press that hides the cursor and is declined

- **WHEN** a game hides its shown cursor on a press and answers that nothing
  happened
- **THEN** the press is claimed, a transition is announced, and the cursor is
  gone from the next frame

#### Scenario: A declined press that parks a hidden cursor

- **WHEN** a game moves its hidden cursor to the pressed square and answers
  that nothing happened
- **THEN** the press is not claimed and no transition is announced
- **AND** a repaint is asked for

#### Scenario: A declined input that touched nothing

- **WHEN** a game answers that nothing happened and its `Ui` is as it was
- **THEN** the input is not claimed and no repaint is asked for

#### Scenario: A hint's drag from a press the midend claimed

- **WHEN** a hint's gesture drags from a press the game answered nothing to
  and that changed what its `Ui` shows
- **THEN** the drag and its release are played, as the view tracks that press
