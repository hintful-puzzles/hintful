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

Towers' `findMistakes` SHALL judge the board against the answer it re-solves
from the clues and givens. A wrong tower and a note set that lacks its height
SHALL render as the same red cell overlay.

#### Scenario: A wrong tower that breaks no rule

- **WHEN** the player enters a height that repeats nothing in its row or
  column, contradicts no clue as the board stands, and is not the answer's
- **THEN** `findMistakes` includes that cell, though nothing is drawn as an
  error before the check

### Requirement: Params: A Towers params string is its declared codec's, and one with no difficulty is Easy

Towers' params, a grid size and a difficulty, and their encoding SHALL be
those its `paramConfig` and its declared codec give (`engine-params`, "A game
declares its params encoding once, and both codec halves are derived"), with
no departure from the codec grammar. A params string that carries no
difficulty SHALL decode to Easy. Easy, Normal, Tricky and Unreasonable SHALL
be held in `diff` as `"easy"`, `"hard"`, `"extreme"` and `"unreasonable"`.

#### Scenario: The tier letters are not the tiers' initials

- **WHEN** `5dh` is decoded
- **THEN** it is a 5×5 board at Normal, whose short form is `5`
- **AND** `4` decoded is a 4×4 board at Easy

### Requirement: Params: A 3×3 Towers is not dealt above Normal

When a board is to be generated, `validateParams` SHALL refuse a 3×3 board
above Normal.

#### Scenario: A 3×3 Tricky is asked for

- **WHEN** `3dx` or `3du` is validated for a board that is to be generated
- **THEN** it is refused as a tier no 3×3 puzzle has
- **AND** the same params are accepted when a description comes with them

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

The reading of the desc that `newState` builds from SHALL refuse the wrong
number of clue fields, a clue out of `1..w`, an out-of-range given, grid data of
a length other than `w²`, and a `_` anywhere but between two adjacent givens.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with too few clue fields, or a grid of the wrong length, is
  read
- **THEN** it is refused with an error and no state is built

### Requirement: Generation: Each Towers tier adds deductions to the one below

An Easy board SHALL fall to the singles of the Latin square and to the clue
deductions that enumerate nothing. Normal SHALL add a clue's arrangements,
every way of filling its line that shows the clue's count, and the row and
column sets; Tricky the single-number sets and forcing chains; and
Unreasonable a guess that is verified.

#### Scenario: The solver capped at Easy

- **WHEN** the solver is run on a board with its cap at Easy
- **THEN** it tries no clue's arrangements and no set, and reports a board
  that needs either as unfinished

### Requirement: Generation: An Easy Towers board keeps every clue

An Easy board SHALL keep every one of its `4w` edge clues; above Easy the
generator SHALL remove clues as well as grid givens, for as long as the board
stays solvable at that difficulty.

#### Scenario: An Easy board and a Normal one

- **WHEN** a board is generated at Easy
- **THEN** every one of its `4w` clue fields holds a number
- **AND** a board generated above Easy may leave clue fields empty

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

A click on an outside clue, or a cursor key held with Shift or Ctrl that points
onto one, SHALL toggle that clue's struck-through ("done") state.

#### Scenario: Clue strike toggles

- **WHEN** the player clicks an outside clue
- **THEN** `executeMove` toggles that clue's done flag

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

Towers' hint SHALL be the collection's candidate-elimination plan, taken
through its row/column preset (`engine-candidate-hints`, "A shared
candidate-elimination hint plan" and "A row/column Latin square answers no
question its regions already settle"), with no departure. Towers SHALL supply
its recording solver, one rung of its own and its words, which the
requirements below state. What its marks stand for SHALL be the legend's
(`hintMarks`).

#### Scenario: A single on a Towers board

- **WHEN** a step places a height because it fits one cell of its row
- **THEN** its sentence is in Towers' own words for a height, and reasons from
  no clue

### Requirement: Hint: A Towers clue elimination strikes one height a leg

An elimination step SHALL clear what a single technique firing rules out, and a
firing that rules out several heights SHALL be one leg for each height.

#### Scenario: A clue elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a clue
  line-of-sight deduction rules a height out of one or more cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates

### Requirement: Hint: Towers' own rung is the clue lines that need no notes

Towers' own rung of the walk's ladder SHALL be the clue lines that need no
notes: a clue equal to the grid size, whose line climbs from 1 beside the
clue, and then a clue of 1, which has the tallest tower beside it.

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

Where the towers a clue already sees, taking the placed heights from the
tallest down until one is missing and counting each that stands nearer the clue
than the last, number one fewer than the clue, the cell beside the clue holds
the last tower it sees. A step SHALL strike from that cell as many of the
shortest heights as there are cells between it and the nearest tower counted,
leaving out a height that stands at or behind that tower ("Clue 2 already sees
all but one of its towers").

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

The deductions `hint` narrates SHALL be found in this order, beginning again
after each: first every facing pair; then, for each clue in turn, those above
the grid, below it, to its left and to its right, the clue one short of its
count and then the heights too near it; the row and column singles; and only
then, on a board above Easy, a clue's arrangements, ahead of the sets. `hint`
SHALL use no deduction above the board's own tier.

#### Scenario: An Easy board never hears of arrangements

- **WHEN** the hint is followed on the Easy 4×4 board
  `2/1/2/4/2/4/2/1/2/3/1/3/3/2/2/1` with nothing entered
- **THEN** once the notes are set up its first strike is a too-near one
  ("Clue 3 sees exactly 3 towers along its line; height 3 so near it would
  hide too many")
- **AND** no step of the plan speaks of an arrangement, a set or a chain

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
("done") clues, and error cells distinctly.

#### Scenario: Two towers of one height in a row

- **WHEN** the player enters a height a second time in one row
- **THEN** both of those towers' digits are drawn in the error color

### Requirement: Look: Towers repaints the neighbors a tower reaches into

Cells SHALL be diffed against a per-tile cache that accounts for a 3D tower's
protrusion into the neighbors above it and to its right.

#### Scenario: A tower is placed beside an empty cell

- **WHEN** a tower is entered under the 3D appearance
- **THEN** the cells above it, to its right and diagonally above-right are
  repainted in the same frame as its own

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
