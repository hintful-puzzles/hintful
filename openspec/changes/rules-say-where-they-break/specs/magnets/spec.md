## MODIFIED Requirements

### Requirement: Look: A Magnets mistake is drawn apart from the live errors

The renderer SHALL overlay the cells `findMistakes` flags distinctly from the
live error highlighting. That highlighting SHALL always be on, in red, where
the board breaks a rule (`Game.rules`): two touching identical poles, and a
clue whose count is exceeded, or can no longer be reached by the undecided
squares left in its line.

#### Scenario: A live error needs no check

- **WHEN** the player places two `+` poles side by side
- **THEN** both are drawn as errors at once, with no mistake check asked for

#### Scenario: A count with too little room is red

- **WHEN** a line's undecided squares are too few for its `+` count
- **THEN** the count is drawn red while the line still has open squares
