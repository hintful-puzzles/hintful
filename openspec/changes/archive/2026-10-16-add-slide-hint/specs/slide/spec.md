## ADDED Requirements

### Requirement: Generation: Slide deals only boards its hint can search

The generator SHALL count a board past the hint's search budget, measured in
positions, as unsolvable, so the hint's search finishes from every dealt
board's opening.

#### Scenario: The opening is within reach

- **WHEN** a Slide board is dealt
- **THEN** the hint's search from it finishes within its budget

### Requirement: Hint: Slide has a hint that says why its move is the one to make

Slide SHALL have a hint. Each step SHALL offer a move on a shortest line to
the exit, ring the block it moves, stripe where it goes, and say what the
move is for: the later move that needs the room it makes, outlining that
block, or for the key block, the fewest moves left from where it lands. A
request SHALL offer the moves up to and including the key block's next one.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Slide board
- **THEN** a step rings a block, stripes where it goes, and says what the
  move makes room for

#### Scenario: Room made is room needed

- **WHEN** a step says its move makes room for the outlined block
- **THEN** that block has a later move in the plan which cannot be made if
  this move is left out

#### Scenario: The key block's count is the fewest

- **WHEN** a step moves the key block and says it can be out in N moves
- **THEN** N is the fewest moves to the exit from the board the move leaves

## MODIFIED Requirements

### Requirement: Solver: Solve plays a shortest route from the current position

Solve SHALL play a shortest route from the current position to the exit, not
from the board as dealt. Where the current position is past the search's
budget, Solve SHALL play a shortest route from the board as dealt, starting
over from it.

#### Scenario: Solve after the player has moved

- **WHEN** Solve is requested after the player has moved several blocks
- **THEN** the route played is legal from the board as it stands, and it ends
  with the main block on the target

#### Scenario: Solve from past the search's reach

- **WHEN** Solve is requested from a position the search cannot finish within
  its budget
- **THEN** the board starts over from the deal and plays a route from there
  that ends with the main block on the target
