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
reach, SHALL either say in words why no other run or number can fill it, as
"Ascent's hint follows a run and names the close rival" sets out, or name that
run and stripe every square it can reach. A step whose move fills in more than
its own square SHALL end the plan. The hint SHALL refuse on a solved board and
while `findMistakes` reports anything, and a step SHALL be followed by placing
its number in its square by any gesture.

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
  reach it, and its sentence does not give the reason in words
- **THEN** the sentence names the run and its placed ends, the run's ends are
  outlined, and every square the run can reach is striped, the filled square
  among them

### Requirement: Ascent's hint follows a run and names the close rival

After a hint step places a number in a run of missing numbers, the plan SHALL
ask the same techniques about that run alone, none harder than the technique
that placed the first number, and when that fills the run SHALL present the
placements as one journey, each leg with its own sentence. The plan's length
cap SHALL NOT split such a journey. A step placing a number because only its run
can reach the square SHALL, when straight reach rules out every other run and
the step counts to its own run's ends rule out every other number of it, say
so in words, outlining the ends it names: when exactly one other run comes
within two steps of the square, or none does, it SHALL say which rival fails
and why, with the counts; when that runs past 120 characters or several runs
come close, and the run has more than one number, it SHALL say that no other
run can reach the square, with the counts, and outline only the counts' ends.
Otherwise it SHALL stripe its run's reach.

#### Scenario: A forced run arrives as one hint

- **WHEN** a step places a run's first number and the same techniques then fill
  the rest of the run
- **THEN** the rest follows as legs of the same journey, and none uses a harder
  technique than the first

#### Scenario: The one close rival is named

- **WHEN** a square only one run can reach has exactly one other run within two
  steps of it
- **THEN** the step names that run and why it falls short, with the step counts
  that single out the number

#### Scenario: Several close rivals give way to the counts

- **WHEN** a square only one run of several numbers can reach has two or more
  other runs within two steps of it, and the step counts to the run's ends
  single out the number
- **THEN** the step says that no other run can reach the square and gives those
  counts, outlines the placed numbers they count from, and stripes nothing
