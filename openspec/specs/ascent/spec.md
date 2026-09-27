# ascent Specification

## Purpose
Ascent, the puzzle of placing numbers so that each stands next to its successor
and together they form one path from 1 to the highest, on square or hexagonal
grids and in an Edges mode clued by arrows around the board. This capability
specifies its port to the TS engine, with difficulty tiers graded honestly
against its four-tier deductive solver.

## Requirements

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

### Requirement: Ascent descriptions use the upstream run-length encoding

An Ascent description SHALL encode the padded grid in row-major order: a placed
number as its decimal value (with a separator between two adjacent numbers), a run
of empty cells as a lower-case letter count, and a run of wall cells as an
upper-case letter count, repeating the maximal letter for runs longer than 26. In
Edges mode the arrow clues SHALL be encoded as ordinary numbers on the border
ring, and re-tagged as edge clues on decode.

The physical grid the description covers SHALL be the user-facing size adjusted
for the mode (Honeycomb widened, Edges bordered by two cells on each axis).
Validation SHALL reject a description whose highest number exceeds the cell count,
and SHALL distinguish a description carrying fewer cells than the board from one
carrying more.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a grid
- **THEN** re-encoding that grid yields the identical description

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description covering more or fewer cells than the physical board is
  validated
- **THEN** it is rejected with a message distinguishing too little from too much

### Requirement: Ascent input, movement and completion

Ascent SHALL be playable by three number-entry methods: clicking a placed number
and then an adjacent cell to place its successor, clicking an empty cell and
typing a multi-digit number, and — in Edges mode — dragging from an arrow clue to
an empty cell on the same row, column or diagonal. It SHALL also support drawing a
path directly by left-dragging across cells and erasing it by right-clicking or
right-dragging, resolving a fully-drawn path into placed numbers. The arrow keys
and Enter SHALL emulate mouse clicks. Ephemeral entry state SHALL live on the UI,
never on the game state, and an input that changes nothing SHALL produce no history
entry.

A move SHALL be modeled as a discriminated union of place, line, clear and solve
operations rather than as an upstream move string. Placing a number on an
immutable (given) cell SHALL be rejected. The game SHALL be completed when every
cell is filled, the numbers form a single path from the lowest to the highest, and
every arrow clue is satisfied.

Because Ascent has a unique solution, `findMistakes` SHALL re-solve the clues and
flag every placed number that contradicts the unique completion, so that Check &
Save hard-blocks on a contradiction. This is distinct from the in-play error
shading that marks a duplicated number or a path segment violating adjacency.

Rendering SHALL draw numbers, walls, drawn path segments and — in Edges mode —
border arrows, SHALL show endpoint candidate hints for a single-number path, and
SHALL flash on completion. Moves SHALL be applied instantly with no interpolated
animation.

#### Scenario: Placing the next number along the path

- **WHEN** a placed number is selected and an adjacent empty cell is chosen
- **THEN** the successor number is placed in that cell

#### Scenario: A wrong number is reported as a mistake

- **WHEN** `findMistakes` runs on a board containing a placed number that differs
  from the unique solution at that cell
- **THEN** that cell is reported as a mistake, and Check & Save refuses to save

#### Scenario: Completing the path wins

- **WHEN** the last move fills the grid so the numbers form a single path from
  lowest to highest and all arrow clues are satisfied
- **THEN** the game is reported solved and flashes

### Requirement: Ascent grades its difficulty tiers honestly

An Ascent board generated at a difficulty above Easy SHALL NOT be soluble at the
tier below it, in any grid mode.

This diverges from upstream, which has no difficulty gate at all: it blanks clues
(or moves them to edge arrows) while the graded solver still finishes the board and
publishes the result, never asking whether an easier tier would also have done.
Seven of the 22 boards above Easy in this game's own frozen reference fixtures fall
to a lower tier, as did 56 of 180 freshly generated boards.

Because generation is solver-gated at every removal, the correction changes every
description above Easy. Upstream's generation
loop is unbounded, and the gate introduces rejections, so the loop SHALL be bounded.

The gate's probe SHALL run on solver scratch state that carries nothing from any
previous candidate. Ascent's scratch deliberately retains a flag across solves that
permanently weakens the solver once set — an upstream quirk the port reproduces
because it decides which boards exist — so a probe reusing the generator's scratch
would ask a weakened solver whether the easier tier copes, under-reject, and leave
its own state behind to influence the next candidate.

#### Scenario: A board above Easy genuinely needs its own tier

- **WHEN** a board generated above Easy is solved at the tier below it
- **THEN** the solver does not reach a solution
- **AND** solving the same board at its own tier does

#### Scenario: The probe is not weakened by the candidate before it

- **WHEN** the generator tests whether the easier tier solves a candidate
- **THEN** the solver runs from scratch state initialized for that board alone

### Requirement: Ascent acts on a pointer button, not on a pointer coordinate

Ascent's `interpretMove` SHALL enter its board arm only for an actual pointer
button — a press, drag or release — and not for any button whose coordinates
merely fall inside the grid.

Upstream gates that arm on the coordinates alone. That is harmless in a frontend
which claims `n`, `u`, `r` and `q` **above** the game, and it is not harmless
here, where the app derives its bare-letter shortcuts from whether the game
declined the key. Keyboard events arrive at `(0, 0)`, which is inside every
grid, so every key ran the no-op mouse-click path, set `finishTyping`, and fell
through the tail that returns `UI_UPDATE` when typing was finished and no move
resulted. Ascent therefore answered **every** button code in existence: undo,
redo, New game and Hint were all dead from its keyboard, and the collection's
consumed-based input guards were blind to the game entirely — with its cursor
keys deliberately disabled, the keyboard-reachability guard still reported it
healthy.

The `UI_UPDATE` tail itself SHALL be kept. It is not gratuitous: it is what
repaints a moved cursor, a click that lands outside the grid and clears the UI,
and a pointer press that mutates selection without producing a move. The defect
was the arm's gate, not the tail, and narrowing the tail by comparing UI state
before and after is expressly not the remedy.

**Scope, stated rather than implied**: this restores the keyboard-reachability
guard for Ascent and returns the four bare-letter shortcuts to its players. It
does **not** make the `ignoresSecondaryButton` biconditional sensitive for
Ascent — `RIGHT_BUTTON` is a pointer button, so it still reaches the tail, and
deleting Ascent's entire right-button arm leaves that guard green. Ascent's flag
is correct nonetheless, verified by reading the two arms rather than by probing:
a right-click cycles a two-candidate cell and a middle-click clears, so Ascent
has a genuine secondary meaning and correctly does not declare the flag.

#### Scenario: A key that is not a pointer button is declined

- **WHEN** a button that is neither a press, a drag nor a release is delivered at
  coordinates inside the grid, and Ascent has no other meaning for it
- **THEN** `interpretMove` returns `null`, so the app's bare-letter shortcuts run

#### Scenario: A typed number still commits on a cursor move or a click

- **WHEN** a partially typed number is pending and the player moves the cursor,
  presses Enter, or clicks the board
- **THEN** the number is committed, as before

### Requirement: Ascent solves with a four-tier deductive solver

Ascent SHALL provide a solver that finds the unique completion of a graded puzzle,
or reports that it cannot. The solver SHALL be a fixpoint of deduction rules gated
by difficulty — Easy applying only single-position and simple-proximity reasoning,
Normal adding path reasoning, Tricky adding simple single-number reasoning, and
Hard adding full single-number and overlap reasoning. The solver SHALL NOT guess
or backtrack at any difficulty tier.

The generator SHALL use the graded solver to keep every board uniquely soluble at
its target difficulty: it SHALL build a Hamiltonian path by the backbite
algorithm, then either remove clue numbers while the solver still solves
(non-Edges modes, honoring the symmetry and keep-endpoints options) or move
numbers out to arrow clues via a maximal bipartite matching (Edges mode), retrying
until soluble. Generation from a given seed SHALL be reproducible.

#### Scenario: A graded board is solved only at its difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** the graded solver reaches the unique completion at that difficulty, and
  a strictly weaker ruleset does not

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical description

### Requirement: Ascent's square grids turn and its hexagonal grids do not

Ascent's square-grid presets SHALL be upstream's turned to draw taller than wide (6×7 and 8×10), and its Honeycomb presets, which cannot be turned, SHALL be 6×8 and 8×10: the nearest sizes to upstream's 7×6 and 10×8 that draw taller than wide. `transposeParams` SHALL turn the square-grid modes and return `null` for Hexagon and Honeycomb, because a hexagonal grid on its side is another grid. Hexagon mode's board is a regular hexagon, wider across its corners than across its flats at every size, and SHALL be recorded as wide by nature in the portrait guard's ledger.

#### Scenario: A hexagonal board is never turned

- **WHEN** `transposeParams` is asked to turn Honeycomb or Hexagon params
- **THEN** it returns `null`

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

### Requirement: Ascent's solver treats the last number like any other

The solver's rungs SHALL apply to the last number on the path exactly as to any
other: reach SHALL measure it from the nearest placed number below it,
`overlap` SHALL narrow it and tie the number before it to its candidates, and a
placement SHALL rule it out of the square just filled. Upstream stopped one
short in each place, which left "the last number sits next to the one before
it" to no rung and let a board need a harder tier than a player does.

#### Scenario: The last number is measured from the one below it

- **WHEN** the last number is missing and the number before it is placed
- **THEN** the reach rungs rule the last number out of every square too far
  from it

#### Scenario: A filled square holds no other number

- **WHEN** the solver places a number in a square
- **THEN** every other number, the last one included, is ruled out of that
  square

### Requirement: Ascent's hint follows a run and names the close rival

After a hint step places a number in a run of missing numbers, the plan SHALL
ask the same techniques about that run alone, none harder than the technique
that placed the first number, and when that fills the run SHALL present the
placements as one journey, each leg with its own sentence. The plan's length
cap SHALL NOT split such a journey. A step placing a number because only its run
can reach the square SHALL, when exactly one other run comes within two steps of
the square or none does, and straight reach rules out every other number, say
which rival fails and why and the step counts that rule out the rest of its own
run, outlining the ends it names; otherwise it SHALL stripe its run's reach.

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

### Requirement: Ascent always offers a number beside the one selected

Selecting a placed number SHALL offer a number to place in the squares beside
it whenever one of its neighbors in the sequence is still missing: the one
after when the one before is placed, the one before when the one after is
placed, and the one after when neither is, with a right-click on an empty square
beside it cycling through the two.

#### Scenario: A number with neither neighbor placed

- **WHEN** the player selects a number whose neighbors in the sequence are both
  missing and clicks an empty square beside it
- **THEN** the next number is placed there
