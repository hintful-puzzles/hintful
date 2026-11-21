## ADDED Requirements

### Requirement: Look: Dominosa draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for (`Game.rules`): the ground of each domino placed more than once
(the clash), and the number of each square that no domino can cover any
more, its every side barred or against another domino, and of each square of
a spot whose domino has no spot left to go. A domino keeps its own number
color where its ground is the error color.

#### Scenario: A square barred on every side

- **WHEN** the player draws a barrier on each side of an open square
- **THEN** its number is drawn red

#### Scenario: The same domino twice

- **WHEN** the player places two dominoes of the same pair of numbers
- **THEN** both are drawn on the error color
