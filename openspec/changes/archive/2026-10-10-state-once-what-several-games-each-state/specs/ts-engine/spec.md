## ADDED Requirements

### Requirement: A move a save holds keeps replaying

A save holds each move as its game wrote it: what `serializeMove` returns, or
the move itself where the game has no such hook. A game that renames a move's
field, changes what a field means or stops making a kind of move SHALL keep
reading the earlier shape, in `deserializeMove` or in `executeMove`, so a save
written before the change still loads. Ceasing to read one is a compatibility
decision that SHALL go to the owner beforehand, with its cost stated.

#### Scenario: A move's field is renamed

- **WHEN** a game renames a field its move carries, and a save written before
  the rename is loaded
- **THEN** the game reads the old name as the new one, and the save opens at
  the position it was saved at

#### Scenario: A kind of move the game no longer makes

- **WHEN** a game's input stops producing a kind of move that saves already
  hold
- **THEN** `executeMove` still plays that kind from a save

## MODIFIED Requirements

### Requirement: A candidate note that excludes the answer is a mistake

Where a game whose state carries candidate or pencil notes reports them as
mistakes, a non-empty candidate set that excludes the cell's unique-solution
value SHALL be the contradiction it reports, and a set that merely holds extra,
non-solution candidates SHALL NOT be reported. The answer such a game checks
against SHALL come from what the puzzle fixes, its clues and givens or the
answer the board hides, and never from anything the player has entered,
whether a placement or a note.

#### Scenario: A candidate annotation that excludes the solution is a mistake

- **WHEN** such a game reports mistakes on a state where an undecided cell's
  non-empty candidate set excludes that cell's unique-solution value
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose candidate set still holds the solution value, with or
  without extra candidates, is not included
- **AND** Check & save refuses to quick-save the board while such a cell
  exists, as it refuses a wrong placed value

#### Scenario: A wrong placement is not evidence

- **WHEN** the player has placed a wrong value, and a neighboring cell's notes
  hold its true value and leave out the one the wrong placement would force
- **THEN** the placed cell is reported and the neighbor's notes are not
