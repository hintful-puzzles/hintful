## ADDED Requirements

### Requirement: A Black Box description holds each ball once, and as many as the params allow

A description SHALL be lowercase hex digits alone, four for the board's size
and four for each ball. `newState` SHALL refuse as too short one with fewer
balls than `minballs`, or one cut off part-way through a ball the board has
room for; as too long one with more balls than `maxballs`; and SHALL refuse
one that puts two balls on one square.

#### Scenario: A dealt board of three balls

- **WHEN** `97338cfbf66d3b90` is opened under `w5h5m3M3`
- **THEN** it is a 5×5 box holding three balls
- **AND** with its last four digits taken off it is refused as too short
- **AND** with its sixth digit written `C` it is refused for that character

### Requirement: A primary press on the edge fires a laser, or shows again one already fired

A primary press on a square round the edge SHALL fire the laser that enters
there. On a laser already fired it SHALL make no move and SHALL draw that
laser's result in the flash color, at the square pressed and at the other end
of a laser that came out: while the button is held, or for a moment when a
key made the press. On a revealed board a press on an unfired laser, or
inside the box, SHALL do nothing.

#### Scenario: A laser that hit is pressed again

- **WHEN** the player presses the mouse button on an edge square that shows
  `H`
- **THEN** no move is made, and the `H` is drawn in the flash color until the
  button is let go

### Requirement: The corner button checks the guess while the ball count allows it

The top-left corner SHALL be a target only while the guessed balls number
from `minballs` to `maxballs`, the board is not revealed, and the last move
was not a check that failed. A primary press there SHALL make the verify
move and bring a showing keyboard cursor back to the box's first square; a
secondary press there SHALL do nothing. The cursor SHALL walk the box and the
squares round its edge, and no corner but that one while it is a target.

#### Scenario: The button comes and goes with the count

- **WHEN** the third ball is guessed on a 5×5 board of three balls
- **THEN** the corner takes the cursor and a press
- **AND** after a check that fails it takes neither until another move is made

### Requirement: A secondary press marks a square known, or its whole row or column from the edge

A secondary press on a square inside the box SHALL toggle its known mark,
whether or not it holds a guessed ball. On a square round the edge it SHALL
make the line-lock move for the line that square looks into: the column from
the top or the bottom edge, the row from the left or the right.

#### Scenario: A column marked from above

- **WHEN** the player right-clicks the edge square above the third column
- **THEN** the move is the line lock of the third column

### Requirement: A Black Box drag repeats a ball or a mark inside the box and fires nothing

The game's sweep SHALL cover the squares inside the box alone, and SHALL
compare a square's guessed ball and its known mark together. A drag that
starts inside SHALL repeat its press on each inside square it passes that
holds what the pressed one held, and SHALL pass over the edge. A drag that
starts on the edge SHALL repeat nothing, since a laser is a move and not a
mark.

#### Scenario: A drag of balls runs out onto the edge

- **WHEN** the player presses an empty square inside the box, which guesses a
  ball there, and drags across an empty square, a square marked known, and
  out onto the edge
- **THEN** the empty square takes a ball, the known one is left as it was, and
  no laser is fired

### Requirement: Black Box's status bar counts the balls marked and says when to check

On an unrevealed board `statusbarText` SHALL read "Wrong! Guess again." after
a check that failed, until the next move; else "N too many balls marked."
when more balls are guessed than `maxballs`; else "Click button to verify
guesses." when the count is within the range; else "Balls marked: N / M",
or "Balls marked: N / min-max." for a board with a range. The session's
errors SHALL follow in brackets, as "(1 error)" or "(N errors)".

#### Scenario: Guessing up to the count and past it

- **WHEN** one ball is guessed on a 5×5 board of three balls, then three, then
  four
- **THEN** the bar reads "Balls marked: 1 / 3", then "Click button to verify
  guesses.", then "1 too many balls marked."
- **AND** after a first check that fails it reads "Wrong! Guess again. (1
  error)"
