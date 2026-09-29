## ADDED Requirements

### Requirement: Rectangles offers an explained hint that reads only the board

Rectangles SHALL offer a hint whose every step draws one rectangle or one line
and says why it is forced, reasoning only from the clues and the lines drawn.
A clue's fits are the rectangles of its area that contain it, stay on the
board, take in no other clue and cross no drawn line. A step SHALL be one of:
a clue with one fit; a square only one clue's fits reach, with one of those
fits covering it; squares every fit of another clue covers, leaving a clue one
fit that avoids them; a fit that would leave another clue no fit or a square no
fit covers, when one fit remains; or an edge no fit straddles, drawn as a line.
The rectangle a step draws SHALL be ringed as the contour of its squares, and
the hint SHALL refuse on a board with a wrong line.

#### Scenario: A clue with one fit

- **WHEN** every other rectangle of a clue's area around it runs off the board,
  takes in another clue or crosses a line
- **THEN** the hint rings the one that fits and names what rules out the others,
  outlining any clue it would take in

#### Scenario: The player draws the rectangle a side at a time

- **WHEN** the displayed step draws a rectangle and the player draws one of its
  sides
- **THEN** the step stays displayed, and it completes when the last side is
  drawn

### Requirement: Rectangles deals only boards its hint can finish

With `unique` set, the generator SHALL deal only boards the hint's steps finish
from an empty board, dealing again where a board it laid out would leave them
short. Such a seed's desc SHALL differ from upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator lays out a uniquely solvable board the hint's steps
  cannot finish
- **THEN** it draws another board instead of returning that one
