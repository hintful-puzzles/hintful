## MODIFIED Requirements

### Requirement: Ascent explains the next number

The game SHALL implement `hint` so that every step places one number, and every
fact a step rests on is a number, a wall or an arrow on the board: the reading
each technique reasons from SHALL be rebuilt from the player's board, through the
solver's own rungs, before every step, and SHALL NOT read lines the player drew.
The techniques, easiest first by their tier in the board's grid mode, SHALL be:
a number next to its placed neighbors in the sequence; a number within reach of
the nearest placed numbers below and above it; a dead end, a square the path can
enter from one neighbor only, holding an end of the path; a square only one run
of missing numbers can reach, and only one number of that run; and the same two
readings with reach counted along routes of empty squares. No step SHALL use a
technique above the board's tier. Each step SHALL say why its number is forced
in one sentence of at most 120 characters, naming numbers by value; SHALL ring
the square it fills without drawing the number; SHALL outline the numbers and
squares it reasons from, in square and hexagonal cells alike; SHALL stripe an
arrow's line when the sentence names it; and, for a square only one run can
reach, SHALL name that run and stripe every square it can reach. A step whose
move fills in more than its own square SHALL end the plan. The hint SHALL refuse
on a solved board and while `findMistakes` reports anything, and a step SHALL be
followed by placing its number in its square by any gesture.

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

#### Scenario: A square only one run can reach shows that run's reach

- **WHEN** a step fills a square because only one run of missing numbers can
  reach it
- **THEN** the sentence names the run and its placed ends, the run's ends are
  outlined, and every square the run can reach is striped, the filled square
  among them
