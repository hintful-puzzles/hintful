## ADDED Requirements

### Requirement: A Magnets count premise shows why the rest of its line is ruled out

A Magnets hint step whose premise counts the squares of a line still able to take
a pole SHALL name, in board terms, why each other empty square of that line
cannot take it: a + (or −) there would touch its own kind or overfill the
square's row or column, or its domino's other end would then hold the opposite
pole beside its own kind or one too many in a line, named by where that line lies
from the counted one ("this column", "the column beside it", "a row"). The
step's evidence SHALL be those ruled-out squares and what rules each out (the
placed pole it touches, or the met line's clue digit), not the rest of the line,
and its targets SHALL be only the squares that take the pole.

A domino lying along the line SHALL say in its own leg why its far end cannot
take the pole, read off the board with the journey's earlier legs placed, and no
earlier leg SHALL ring it before that board forces it.

#### Scenario: The owner's playtest board

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom domino neutral
- **THEN** its first step says a + anywhere else in the third column would put
  one − too many in the column beside it, outlines the two dominoes ruled out and
  nothing else, and marks the second column's − clue as the reason

#### Scenario: A leg forced by the leg before it

- **WHEN** a count premise places a domino lying along its line whose far end
  loses the pole only to an earlier leg's placement
- **THEN** no step before that leg rings it, and its own step names the pole
  the earlier leg placed as the reason
