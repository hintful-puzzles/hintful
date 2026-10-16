## ADDED Requirements

### Requirement: Hint: Twiddle's hint puts the tiles in place in reading order

Twiddle SHALL have a hint, in every variant of its params. Each step SHALL
offer one turn, ring the block it turns, outline the tile it serves, and say
what the turn does for that tile. A run of turns that moves finished tiles and
puts them back SHALL be one journey, whose first step says what the run does.
A hint asked again after any hinted turn SHALL lead on to the solved board.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Twiddle board
- **THEN** a step names a turn, rings its block, and says which tile it puts
  in place or carries toward its place

#### Scenario: A hint asked partway through a run

- **WHEN** a player plays the first turns of a run and asks for a hint again
- **THEN** the hint puts the finished tiles back as it goes on
