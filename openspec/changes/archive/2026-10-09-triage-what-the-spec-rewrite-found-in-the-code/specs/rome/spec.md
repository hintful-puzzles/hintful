## MODIFIED Requirements

### Requirement: An input that changes nothing adds no history

A press on a fixed clue, a press outside the grid, a placement that repeats
the existing arrow, or a clear of a square with nothing to clear SHALL produce
no state change and no history entry. The line round the grid belongs to the
square it bounds, and the margin beyond that line is outside the grid, for a
press and for the release that ends it alike.

#### Scenario: A fixed clue cannot be grabbed

- **WHEN** a square holding a fixed arrow is pressed
- **THEN** no move is made and the board is unchanged

#### Scenario: A tap in the margin beside the first column

- **WHEN** a press and release land left of the grid's outline, level with a
  row whose first square is empty
- **THEN** nothing is grabbed, and no arrow is placed in that square

#### Scenario: Clear where there is nothing to clear

- **WHEN** Clear is pressed on a selected square with no arrow, or in notes
  mode on one with no marks, or Space is pressed while placement is armed on
  a square with no arrow
- **THEN** no move is made and Undo gains nothing

### Requirement: A tap that commits no move selects the square

A press and release on one square that commits no move SHALL act on the
selection as a press does in every note-taking game, in both modes: it selects
that square, a second tap on the selected square puts the highlight away, and
the highlight shows only where the mode could write. Rome's keys act at the
keyboard cursor, and a player without a keyboard has no other way to put it
anywhere. A tap that does commit a move SHALL NOT select: with notes mode off,
a tap on a square holding the player's arrow clears that arrow.

#### Scenario: A tap that commits nothing still selects

- **WHEN** a press and release land on the same empty square, in either mode
- **THEN** no move is made and the cursor is left on that square

#### Scenario: A tap on the player's own arrow

- **WHEN** notes mode is off and a press and release land on a square holding
  an arrow the player placed
- **THEN** the arrow is cleared and no square is left shown as selected

#### Scenario: A second tap on the selected square

- **WHEN** an empty square is tapped twice with the left button
- **THEN** the second tap makes no move and puts the highlight away

#### Scenario: A notes-mode tap on a square holding an arrow

- **WHEN** notes mode is on and a square holding an arrow is tapped
- **THEN** no move is made, and the cursor moves to that square without being
  shown, since a square holding an arrow takes no marks
