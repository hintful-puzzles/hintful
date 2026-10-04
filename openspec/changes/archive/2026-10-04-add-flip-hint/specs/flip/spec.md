## ADDED Requirements

### Requirement: Flip's hint presses the shortest answer in reading order and says what forces each press

Flip's hint SHALL plan the presses of the solver's shortest answer in reading
order, one step a press, and SHALL say of each press before the last which of
two kinds it is. Where the press is the last square in reading order that
flips some dark square, the step SHALL say so as a deduction, naming the order
in its own words, ring the square to press, outline those dark squares, and
stripe and name every other square the press flips, so that no square the
press changes is left unmarked. Where every square the press flips is also
flipped by a later square, the step SHALL offer the press as one of the fewest
presses that light the board the step is shown on, saying how many that is,
and SHALL say there is only one way to light the board when no other set of
presses does. The last press SHALL say that it finishes the board, whichever
kind it is, and outline every other dark square. A step SHALL claim nothing
the code has not checked on the board the step is shown on.

The plan SHALL be the same plan after each of its presses: a hint asked again
once a step's square is pressed SHALL give the steps that were left, with the
same words. A board no set of presses lights SHALL be refused as a puzzle
whose solution cannot be determined.

#### Scenario: A press that is a dark square's last chance

- **WHEN** the hint's next press is the last square in reading order that
  flips a dark square, and is not the plan's last press
- **THEN** the step says that, row by row, only the ringed square can still
  light the outlined square, so it must be pressed
- **AND** every outlined square is dark and is flipped by no square after the
  ringed one
- **AND** every other square the press flips is striped, and the step says
  the press flips the striped ones too

#### Scenario: A press the order does not decide

- **WHEN** every square the hint's next press flips is also flipped by a later
  square, and the press is not the plan's last
- **THEN** the step outlines and stripes nothing, says how many presses the
  board takes and no fewer, and offers the ringed square as one of them
- **AND** it says there is only one way to light the board exactly when the
  board has one answer

#### Scenario: The last press

- **WHEN** one press is left in the plan
- **THEN** the step says pressing the ringed square lights the outlined
  squares and finishes the board
- **AND** the outlined squares are every dark square but the ringed one, and
  the press flips each of them

#### Scenario: Following the hint

- **WHEN** the player presses the square a step rings and asks again
- **THEN** the hint gives the steps that were left, unchanged
- **AND** following every step leaves the board solved in as few presses as
  any set of presses takes

#### Scenario: A hand-entered board with no answer

- **WHEN** a hint is asked on a board no set of presses lights
- **THEN** it refuses, saying the puzzle's solution cannot be determined
