## ADDED Requirements

### Requirement: A born game's cells may take candidate notes

A born game's description SHALL be able to give its cells candidate notes,
and the engine SHALL then carry them as the hand-written games with notes do:
the player sets and strikes a note on a cell, marks every cell's candidates
at once, and enters a value from the keypad, and the hint reads the notes as
facts and teaches by setting and striking them. A game whose description
gives no notes SHALL play as before.

#### Scenario: A note struck by the hint is struck on the board

- **WHEN** a born game with notes is hinted on a board whose notes the
  mistake check vouches for, and the step rules out a value from a cell
- **THEN** the step strikes that value's note from the cell, and the cell
  keeps its other notes

#### Scenario: A game without notes is unchanged

- **WHEN** a born game whose description gives no notes is played
- **THEN** no note can be set on its cells, and its keypad and its hint are
  those it had before this change
