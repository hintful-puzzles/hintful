## MODIFIED Requirements

### Requirement: A Sticks hint names the clue a tentative line would break, and how

A step's explanation SHALL name **which clue** the tentative line would break
and **how** it would break it, distinguishing at least: a line exceeding its
number, a line that could no longer reach its number, a line covering two
numbers, a block's clue gaining more lines than it counts, and a block's clue
losing a side it still needed.

#### Scenario: A forced line is explained by the clue it would break

- **WHEN** a hint is requested on a board where one orientation of a square
  would violate a clue
- **THEN** the step names that clue and the way the tentative line breaks it,
  and concludes that the square must take the other orientation
