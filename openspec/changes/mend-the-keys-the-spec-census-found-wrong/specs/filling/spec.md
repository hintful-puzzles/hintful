## MODIFIED Requirements

### Requirement: Enter starts and ends a Filling keyboard drag

With the cursor shown, Enter SHALL start a keyboard drag and add the cursor's
square to the selection, and while the drag lasts every square an arrow moves
the cursor onto SHALL join the selection. A second Enter SHALL end the drag
and keep the selection, and Space, Escape, a pointer press and a key that
fills or erases SHALL end it too; a digit too large for the board SHALL NOT.
A clue SHALL NOT join the selection. With the cursor hidden, Enter SHALL only
show it.

#### Scenario: Three squares filled from the keyboard

- **WHEN** the cursor is shown on the first of three empty squares in a row,
  Enter is pressed, the Right arrow is pressed twice and `3` is typed
- **THEN** one move writes 3 in all three squares, and nothing is selected

#### Scenario: The drag passes over a clue

- **WHEN** a keyboard drag moves the cursor across a clue and on to the empty
  square beyond it
- **THEN** the squares on either side of the clue are selected and the clue is
  not

#### Scenario: A press ends the drag

- **WHEN** a keyboard drag is on, the player clicks a square, and then presses
  an arrow
- **THEN** the clicked square alone is selected, and the square the cursor
  moved onto is not
