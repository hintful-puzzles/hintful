# ascent Specification

## Purpose
Ascent, the puzzle of placing numbers so that each stands next to its successor
and together they form one path from 1 to the highest, on square or hexagonal
grids and in an Edges mode clued by arrows around the board.

## Requirements

### Requirement: Ascent is solved by one path through every number

Ascent SHALL be complete when every cell is filled, the numbers form a single
path from the lowest to the highest, and every arrow clue is satisfied.

#### Scenario: Completing the path wins

- **WHEN** the last move fills the grid so the numbers form a single path from
  lowest to highest and all arrow clues are satisfied
- **THEN** the game is reported solved and flashes

### Requirement: Ascent's parameters

Parameters SHALL be a width, a height, a difficulty (Easy, Normal, Tricky or
Hard), a ruleset with its board shape, and the booleans "remove start and end
points" and "symmetrical clues". Validation SHALL require a width and a height
between 2 and 50 with an area under 1000, and an odd height and a width greater
than half the height on a Hexagon, and SHALL refuse a 2×2 grid in Edges. A game
ID SHALL encode every parameter and round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, difficulty, mode and clue flags are recovered

### Requirement: Ascent's rulesets are told apart by a square's neighbors

Ascent SHALL declare four rulesets, in this order: Orthogonal (four neighbors,
mode letter `O`), Hex (six, `H` and `C`), Classic (eight, `R`) and Edges
(eight, with arrows round the grid, `E`). The Custom dialog SHALL ask for the
ruleset and the board's shape as separate fields, the shape offering Rectangle,
Honeycomb and Hexagon. The params encoding SHALL be one mode letter, and a
string that names no mode SHALL decode as Classic.

#### Scenario: Hex is chosen in the dialog

- **WHEN** the player selects the game mode Hex on a Rectangle board
- **THEN** the board shape offers Honeycomb and Hexagon with Honeycomb chosen,
  and OK deals a Hex board

#### Scenario: A game ID from before the rulesets were split

- **WHEN** a params string with any mode letter, or with none, is decoded
- **THEN** it names the board it always did

### Requirement: Each ruleset declares what it offers

Each ruleset SHALL declare what it offers (`Ruleset.only`): Hex the Honeycomb
and the Hexagon, and every other ruleset the Rectangle alone; Edges also
symmetrical clues off and the tiers from Normal up. `validateParams` SHALL
write no refusal for any of these.

#### Scenario: A ruleset is asked for on a shape it does not have

- **WHEN** the dialog's values are submitted, by something other than its form,
  with the game mode Edges and the board shape Hexagon
- **THEN** it is refused: "Board shape must be Rectangle for Edges."

### Requirement: The Type menu has a section for each ruleset

The Type menu SHALL hold a section for each ruleset, each offering one board:
Orthogonal, Hex's Honeycomb and Classic at every tier, Edges from Normal up,
and Hex's Hexagon from Normal up beside the Honeycomb. Other sizes are
Custom's. The game's default SHALL be the menu's first line.

#### Scenario: The menu's sections

- **WHEN** the player opens Ascent's Type menu
- **THEN** its sections are Orthogonal, Hex, Classic and Edges, in that order,
  and the Hex section holds a Honeycomb board at every tier and a Hexagon board
  from Normal to Hard

### Requirement: Ascent's square grids turn and its hexagonal grids do not

`transposeParams` SHALL turn the square-grid modes and return `null` for
Hexagon and Honeycomb, because a hexagonal grid on its side is another grid.
Hexagon mode's board is wider than tall at every size, and SHALL be recorded as
wide by nature in the portrait guard's ledger.

#### Scenario: A hexagonal board is never turned

- **WHEN** `transposeParams` is asked to turn Honeycomb or Hexagon params
- **THEN** it returns `null`

### Requirement: Ascent descriptions use the upstream run-length encoding

A description SHALL encode the padded grid in row-major order: a placed number
as its decimal value, with a separator between two adjacent numbers; a run of
empty cells as a lower-case letter count; and a run of wall cells as an
upper-case one, either repeating the maximal letter for a run longer than 26.
In Edges mode the arrow clues SHALL be encoded as ordinary numbers on the
border ring, and tagged as edge clues on decode.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a grid
- **THEN** re-encoding that grid yields the identical description

### Requirement: A description is validated against the physical grid

The grid a description covers SHALL be the user-facing size adjusted for the
mode: Honeycomb widened, Edges bordered by two cells on each axis. Validation SHALL reject a
description whose highest number exceeds the cell count, and SHALL distinguish
a description carrying fewer cells than the board from one carrying more.

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description covering more or fewer cells than the physical board is
  validated
- **THEN** it is rejected with a message distinguishing too little from too much

### Requirement: Ascent places a number three ways

A number SHALL be placed by clicking a placed number and then an adjacent cell,
which takes its successor; by clicking an empty cell and typing a number of any
length; and, in Edges mode, by dragging from an arrow clue to an empty cell on
the same row, column or diagonal. The arrow keys and Enter SHALL emulate mouse
clicks.

#### Scenario: Placing the next number along the path

- **WHEN** a placed number is selected and an adjacent empty cell is chosen
- **THEN** the successor number is placed in that cell

### Requirement: Ascent draws and erases a path

A path SHALL be drawn by left-dragging across cells and erased by
right-clicking or right-dragging, and a fully drawn path SHALL resolve into
placed numbers. A right-click SHALL otherwise clear a number or the line
through a cell, so Ascent has a secondary meaning and SHALL NOT declare
`ignoresSecondaryButton`.

#### Scenario: A drawn path between two numbers is complete

- **WHEN** the player draws a path that joins two placed numbers through
  exactly as many cells as there are numbers between them
- **THEN** those cells take the numbers

### Requirement: A number cannot be placed on a given

Placing a number on a cell the puzzle fixed SHALL be rejected.

#### Scenario: A number is placed on a given

- **WHEN** a place move names a cell the puzzle fixed
- **THEN** the move is rejected and the history is unchanged

### Requirement: Ascent always offers a number beside the one selected

Selecting a placed number SHALL offer a number for the squares beside it
whenever one of its neighbors in the sequence is missing: the one after when
the one before is placed, the one before when the one after is placed, and the
one after when neither is. When neither is, a right-click on an empty square
beside it SHALL cycle through the two.

#### Scenario: A number with neither neighbor placed

- **WHEN** the player selects a number whose neighbors in the sequence are both
  missing and clicks an empty square beside it
- **THEN** the next number is placed there

### Requirement: A second tap on the selected number offers the one before

When neither neighbor in the sequence is placed, a second tap on the selected
number SHALL offer the one before instead, and a third SHALL deselect it. Each
SHALL act on the release, so that a drag from the number places what it offers.

#### Scenario: Tapping the selected number again

- **WHEN** the player taps a selected number whose neighbors in the sequence
  are both missing, then taps an empty square beside it
- **THEN** the number before it is placed there, and a further tap on the
  number instead deselects it

### Requirement: The UI_UPDATE tail of interpretMove is kept

The tail of `interpretMove` that returns `UI_UPDATE` when typing was finished
and no move resulted SHALL be kept: it repaints a moved cursor, a click outside
the grid that clears the UI, and a press that changes the selection without a
move. It SHALL NOT be narrowed by comparing UI state before and after.

#### Scenario: A typed number still commits on a cursor move or a click

- **WHEN** a partially typed number is pending and the player moves the cursor,
  presses Enter, or clicks the board
- **THEN** the number is committed

### Requirement: Ascent offers a number keypad

Ascent SHALL offer an on-screen keypad of the digits `1`–`9` and `0` and a
Clear key, so that a number can be written into any empty square by a pointer
alone: a tap on the square, the number's digits, and a tap anywhere to confirm
it. Clear SHALL rub out the last digit typed, as Backspace does. The hint
places numbers no chain of taps reaches, and the keypad is how a touch player
makes them.

#### Scenario: A missing number is written by taps and the keypad alone

- **WHEN** the player taps an empty square, presses the keypad digits of a
  number missing from the board, presses a wrong digit and Clear, and taps
  another square
- **THEN** the square holds that number

### Requirement: findMistakes compares the board with its one solution

`findMistakes` SHALL solve the clues again and flag every placed number that
contradicts the unique completion, so that Check & Save refuses a board holding
one. The shading drawn during play is another thing: it marks a duplicated
number and a path segment that breaks adjacency.

#### Scenario: A wrong number is reported as a mistake

- **WHEN** `findMistakes` runs on a board containing a placed number that differs
  from the unique solution at that cell
- **THEN** that cell is reported as a mistake, and Check & Save refuses to save

### Requirement: Ascent solves with a four-tier deductive solver

The solver SHALL find the unique completion of a graded puzzle or report that
it cannot. It SHALL be a fixpoint of deduction rules gated by difficulty: Easy
applies only single-position and simple-proximity reasoning, Normal adds path
reasoning, Tricky adds simple single-number reasoning, and Hard adds full
single-number and overlap reasoning. It SHALL NOT guess or backtrack at any
tier.

#### Scenario: A graded board is solved only at its difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** the graded solver reaches the unique completion at that difficulty, and
  a strictly weaker ruleset does not

### Requirement: Ascent's solver treats the last number like any other

The solver's rungs SHALL apply to the last number on the path as to any other:
reach SHALL measure it from the nearest placed number below it, `overlap` SHALL
narrow it and tie the number before it to its candidates, and a placement SHALL
rule it out of the square just filled. Otherwise "the last number sits next to
the one before it" belongs to no rung, and a board needs a harder tier than a
player does.

#### Scenario: The last number is measured from the one below it

- **WHEN** the last number is missing and the number before it is placed
- **THEN** the reach rungs rule the last number out of every square too far
  from it

#### Scenario: A filled square holds no other number

- **WHEN** the solver places a number in a square
- **THEN** every other number, the last one included, is ruled out of that
  square

### Requirement: Ascent's generator keeps every board soluble at its tier

Outside Edges the generator SHALL remove clue numbers from a full path while
the graded solver still solves, honoring the symmetry and keep-endpoints
options; in Edges it SHALL move numbers out to arrow clues, retrying until
soluble. Its loop SHALL be bounded, and generation from a seed SHALL be
reproducible.

#### Scenario: Every preset produces a uniquely soluble board

- **WHEN** a new game is generated for any preset or legal size and mode
- **THEN** a board is produced whose clues admit exactly one completion under the
  graded solver

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical description

### Requirement: Ascent grades its difficulty tiers honestly

A board generated above Easy SHALL NOT be soluble at the tier below it, in any
grid mode.

#### Scenario: A board above Easy genuinely needs its own tier

- **WHEN** a board generated above Easy is solved at the tier below it
- **THEN** the solver does not reach a solution
- **AND** solving the same board at its own tier does

### Requirement: Ascent explains the next number

Every hint step SHALL place one number, or one whole run where a later
requirement says so, and every fact it rests on SHALL be a number, a wall or an
arrow on the board. The reading the techniques reason
from SHALL be rebuilt from the player's board, through the solver's own rungs,
before every step, and SHALL NOT read lines the player drew. The hint SHALL
refuse on a solved board and while `findMistakes` reports anything. A step
SHALL be followed by placing its number by any gesture.

#### Scenario: Following the hint finishes the board

- **WHEN** the player follows every hint step from a newly generated board, in
  any grid mode, tier or option
- **THEN** the board is solved and no step placed a wrong number

### Requirement: Ascent's hint techniques stay within the board's tier

The techniques, easiest first by their tier in the board's grid mode, SHALL be:
a number next to its placed neighbors in the sequence; a number within reach of
the nearest placed numbers below and above it; a dead end, entered from one
neighbor only, holding an end of the path; a square only one run of missing
numbers can reach, and only one number of that run; and the same two readings
with reach counted along routes of empty squares. No step SHALL use a technique
above the board's tier.

#### Scenario: A dead end names the path's end

- **WHEN** an empty square has only one neighbor the path can still enter it
  from, and only one end of the path can be there
- **THEN** the step places that end, and says whether the other end is placed,
  out of reach, or pointed elsewhere by its arrow

#### Scenario: A step stays within the board's tier

- **WHEN** a hint is asked on a board generated at a tier
- **THEN** no step uses a technique belonging to a harder tier in that grid mode

### Requirement: A hint step says why in one sentence and marks what it reads

Each step SHALL say why its number is forced in one sentence of at most 120
characters, naming numbers by value. It SHALL ring the square it fills without
drawing the number, SHALL outline the numbers and squares it reasons from, in
square and hexagonal cells alike, and SHALL stripe an arrow's line when the
sentence names it. A step whose move fills in more than its own square SHALL
end the plan.

#### Scenario: A step on a hexagonal board

- **WHEN** a step is shown on a Honeycomb or Hexagon board
- **THEN** its ring and its outlines follow the six-sided cells

### Requirement: Ascent's hint names only numbers the player can see

Every hint sentence SHALL name only numbers placed on the board or placed by
its own step. A run SHALL be named by its placed ends, a rival's failure by the
placed end it cannot touch, and a step count by the side of its run it rules
out.

#### Scenario: A close rival is named

- **WHEN** a fill step names the one run that comes close to its square
- **THEN** the sentence names that run by its placed ends and the placed number
  the square does not touch, and names no missing number but the one placed

### Requirement: Ascent's hint follows a run

After a step places a number in a run of missing numbers, the plan SHALL ask
the same techniques about that run alone, none harder than the technique that
placed the first number. When that fills the run it SHALL present the
placements as one journey, each leg with its own sentence, and the plan's
length cap SHALL NOT split such a journey.

#### Scenario: A forced run arrives as one hint

- **WHEN** a step places a run's first number and the same techniques then fill
  the rest of the run
- **THEN** the rest follows as legs of the same journey, and none uses a harder
  technique than the first

### Requirement: A square only one run can reach names the close rival

A step placing a number because only its run can reach the square SHALL say so
in words, outlining the ends it names, when straight reach rules out every
other run and the step counts to its own run's ends rule out every other number
of it. When exactly one other run comes within two steps of the square, or none
does, it SHALL say which rival fails and why, with the counts.

#### Scenario: The one close rival is named

- **WHEN** a square only one run can reach has exactly one other run within two
  steps of it
- **THEN** the step names that run and why it falls short, with the step counts
  that single out the number

### Requirement: Several close rivals give way to the counts, or to the run's reach

Where straight reach and the step counts single the number out, but naming the
rival runs past 120 characters or several runs come close, and the run has more
than one number, the step SHALL say that no other run can reach the square,
with the counts, and SHALL outline only the counts' ends. Every other such step
SHALL name the run and its placed ends, outline those ends and stripe every square the run can reach, the filled
square among them.

#### Scenario: Several close rivals give way to the counts

- **WHEN** a square only one run of several numbers can reach has two or more
  other runs within two steps of it, and the step counts to the run's ends
  single out the number
- **THEN** the step says that no other run can reach the square and gives those
  counts, outlines the placed numbers they count from, and stripes nothing

#### Scenario: A square only one run can reach shows that run's reach

- **WHEN** a step fills a square because only one run of missing numbers can
  reach it, and its sentence does not give the reason in words
- **THEN** the sentence names the run and its placed ends, the run's ends are
  outlined, and every square the run can reach is striped

### Requirement: Ascent's hint places a run with one route in one step

When a step would place a number, the hint SHALL place its whole run of missing
numbers in one step if the run has exactly one route between its placed ends
through the empty squares, or exactly one through every empty square no other
run can reach, or exactly one that leaves a neighboring run at least one route
of its own. The number of routes SHALL be counted, not inferred.

#### Scenario: A run with two routes

- **WHEN** the plan follows a run to its end and more than one route exists
- **THEN** the run is placed a number at a time, each with its own reason

#### Scenario: Only one route leaves a neighbor room

- **WHEN** a run has several routes and all but one leave a neighboring run no
  route between its own ends
- **THEN** one step places the run along that route, naming the neighboring run

### Requirement: A whole-run step draws its route and shrinks as it is followed

A step that places a whole run SHALL say why in one sentence, draw the route as
the game's path line in the hint's color, ring every square on it, and stripe
the squares no other run reaches when those are what make the route unique. A
player placing the run's numbers one at a time SHALL stay on the step, which
shrinks to what is left. Every sentence SHALL name a run by the placed numbers
at its ends.

#### Scenario: A run with one route

- **WHEN** the plan follows a run to its end and only one route through the
  squares no other run reaches exists
- **THEN** one step places every number of the run, and following it a number at
  a time keeps it on track

### Requirement: Ascent's hint reads the arrows' lines in Edges mode

In Edges mode the hint SHALL offer `lines`, a Normal technique listed ahead of
the run techniques of its tier. It SHALL place a number when exactly one empty
square is on its arrow's line and within `k` steps of an empty square on the
line of each missing number `k` places from it, and of each placed number as
far as it is in the sequence. No Edges technique SHALL change a hint on a board
of another mode.

#### Scenario: Three arrows single out a square

- **WHEN** 12's arrow points along a column, 11's along a row and 13's along
  another row two rows below it, and one empty square of 12's column is within a
  step of both rows
- **THEN** the step places 12 there, names its column and the two rows, and
  stripes the two rows

#### Scenario: The other modes keep their hints

- **WHEN** a hint is asked on a Rectangle, Hexagon or Honeycomb board
- **THEN** neither Edges technique is tried

### Requirement: A lines step names every premise it needs

The sentence of a `lines` step SHALL name the number's line and each premise it
needs, at least one of them a line. The step SHALL outline the arrows and
placed numbers named and SHALL stripe the lines of the other numbers named.

#### Scenario: A premise that is a placed number

- **WHEN** a `lines` step needs a placed number as well as another number's line
- **THEN** the sentence names both, the placed number is outlined and the line
  is striped

### Requirement: Ascent's Edges hint asks which arrow pointing at a square still fits

In Edges mode the hint SHALL offer `pointers`, listed ahead of the run
techniques of its tier: Tricky when the number has a placed neighbor in the
sequence, Hard otherwise. It SHALL place a number in a square when every other
missing number whose arrow points at the square, or that has none, fails a
`lines` premise there.

#### Scenario: Only one arrow pointing at a square still fits

- **WHEN** of the missing numbers whose arrows point at a square, all but one
  are too far from a line or number they must be near
- **THEN** the step places that one

### Requirement: A pointers step names the numbers it rules out

The sentence of a `pointers` step SHALL name the numbers it rules out and, when
it fits in 120 characters, each one's reason. The step SHALL outline every
arrow pointing at the square and stripe the lines that rule the others out.

#### Scenario: The rivals are named and their arrows outlined

- **WHEN** a `pointers` step places a number
- **THEN** its sentence names the others, and every arrow pointing at the
  square is outlined

### Requirement: Ascent's Edges hint names a number's own line by its shape

In Edges mode, every hint sentence that rests on a number's own arrow line
SHALL name that line by its shape, as "on its row", "on its column" or "on its
diagonal", in every technique alike, and SHALL name another number's line the
same way ("16's row").

#### Scenario: A neighbor step names the row

- **WHEN** a step places 22 next to 21 because only one square beside 21 is on
  22's row
- **THEN** its sentence says 22 "must sit next to 21, on its row"

### Requirement: Ascent's Edges hint says when the arrows fix a run's route

When a step places a whole run along its only route in Edges mode, and counting
the run's routes with the arrows ignored finds more than one, the step SHALL
outline the arrows of the run's numbers, and its sentence SHALL say that the
arrows leave only that route whenever that fits in 120 characters. It SHALL NOT
make that claim when the count without arrows finds the same one route, or
gives up.

#### Scenario: The arrows keep a run on one side

- **WHEN** a run's numbers could go around either side of a placed number, but
  their arrows' lines allow only one side
- **THEN** the step says that with each number on its arrow's line the run has
  only one route, and outlines those arrows

### Requirement: What Ascent draws

Where a drawn path holds only a single number, rendering SHALL show at its endpoints the one or two smaller numbers valid there. Moves
SHALL be applied instantly, with no interpolated animation.

#### Scenario: A move is drawn at once

- **WHEN** a move is made
- **THEN** the next frame shows its result, with no frame between

### Requirement: Ascent draws its cells on a quiet surface and lifts a given

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, and a cell holding a number the puzzle fixed on the collection's
lifted surface of a given, in the square and the hexagonal modes alike. A given
SHALL be drawn in ink and a number the player placed in the collection's entry
color. A cell's outline SHALL be the surface grid line. A wall SHALL stay a
solid fill in ink, and the margin an edge number's arrow sits in SHALL stay the
board.

#### Scenario: A given is told by the cell under it

- **WHEN** the opening frame of a rectangular board is drawn
- **THEN** every cell holding a number is the lifted surface and every other
  cell is the plain cell surface

#### Scenario: The grid is quiet in every mode

- **WHEN** a rectangular board and a hexagonal board are drawn
- **THEN** each cell's outline, four-sided, eight-sided or six-sided, is the
  surface's grid line

### Requirement: The board's own path stands off both surfaces

The path the board draws between consecutive numbers SHALL be the collection's
strong gray line, which stands off the plain and the lifted surface in both
schemes: dark on a light board and light on a dark one. The disc under the first and the last number SHALL carry a ring in the
grid line's color. A number on a path SHALL be drawn on a disc of its cell's
surface, and an end's disc over the line into it, so no line runs under a
digit. The path the player draws SHALL keep the entry color.

#### Scenario: The board's own path reads on both surfaces

- **WHEN** a number is typed next to its neighbor in the sequence
- **THEN** the preview of the line joining them is drawn in the color of the
  board's own path, which is neither surface's

### Requirement: The held cell and its targets take washes of their own

The cell the player holds, types into or has selected SHALL take the
collection's selection wash, told from a plain cell and a lifted one in both
schemes. The squares the held number leads to, which are the nearest placed
number on either side of it, and the row or column an edge number is dragged
along SHALL take the collection's goal wash, in a palette slot of its own, told
from a plain cell, a lifted one and the held cell in both schemes.

#### Scenario: A target is told from the cells round it in the dark scheme

- **WHEN** a number is held on a board in the dark scheme
- **THEN** the squares it leads to are no closer in color to a plain cell, a
  lifted cell or the held cell than the collection's least distance between
  neighbors

### Requirement: An offered number is drawn as a pencil mark

A number offered and not yet placed, which is what a click on its square would
write, SHALL be drawn in the collection's pencil-mark color, and in ink on the
row or column an edge number is dragged along.

#### Scenario: An offered number is read on a dark cell

- **WHEN** a number is held on a board in the dark scheme
- **THEN** the numbers offered round it are drawn in the color a pencil mark
  has in every other entry game, and not in the bevel's gray

### Requirement: A square's corners are cut where the path may step diagonally

On a Rectangle board whose ruleset lets the path step diagonally (Classic and
Edges), `redraw` SHALL draw each square of the grid with its corners cut off,
the board showing in the gap, and a hint's ring or outline round such a square
SHALL follow the cut. On an Orthogonal board a square SHALL be drawn whole. An
edge number's arrow is not a square of the grid and SHALL be drawn as before.

#### Scenario: The two square boards are told apart

- **WHEN** a Classic board and an Orthogonal board of one size are drawn
- **THEN** every cell outline of the Classic board has eight sides and every one
  of the Orthogonal board four
