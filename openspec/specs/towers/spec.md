# towers Specification

## Purpose
Towers (Skyscrapers), the Latin-square puzzle whose edge clues count the towers
visible from that side: its rules, what its params refuse and its description
format, its 3D and 2D styles and the surfaces they stand on, an optional
auto-pencil that strikes a placed height from its row and column, clue
striking, and what is Towers' own in a hint explained through pencil notes.
What it shares with every note-taking and candidate-hint game is in
`engine-notes` and `engine-candidate-hints`.

## Requirements

### Requirement: Rules: Towers is Skyscrapers on a Latin square

Towers SHALL be the puzzle Skyscrapers on a `w × w` grid, in which the player
places a tower of height `1..w` in every cell so that each row and column
contains every height exactly once, and so that each outside clue equals the
number of towers visible from that edge (a taller tower hides every shorter one
behind it).

#### Scenario: A taller tower hides the shorter ones behind it

- **WHEN** a line reads 2, 4, 1, 3 going away from its clue
- **THEN** that clue is satisfied only if it is 2

### Requirement: Rules: Towers is solved while the filled grid breaks no rule

The board SHALL be reported solved exactly while the filled grid violates no
clue and no Latin constraint.

#### Scenario: Entering the last correct tower completes the board

- **WHEN** the player enters the final tower that completes a correct grid
- **THEN** `status` reports the state `executeMove` returns as solved

### Requirement: Rules: Towers' mistake check re-solves from its clues and givens

Towers' `findMistakes` SHALL judge the board against its one answer, which
its clues and givens decide (`described-fill-game`). A wrong tower and a note
set that lacks its height SHALL render as the same red cell overlay.

#### Scenario: A wrong tower that breaks no rule

- **WHEN** the player enters a height that repeats nothing in its row or
  column, contradicts no clue as the board stands, and is not the answer's
- **THEN** `findMistakes` includes that cell, though nothing is drawn as an
  error before the check

### Requirement: Params: A Towers params string is its declared codec's, and one with no difficulty is Easy

Towers' params, a grid size and a tier, and their encoding SHALL be those its
description states (`described-fill-game`), with no departure from the codec
grammar. The tier letters SHALL be `e`, `h`, `x` and `u` for Easy, Normal,
Tricky and Unreasonable, upstream's. A params string that carries no tier
SHALL decode to Easy. The menu SHALL offer 4×4, 5×5 and 6×6 at every tier,
and the default board SHALL be 5×5 Easy.

#### Scenario: The tier letters are not the tiers' initials

- **WHEN** `5dh` is decoded
- **THEN** it is a 5×5 board at Normal, whose short form is `5`
- **AND** `4` decoded is a 4×4 board at Easy

### Requirement: Params: A 3×3 Towers is not dealt above Normal

When a board is to be dealt, a 3×3 board at Tricky or Unreasonable SHALL be
refused, in the collection's sentence for a size that has no board of the
tier, because no 3×3 board needs more than Normal.

#### Scenario: A 3×3 Tricky is asked for

- **WHEN** a board of `3dx` is to be dealt
- **THEN** it is refused: "No 3x3 puzzle is Tricky."
- **AND** a board of `3dh` is dealt

### Requirement: Description: Towers descriptions encode edge clues and grid givens

The desc SHALL encode the `4w` edge clues first (top row, then bottom row, then
left column, then right column) as `/`-separated fields, each either a decimal
clue (`1..w`) or empty for "no clue"; optionally followed by `,` and the grid
givens in scan order, run-length-encoded: a letter `a`–`z` for `1`–`26`
consecutive blanks, a decimal digit for a given tower, and a `_` between two
givens that stand next to each other.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board is generated and its desc decoded by `newState`
- **THEN** every edge clue is placed at its decoded index
- **AND** every given tower stands in the cell the generator left it in

### Requirement: Description: Towers' reading of a description refuses a malformed one

The reading of the desc SHALL refuse the wrong number of clue fields, a clue
out of `1..w`, an out-of-range given, grid data of a length other than `w²`,
a `_` anywhere but between two adjacent givens, and clues and givens that
have no answer or more than one.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with too few clue fields, or a grid of the wrong length, is
  read
- **THEN** it is refused with an error and no state is built

#### Scenario: Two facing clues of the grid size

- **WHEN** a 4×4 desc has 4 at both ends of a row
- **THEN** it is refused as contradictory, since both ends would hold height 1

### Requirement: Generation: Each Towers tier adds deductions to the one below

An Easy board SHALL fall to the singles of the Latin square and to the clue
deductions that enumerate nothing. Normal SHALL add a clue's arrangements,
every way of filling its line that shows the clue's count, and the row and
column sets; Tricky the single-number sets and the wing; and Unreasonable
forcing chains and a guess that is verified.

#### Scenario: The solver capped at Easy

- **WHEN** the solver is run on a board with its cap at Easy
- **THEN** it tries no clue's arrangements and no set, and reports a board
  that needs either as unfinished

### Requirement: Generation: An Easy Towers board keeps every clue

An Easy board SHALL keep every one of its `4w` edge clues, and an Easy board
of up to 5×5 SHALL show no given, as upstream's; a deal whose clues alone do
not finish at Easy SHALL be drawn again. Above Easy the deal SHALL hide grid
givens first and then clues, each while the board stays solvable at its
tier.

#### Scenario: An Easy board and a Normal one

- **WHEN** a 5×5 board is dealt at Easy
- **THEN** every one of its `4w` clue fields holds a number and no square
  holds a given
- **AND** a board dealt above Easy may leave clue fields empty

### Requirement: Solver: Towers' ladder is its description

Towers' solver SHALL run the ladder of `towers.description.yaml`: the full
line, the tallest nearest and the facing pairs, which place towers; the clue
bounds and the arrangements, which strike heights; and the Latin library's
it places, each at the tier the description gives it, checked sound against
the description's rules, a Latin square whose clues count the towers seen
along their lines. The search above them stays the engine's.

#### Scenario: The facing pairs place their towers once

- **WHEN** a board has two facing pairs that sum to one more than its size,
  and the solver is asked at any cap
- **THEN** its first firing places the tallest tower in both lines, recorded
  with each pair
- **AND** no later call of the facing technique is a firing, since both
  towers then stand

#### Scenario: A height no arrangement allows is struck at Hard

- **WHEN** no filling of a clue's line from its cells' candidates, every
  height once, that shows the clue's count puts a height in a cell, at a cap
  of Normal or above
- **THEN** the solver strikes that height from that cell, in a firing of its
  own for the cell, recorded with the clue

### Requirement: Controls: Towers selects a cell by pointer or by keyboard cursor

Towers SHALL take its selection from the engine's note-taking cell
(`engine-notes`, "The note-taking cell is one shared mechanic"). Under the 3D
appearance the pointer's hit-testing SHALL follow the towers, so a press on a
tower protruding from a neighboring cell selects that neighbor.

#### Scenario: A press lands on a neighbor's tower

- **WHEN** the 3D appearance is on and the player presses inside one cell's
  square, on the top face of the tower standing in the cell below it
- **THEN** the cell below is the one selected

### Requirement: Controls: A digit enters a tower or toggles its pencil mark, and Backspace, Space or 0 clears

With a cell highlighted, a digit `1..w` SHALL enter that tower, or toggle that
pencil mark in pencil mode, and Backspace, Space (`CURSOR_SELECT2`) or `0`
SHALL clear the cell. Immutable (given) cells SHALL reject entry. In pencil
mode no key SHALL change a cell that holds a tower.

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)

### Requirement: Controls: An outside clue is struck through by a click or a modified cursor key

A press on an outside clue, a drag across outside clues, or a cursor key held
with Shift or Ctrl that points onto one, SHALL toggle that clue's
struck-through ("done") state, as every born game's clue marked done
(`described-fill-game`).

#### Scenario: Clue strike toggles

- **WHEN** the player clicks an outside clue
- **THEN** that clue's done flag is toggled, and it is drawn gray

### Requirement: Preferences: Towers exposes an appearance preference

The game SHALL offer an appearance preference under the key `appearance`, a
choice of 2D or 3D in that order, defaulting to 3D.

#### Scenario: Appearance preference drives rendering style

- **WHEN** the appearance preference is changed between 3D and 2D
- **THEN** subsequent frames render in the selected style

### Requirement: Preferences: Towers auto-pencils row/column eliminations on placement

With auto-pencil on, a placement SHALL strike its height from the pencil marks
of every other cell in the same row and column.

#### Scenario: Placing a tower clears matching notes in its line

- **WHEN** auto-pencil is on and the player places height `n` in a cell
- **THEN** every other empty cell in that cell's row and column loses candidate `n`
  from its pencil marks
- **AND** cells sharing neither the row nor the column keep candidate `n`

### Requirement: Hint: Towers' hint is the shared candidate plan over rows and columns

Towers' hint SHALL be the candidate walk every born game with notes hints
through (`described-fill-game`), over rows and columns, with no departure.
Its techniques SHALL be its description's, each saying its clue in words
the description states, a value called a height. What its marks stand for
SHALL be the legend's (`hint.marks`).

#### Scenario: A single on a Towers board

- **WHEN** a step places a height because it fits one cell of its row
- **THEN** its sentence calls the value a height, and reasons from no clue

### Requirement: Hint: A Towers clue elimination strikes one height a leg

An elimination step SHALL clear what a single technique firing rules out, and a
firing that rules out several heights SHALL be one leg for each height.

#### Scenario: A clue elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a clue
  line-of-sight deduction rules a height out of one or more cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates

### Requirement: Hint: Towers' own rung is the clue lines that need no notes

The clue lines that need no notes SHALL be techniques that place and read no
note, offered before the notes are set up: a clue equal to the grid size,
whose line climbs from 1 beside the clue ("Clue 4 sees every tower in this
line, so heights must climb 1, 2, … from the clue"), and a clue of 1, which
has the tallest tower beside it ("Clue 1 sees one tower in its line, so the
tallest must stand next to it").

#### Scenario: A full-height clue opens an empty board

- **WHEN** a hint is requested on an empty board with no notes, one of whose
  clues equals the grid size
- **THEN** the plan opens by placing that clue's line in order from the clue,
  one cell a leg, before any step that fills in notes

### Requirement: Hint: Facing Towers clues that sum to one more than the grid size place the tallest tower

Where the clues at the two ends of a row or column sum to one more than the
grid size, the line climbs to its tallest tower from both ends, so a step SHALL
place the tallest height in the cell that is as many cells from a clue as that
clue's number. It SHALL outline both clues, stripe their line and say "These
facing clues sum to one more than the grid size, so their line's tallest is
pinned".

#### Scenario: A 2 facing a 3 on a 4×4 board

- **WHEN** a row of a 4×4 board has 2 at its left end and 3 at its right, as
  the top row of `2/1/2/4/2/4/2/1/2/3/1/3/3/2/2/1` has
- **THEN** the facing pair puts height 4 in that row's second cell from the
  left

### Requirement: Hint: A Towers clue one short of its count keeps the short heights from the cell beside it

Where the towers a clue already sees, the placed heights from the tallest
down until one is missing, each nearer than the last, number one fewer than
the clue, the cell beside the clue holds the last tower it sees. A step SHALL
strike from that cell as many of the shortest heights as there are cells
between it and the nearest tower counted, none at or behind that tower, a
height a step ("Clue 2 already sees 1 tower in the line, so the cell nearest
it must top all between; height 1 can't").

#### Scenario: The tallest tower stands fourth from a clue of 2

- **WHEN** a clue of 2 on a 5×5 board has height 5 in the fourth cell of its
  line and no other tower in it
- **THEN** heights 1 and 2 are struck from the cell beside the clue, one for
  each of the two cells between

### Requirement: Hint: A Towers height is struck from the cells too near a clue to hide it

For a clue of `c`, taking the heights from the tallest down, a step SHALL
strike the first from the `c − 1` cells nearest the clue, the next from the
nearest `c − 2`, and so on, one leg a height ("Clue 3 sees exactly 3 towers
along its line; height 5 so near it would hide too many"). A placed height
SHALL be passed over, taking no place in that count, exactly when a placed
height at least two taller stands nearer the clue; one hidden only by the
height next above it SHALL take its place.

#### Scenario: A clue of 3 on an empty 5×5 line

- **WHEN** a clue of 3 looks along a line of a 5×5 board with no tower in it
- **THEN** height 5 is struck from the two cells nearest the clue and height 4
  from the nearest one

#### Scenario: A 3 behind the 5 is passed over

- **WHEN** a clue of 4 looks along a line of a 5×5 board whose fourth cell
  holds 5 and whose fifth holds 3
- **THEN** height 4 is struck from the two cells nearest the clue and height 2
  from the nearest one, the 3 having taken no place

### Requirement: Hint: A Towers height that no arrangement of a clue's line allows is struck

For a clue, the hint SHALL consider every order of heights along its line that
the cells' remaining heights allow and that shows exactly the clue's count of
towers, and a step SHALL strike a height from a cell where none of them puts
it ("No way for clue 2 to show exactly 2 towers along its line puts height 4
here"). The step SHALL count every cell of the line as read, since each one's
remaining heights decide which orders are allowed.

#### Scenario: A clue of 2 on a 3×3 line

- **WHEN** a clue of 2 looks along a line of a 3×3 Normal board whose cells
  hold every height in their notes, but for 3 struck from the cell beside the
  clue as too near it
- **THEN** height 2 is struck from the middle cell, since with 2 there the
  line reads 1, 2, 3 and shows three towers, or 3, 2, 1 and shows one
- **AND** on an Easy board no arrangement strikes it

### Requirement: Hint: Towers' clue eliminations are tried a facing pair first and arrangements last

The deductions `hint` narrates SHALL be found in the order the description
states them, beginning again after each: the row and column placements, the
full lines, the tallest nearest and the facing pairs; then, clue by clue, the
one short of its count and the heights too near it; the row and column
singles; and only then, on a board above Easy, a clue's arrangements, ahead
of the sets. `hint` SHALL use no deduction above the board's own tier.

#### Scenario: An Easy board never hears of arrangements

- **WHEN** the hint is followed on an Easy 4×4 board with nothing entered
- **THEN** no step of the plan speaks of an arrangement, a set or a chain

### Requirement: Look: Towers renders in selectable 3D and 2D styles with pencil marks

`redraw` SHALL render the `w × w` play area surrounded by the outside clue
cells, with each filled cell drawn, under the default 3D appearance preference,
as a tower whose height scales the drawn solid, and under the 2D preference as
a plain centered digit. Empty cells SHALL show their pencil marks in an
auto-sized grid layout.

#### Scenario: Initial 3D frame draws clues and towers

- **WHEN** the initial frame of a generated board is rendered with the 3D
  preference
- **THEN** the outside clue digits are drawn
- **AND** each given tower is drawn as a tower solid

#### Scenario: 2D preference suppresses the tower solids

- **WHEN** the same board is rendered with the appearance preference set to 2D
- **THEN** given towers are drawn as centered digits with no tower polygons

### Requirement: Look: Towers tells its inks apart

The renderer SHALL color given towers, user-entered towers, struck-through
("done") clues, and errors distinctly.

#### Scenario: Two towers of one height in a row

- **WHEN** the player enters a height a second time in one row
- **THEN** both are marked in the error color, as a repeat is on every
  board of numbers

### Requirement: Look: Towers stands its towers on a quiet surface, with a given's lifted

`redraw` SHALL draw every play cell on the collection's cell surface, and a
cell holding a given tower on the collection's lifted surface of a given, so
that a given is told by its surface as well as by its ink. Under the 3D
appearance a tower's top and both its faces SHALL take its cell's surface, and
the tower's own edges SHALL stay in ink, since the tower is the content.

#### Scenario: A given tower is told by its surface

- **WHEN** a board with given towers is drawn
- **THEN** each given's cell, and its tower's faces under the 3D appearance,
  are the lifted surface
- **AND** every other play cell is the cell surface

### Requirement: Look: The grid line recedes and never crosses a tower's base

The line between two play cells and the frame round the play area SHALL be the
collection's surface grid line, and SHALL NOT be drawn across the base of a
tower standing beside it. Under the 2D appearance every line of the grid SHALL
be that line. The clue ring SHALL stay on the board, outside the surface.

#### Scenario: A tower keeps its edges and the grid recedes

- **WHEN** a board is drawn with the 3D appearance
- **THEN** a tower's outline is ink
- **AND** the edges of an empty play cell are the surface grid line

### Requirement: Look: The selection's wash and the hint's marks keep to the cell

The selection's wash SHALL be drawn on a tower's faces as on its top. The
hint's marks SHALL stay on the cell's border.

#### Scenario: A tower the player entered is selected

- **WHEN** a cell holding a tower the player entered is selected for real
  entry under the 3D appearance
- **THEN** the tower's top and both its faces are drawn in the wash

### Requirement: Look: Towers draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each tower whose height repeats in its row or column, and each
clue whose line can no longer show its count (`Game.rules`), reading every
tower its line already holds, open squares before them included.

#### Scenario: A clue that sees its count with the tallest still to come

- **WHEN** a 4×4 row's left clue is 2 and the player enters 2 and then 3 in
  its first two squares
- **THEN** the clue is drawn red while the row's other squares are open,
  since the 4 still to come would be a third tower seen

#### Scenario: A tower past an open square

- **WHEN** a 4×4 line's clue is 4, its nearest square is open, and its
  second square holds a 4
- **THEN** the clue is drawn red, since it can see at most the open square's
  tower and the 4, and nothing beyond the 4
