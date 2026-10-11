## ADDED Requirements

### Requirement: A hint step changes what the board draws

Every step of a hint's plan, reached by following the plan from the board it
was made for, SHALL change what the board draws: the frame with no hint on
display, or the frame with that step on display. A change to the state that
neither frame shows is not one. The cross-game walk SHALL hold every hinted
game to it on the boards it walks.

#### Scenario: A link the board already holds

- **WHEN** a plan's step asks for a move that leaves both frames as they were,
  as a Signpost link between two numbers the board has already linked
- **THEN** the walk fails on that step, naming the board and the sentence

#### Scenario: A mark shown only for the square in focus

- **WHEN** a step rules a set out of a Subsets cell, which the tally strikes
  through only while that cell is looked at
- **THEN** the step passes, since the frame with the step on display changes
