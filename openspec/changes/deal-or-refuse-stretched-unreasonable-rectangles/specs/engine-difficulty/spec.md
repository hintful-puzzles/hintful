## ADDED Requirements

### Requirement: A board that comes solved is dealt again

Where a generator hands over a board that is solved before a move, the engine
SHALL deal again from the same random stream, and SHALL do so for every game
with no check in the game. Where a bounded run of deals all come solved, it
SHALL answer as for a generator that ran out of tries.

#### Scenario: A layout of one rectangle is not handed to the player

- **WHEN** a 3×3 Rectangles board is dealt and the generator's layout is a
  single rectangle, whose one number leaves nothing to draw
- **THEN** the board the player is handed is another, with a move to make

#### Scenario: A size whose every board comes solved finds no board

- **WHEN** every board a generator hands over at some parameters is solved
- **THEN** the player is shown the sentence for a deal that found no board,
  and the board in play stays
