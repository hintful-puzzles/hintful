# boats Specification

## Purpose
Boats, the battleships puzzle of placing a given fleet so that no two boats
touch, even diagonally, and each row and column holds its clued number of boat
cells. This capability specifies the game on the TS engine, with a hint that
explains one deduction at a time and refuses a board it cannot honestly advise,
and a fleet display that fits every legal fleet.

## Requirements

### Requirement: Boats game implements the Game interface

The engine SHALL provide `src/games/boats/` implementing the `Game`
interface for Boats (Battleships), registered so the puzzle is served by the
TypeScript engine.

Because Boats has a unique solution, it SHALL declare a `findMistakes` hook so
that Check & Save hard-blocks a save while a provably wrong cell is present.

#### Scenario: Every preset produces a uniquely soluble board

- **WHEN** a new game is generated for any preset
- **THEN** a board is produced whose fleet can be located by deduction alone at
  exactly the requested difficulty, with a unique solution

### Requirement: Boats parameters are a board, a fleet, a difficulty and a remove-numbers flag

Parameters SHALL be a width, a height, a maximum fleet (boat) size, a fleet
configuration (how many boats of each size), a difficulty of Easy, Normal,
Tricky or Hard, and a remove-numbers flag. The full parameter encoding of a
game ID SHALL carry the width, height, fleet size, difficulty, remove-numbers
flag and fleet configuration, and SHALL round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in full to a game ID and decoded
- **THEN** the same width, height, fleet size, difficulty, remove-numbers flag and
  fleet configuration are recovered

### Requirement: Boats refuses parameters no fleet can be dealt from

Parameters SHALL be refused unless width and height are each at least 2 and at
most 99, the fleet size is between 1 and 9 and no greater than the larger of
width and height, the fleet holds at least one boat, and the fleet fits in the
grid. When a board is to be generated, a fleet of exactly one boat SHALL be
refused at any difficulty above Easy, with a reason, since such a fleet has
only Easy boards.

#### Scenario: A fleet size larger than both dimensions is refused

- **WHEN** parameters name a fleet size greater than both the width and the
  height
- **THEN** they are refused with a reason

#### Scenario: A one-boat fleet is offered only at Easy

- **WHEN** a board is asked for with a fleet of one boat at Normal
- **THEN** the parameters are refused with a reason, and the same fleet at Easy
  is accepted

### Requirement: Boats descriptions use the border-clue and run-length grid encoding

A Boats description SHALL encode, first, the row and column occupancy clues as
`width + height` comma-terminated tokens, each a decimal count or a marker for a
hidden clue (the remove-numbers mechanic); and then the grid in row-major order as
a run-length sequence in which a lowercase letter denotes a run of that many empty
squares and an uppercase letter denotes a single given clue: water or one of the
boat-segment shapes (single, vague/unknown, top, bottom, left, right, center).

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Boats description omits a trailing run of squares with no clue

The run-length sequence SHALL be written so that a run is emitted only when a
given clue follows it or the run reaches the maximum a single letter can carry.
A description whose final squares carry no clue therefore encodes short, and a
board with no given clues at all, of fewer squares than one letter can carry,
SHALL encode as its border clues alone.

#### Scenario: A small board with no given clues encodes as its border clues

- **WHEN** a board with no given squares, smaller than the longest run one
  letter can carry, is encoded
- **THEN** the description is the border-clue tokens and nothing after them

#### Scenario: A trailing run is dropped after the last full letter

- **WHEN** a larger board with no given squares is encoded
- **THEN** the grid part holds a letter for each full-length run and nothing
  for the squares left over

### Requirement: Boats description validation rejects too many squares and never too few

Validation SHALL reject a description that carries more grid squares than the
board holds, that carries the wrong number of border-clue slots (distinguishing
too many from too few), or that uses an unknown character. It SHALL NOT reject
a description that carries fewer grid squares than the board holds, since that
is the ordinary encoding of a board whose last squares have no clue.

#### Scenario: A description with too many squares is rejected

- **WHEN** a description whose decoded grid area exceeds the board area is
  validated
- **THEN** it is rejected

#### Scenario: A description with no given clues is accepted

- **WHEN** a description carrying the right number of border clues and no grid
  clues at all is validated
- **THEN** it is accepted, and decodes to a board with no given squares

### Requirement: Boats is played by pointer and by keyboard

Boats SHALL be played by mouse or touch and by keyboard. A left-click SHALL
cycle a cell between empty, a boat segment and water; a right-click SHALL place
water on an empty cell and empty a filled one; a drag SHALL fill a run along a
single row or column; and a keyboard cursor with a place-segment key, a
place-water key and modifier-drag SHALL provide the same placements. Undo and
redo SHALL be provided by the engine with no game-specific state.

#### Scenario: Filling a run of cells along a row

- **WHEN** a drag begins in one cell and ends in another on the same row or column
- **THEN** every cell between them is set to the dragged content in a single move

### Requirement: A boat segment resolves its shape and a completed boat is crossed off

An unknown boat segment SHALL automatically resolve to the correct shape once
its neighbors are known, and a completed boat SHALL be crossed off the fleet
list.

#### Scenario: A segment between water and another segment becomes an end

- **WHEN** a placed segment has water on its left, above and below, and a boat
  segment on its right
- **THEN** it is drawn as the left end of its boat

### Requirement: Boats flags a broken rule as the player plays

The game SHALL flag provably wrong placements live: a row or column whose
occupancy count is exceeded, two boats touching even diagonally, a boat of a
size the fleet cannot accommodate, and a placed segment that contradicts a
given clue. A line whose count is broken SHALL have its number drawn in the
error color.

#### Scenario: A row whose count is exceeded is flagged

- **WHEN** more boat segments are placed in a row than its occupancy clue allows
- **THEN** the row's count is shown in the error color, and `findMistakes`
  reports at least one of the row's cells

### Requirement: Boats findMistakes re-solves to the unique solution

The `findMistakes` hook SHALL re-solve the puzzle to its unique solution and
report every placed cell that contradicts it, so that Check & Save also blocks
a locally legal placement that no solution permits. On a board the puzzle's
solver completes, a board the live flags mark SHALL be a board on which
`findMistakes` reports a cell.

#### Scenario: A legal placement no solution permits is reported

- **WHEN** a boat segment is placed that exceeds no count and touches no boat,
  on a square the unique solution has as water
- **THEN** `findMistakes` reports that square

### Requirement: Boats draws its cells, clues and fleet with no interpolated animation

Rendering SHALL draw each cell as water or its boat-segment shape, the row and
column count clues on the edges, and the fleet list, with wrong cells and
counts in their error colors. There SHALL be no interpolated animation, and the
board SHALL flash on completion.

#### Scenario: Completing the fleet wins, without filling in the water

- **WHEN** the last boat is placed so that every row and column count is met and
  the fleet is exactly accounted for
- **THEN** the game is reported solved and flashes, even if squares the player
  never marked as water remain undecided

### Requirement: Boats explains its next deduction

Boats SHALL provide an explained hint that computes a plan of forced moves from
the player's current board and narrates each one by the deduction that forces
it, meeting the project's hint quality bar: the narration SHALL state why the
move is forced, the premise that singles out this conclusion, and not merely
what to place.

#### Scenario: A hint names the technique that forces the move

- **WHEN** a hint is requested on a board where a row already shows all the ships
  its number allows
- **THEN** the remaining squares in that row are offered as water, and the
  explanation states that the row's number is already met

### Requirement: The Boats hint replays the solver's deductions one firing at a time

The hint SHALL be derived from the same deduction engine as the solver,
replayed one firing at a time, and SHALL NOT alter the solver, the generator or
the description codec.

#### Scenario: A hint resumes from the player's board

- **WHEN** a hint is requested on a board the player has partly filled
- **THEN** the plan starts from that board, and every square its first step
  asks for is one the player has left undecided

### Requirement: The Boats hint replays at the lowest cap that solves the board

The hint SHALL replay the deduction at the lowest cap at which the board
solves, so that a board generated at an easy tier is taught the easy technique
that suffices. It SHALL replay at a higher cap only when the lower one yields
no step from the player's board.

#### Scenario: A hint on an easy board teaches an easy technique

- **WHEN** a hint is requested on a board generated at the easiest difficulty
- **THEN** a plan is produced, and it is the deduction that difficulty admits
  rather than a harder refutation reaching the same square

### Requirement: A recovered border number is offered to the cheaper techniques first

A hidden border number the deduction recovers is new to every cheaper
technique, so the hint SHALL ask them again before it tries a harder one.

#### Scenario: A recovered number feeds a line count

- **WHEN** the only progress on a board with hidden border numbers is that one
  of them can now be worked out, and with it a line is one boat square short
  with one square free
- **THEN** the hint offers that square, and does not report that deduction has
  run out

### Requirement: Every Boats technique is narrated

Every named technique SHALL be narratable. Boats guesses at no tier, so the
hint SHALL NOT fall back on an unexplained "this is the only possibility" step.

#### Scenario: A refutation names the rule the alternative would break

- **WHEN** a square is forced only because the opposite placement immediately
  contradicts the board
- **THEN** the explanation names the specific rule that would break (a line's
  number, two boats touching, or a boat the fleet cannot hold) rather than
  asserting the square is forced without reason

### Requirement: One deduction is one hint

A single deduction that forces several squares SHALL be presented as one hint,
a multi-leg journey whose continuation legs are marked as continuing the
previous one, and not as several disjoint hints. Squares that follow from a
placement by the never-touch rule SHALL be shown as part of that step and SHALL
NOT be narrated as further deductions.

#### Scenario: A line filled by one deduction is a single hint

- **WHEN** a deduction completes a whole row with water
- **THEN** one hint is presented covering every square in that row, not one hint
  per square

### Requirement: A Boats hint marks a boat and water each in its own shape

Forced squares and the evidence they are deduced from SHALL be visually
distinct, and the two kinds of placement Boats admits, a boat segment and
water, SHALL be marked in the shape of the action each represents, so that one
hint color cannot stand for two different actions.

#### Scenario: A step that places both kinds marks each differently

- **WHEN** a hint step asks for a boat segment on one square and water on
  another
- **THEN** the first is marked with a boat segment of no resolved shape and the
  second with waves, both in the hint color
- **AND** a square the step only reasons from is outlined and carries neither
  mark

### Requirement: Boats refuses to hint a board it cannot honestly advise

A hint request SHALL be refused, with a reason, when the board is already
solved, when the player has placed a square that contradicts the puzzle's
unique solution, or when no further deduction is available. On the mistake
refusal the offending squares SHALL be surfaced through the existing mistake
overlay.

A placement that breaks no rule yet but that no solution permits SHALL be
treated as a mistake for this purpose, so that the hint never reasons onward
from a board that cannot be completed.

#### Scenario: A wrong-but-legal placement is refused rather than reasoned from

- **WHEN** a hint is requested on a board carrying a boat segment that breaks no
  rule but appears in no solution
- **THEN** the hint refuses and the offending square is highlighted, rather than a
  plan being computed from the unsolvable position

### Requirement: The fleet display fits the canvas for every legal fleet

The inventory of boats drawn beneath the board SHALL be laid out entirely
within the width the game reports for its canvas, for every fleet configuration
parameter validation admits. Rows SHALL break between whole batches of one boat
size, keeping a size's boats together, and also within a batch that is itself
too wide for a row, so that a fleet holding more boats of one size than fit
across the board does not draw past the right edge.

#### Scenario: A fleet wider than one row wraps instead of overflowing

- **WHEN** the fleet holds more boats of one size than fit across the board
- **THEN** that batch wraps onto a further row, every boat is drawn inside the
  canvas width, and the reported canvas is tall enough for the extra row

### Requirement: The fleet layout is computed once and leaves a fitting fleet as it was

The layout SHALL be computed once and shared by the size calculation and the
renderer, so the reported canvas height always matches the number of rows
drawn. Wherever breaking rows only between whole batches keeps every boat
inside the row limit, the layout SHALL be identical to the one that rule alone
gives.

#### Scenario: A fleet that already fitted is laid out unchanged

- **WHEN** a fleet whose every batch fits within a row is drawn
- **THEN** each size's boats stay together on one row, positioned as the
  batch-only rule places them

### Requirement: Boats solves with a four-tier deductive solver

Boats SHALL provide a solver that finds the fleet placement by deduction, or
reports that no deduction completes it. The solver SHALL apply progressively
harder named technique tiers (Easy, Normal, Tricky, Hard) and SHALL report the
highest tier a board actually requires. The solver SHALL NOT guess or backtrack
at any tier, so that every generated board is solvable by pure deduction and
Boats satisfies the guess-free-generation policy at every named difficulty.

#### Scenario: The solver reports the required difficulty

- **WHEN** a soluble board is solved
- **THEN** the returned tier equals the hardest technique tier the deduction
  needed, and the completed grid is the unique solution

### Requirement: A boat's first square is the smallest element of its class

Boat connectivity SHALL be computed over the shared disjoint-set structure.
Where the solver needs a boat's first square (whether a boat is finished, and
which way an unfinished one must grow) it SHALL ask for the smallest element of
the boat's class, and SHALL NOT read the class's root, which union-by-size
leaves on a boat's second square.

#### Scenario: A finished boat is seen as finished

- **WHEN** the largest boats of the fleet are all placed and bounded by water
- **THEN** the solver does not report a contradiction

### Requirement: The Boats solver is monotone in its difficulty cap

The solver SHALL be monotone in its difficulty cap, as every capped solver is.
A consumer that solves a board of unknown difficulty, which Solve and the
mistake check are, SHALL solve once at the highest cap.

#### Scenario: A board that solves at the easiest cap solves at every cap

- **WHEN** a board whose largest boats are all placed and bounded by water
  solves at the easiest cap
- **THEN** it solves at every cap above it

### Requirement: An end-capped boat that cannot stop grows at the second tier

A boat that has an end cap on one side and an undecided square on the other
SHALL be grown into that square once every boat of its present length is
finished, at the second tier.

#### Scenario: An unfinished boat that cannot stop grows

- **WHEN** a boat of two squares has water beyond one end and an undecided
  square beyond the other, and every two-square boat of the fleet is finished
- **THEN** the solver places a boat segment in the undecided square, and the
  hint gives that as its reason

### Requirement: The Boats generator deals a unique board at exactly the requested difficulty

The generator SHALL use the solver to guarantee a unique solution at exactly
the requested difficulty: it SHALL place a random fleet, derive the border
clues, optionally hide border numbers while the board stays soluble, and reject
any board not solvable at exactly the target difficulty. Generation from a
given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

### Requirement: Boats draws its squares on the collection's quiet surface

`redraw` SHALL draw an undecided square as the collection's cell surface, with
the collection's surface grid line between squares and round the grid. A square
the player has decided, water or segment, and a water square the puzzle gave
SHALL keep the water fill, and given water SHALL keep its waves.

#### Scenario: Undecided is surface and water is blue

- **WHEN** a board holds an undecided square beside one marked as water
- **THEN** the first is the cell surface and the second the water fill

### Requirement: A given boat segment sits on the lifted surface of a given

A boat segment the puzzle gave SHALL sit on the collection's lifted surface of
a given, so it is told from a segment the player placed by the cell under it.
The help page SHALL say that a given segment sits on a lighter square.

#### Scenario: A given segment is told by the cell under it

- **WHEN** a board with a given boat segment is drawn
- **THEN** that segment's square is the lifted surface
- **AND** a segment the player places is drawn on the water fill

### Requirement: Boats draws its waves and its collision diamond's edge in ink

The waves and the edge of a collision diamond SHALL be drawn in ink, not in the
grid's color.

#### Scenario: Given water carries ink waves

- **WHEN** a board with a given water square is drawn
- **THEN** its waves are in the ink color, on the water fill

### Requirement: A boat segment and an unfound boat in the tally share the placed-piece color

A boat segment SHALL be drawn in the collection's color for a placed piece, the
theme pair's first member, whether the player placed it or the puzzle gave it, and a boat still to be found in the fleet tally SHALL be drawn in that
same color.

#### Scenario: The tally shows the piece on the board

- **WHEN** a board is drawn with a boat placed and a boat still to be found
- **THEN** the placed segment and the unfound boat in the fleet tally are
  filled with the same color

### Requirement: The Boats keyboard cursor is a ring at the square's edge

The keyboard cursor SHALL be a ring in the collection's cursor color at the
square's edge, outside a segment's outline.

#### Scenario: The cursor rings a square that holds a segment

- **WHEN** the keyboard cursor is on a square holding a boat segment
- **THEN** the ring is drawn at the square's edge in the cursor color, and does
  not cross the segment
