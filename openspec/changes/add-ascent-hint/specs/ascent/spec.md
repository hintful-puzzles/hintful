## MODIFIED Requirements

### Requirement: Ascent game implements the Game interface

The engine SHALL provide `src/games/ascent/` implementing the `Game`
interface for Ascent (Hidoku), registered so the puzzle is served by the
TypeScript engine.

Parameters SHALL be a width, a height, a difficulty (Easy, Normal, Tricky or
Hard), a grid mode (Rectangle, Rectangle-no-diagonals, Hexagon, Honeycomb or
Edges), and the booleans "remove start and end points" and "symmetrical clues".
Validation SHALL require width and height between 2 and 50 with area under 1000,
SHALL require an odd height and a width greater than half the height for Hexagon
mode, and SHALL forbid a 2×2 Edges grid, an Edges difficulty below Normal, and
symmetrical clues in Edges mode — matching upstream. A game ID SHALL encode every
parameter and round-trip through decode.

Because Ascent is a unique-solution logic puzzle, it SHALL implement `findMistakes`
and an explained hint.

#### Scenario: Every preset produces a uniquely soluble board

- **WHEN** a new game is generated for any preset or legal size and mode
- **THEN** a board is produced whose clues admit exactly one completion under the
  graded solver

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, difficulty, grid mode and clue flags are
  recovered

## ADDED Requirements

### Requirement: Ascent explains the next number

The game SHALL implement `hint` so that every step places one number, and every
fact a step rests on is a number, a wall or an arrow on the board: the reading
each technique reasons from SHALL be rebuilt from the player's board, through the
solver's own rungs, before every step, and SHALL NOT read lines the player drew.
The techniques, easiest first by their tier in the board's grid mode, SHALL be:
a number next to its placed neighbors in the sequence; a number within reach of
the nearest placed numbers below and above it; a dead end, a square the path can
enter from one neighbor only, holding an end of the path; a square only one
missing number can reach; and the same two readings with reach counted along
routes of empty squares. No step SHALL use a technique above the board's tier.
Each step SHALL say why its number is forced in one sentence of at most 120
characters, naming numbers by value; SHALL ring the square it fills without
drawing the number; SHALL outline the numbers and squares it reasons from, in
square and hexagonal cells alike; and SHALL stripe an arrow's line when the
sentence names it. A step whose move fills in more than its own square SHALL end
the plan. The hint SHALL refuse on a solved board and while `findMistakes`
reports anything, and a step SHALL be followed by placing its number in its
square by any gesture.

#### Scenario: Following the hint finishes the board

- **WHEN** the player follows every hint step from a newly generated board, in
  any grid mode, tier or option
- **THEN** the board is solved and no step placed a wrong number

#### Scenario: A dead end names the path's end

- **WHEN** an empty square has only one neighbor the path can still enter it
  from, and only one end of the path can be there
- **THEN** the step places that end, and says whether the other end is placed,
  out of reach, or pointed elsewhere by its arrow

#### Scenario: A step stays within the board's tier

- **WHEN** a hint is asked on a board generated at a tier
- **THEN** no step uses a technique belonging to a harder tier in that grid mode
