# towers Specification

## Purpose
Towers (Skyscrapers), the Latin-square puzzle whose edge clues count the towers
visible from that side: its params and description formats, its 3D and 2D
styles and the surfaces they stand on, its sticky pencil mode, an optional
auto-pencil that strikes a placed height from its row and column, clue
striking, a mistake check that also catches a pencil note excluding the true
height, its keypad, and what is Towers' own in a hint explained through pencil
notes.

## Requirements

### Requirement: Towers is Skyscrapers on a Latin square

Towers SHALL be the puzzle Skyscrapers on a `w × w` grid, in which the player
places a tower of height `1..w` in every cell so that each row and column
contains every height exactly once, and so that each outside clue equals the
number of towers visible from that edge (a taller tower hides every shorter one
behind it).

#### Scenario: A taller tower hides the shorter ones behind it

- **WHEN** a line reads 2, 4, 1, 3 going away from its clue
- **THEN** that clue is satisfied only if it is 2

### Requirement: Towers' parameters are a grid size and a difficulty

Params SHALL be `w` and a difficulty (Easy, Normal, Tricky, or Unreasonable),
encoded `{w}d{c}` when full, with `c` being `e`, `h`, `x` or `u` in that order
of tier, and `{w}` otherwise.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, diff: "unreasonable" }` are encoded with `full = true`
- **THEN** the result is `6du`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`

### Requirement: Towers' grid size runs from 3 to 9

The grid-size item of `paramConfig` SHALL declare the bounds 3 and 9, so that
the engine refuses a `w` outside them. A difficulty letter that names no tier
SHALL decode to the default tier. When full, `validateParams` SHALL refuse a
3×3 board above Normal.

#### Scenario: Invalid params are rejected

- **WHEN** params with `w < 3` or `w > 9` are checked
- **THEN** they are refused with a sentence that names the grid size

### Requirement: Towers descriptions encode edge clues and grid givens

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

### Requirement: Towers' reading of a description refuses a malformed one

The reading of the desc that `newState` builds from SHALL refuse the wrong
number of clue fields, a clue out of `1..w`, an out-of-range given, grid data of
a length other than `w²`, and a `_` anywhere but between two adjacent givens.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with too few clue fields, or a grid of the wrong length, is
  read
- **THEN** it is refused with an error and no state is built

### Requirement: Towers generates uniquely-solvable boards at the target difficulty

A generated board SHALL be uniquely solvable, and solvable by the graded solver
at exactly the chosen difficulty and no lower. An Easy board SHALL keep every
one of its `4w` edge clues; above Easy the generator SHALL remove clues as well
as grid givens, for as long as the board stays solvable at that difficulty.

#### Scenario: Generated board is unique and correctly graded

- **WHEN** a board is generated at a difficulty `d`
- **THEN** the solver solves it at difficulty `d`
- **AND** the solver does not solve it at any lower difficulty
- **AND** the solved grid is a valid Latin square satisfying every clue

### Requirement: Towers selects a cell by pointer or by keyboard cursor

Under the 3D appearance the pointer's hit-testing SHALL follow the towers, so a
press on a tower protruding from a neighboring cell selects that neighbor.
From the keyboard, Enter (`CURSOR_SELECT`) while the highlight shows SHALL
switch the highlight between real entry and pencil marks.

#### Scenario: A press lands on a neighbor's tower

- **WHEN** the 3D appearance is on and the player presses inside one cell's
  square, on the top face of the tower standing in the cell below it
- **THEN** the cell below is the one selected

### Requirement: Towers accepts digit, pencil, clue-strike, and solve moves

With a cell highlighted, a digit `1..w` SHALL enter that tower, or toggle that
pencil mark in pencil mode, and Backspace, Space (`CURSOR_SELECT2`) or `0`
SHALL clear the cell; entering a value a cell already holds SHALL be a
no-op. Immutable (given) cells SHALL reject entry.

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)

### Requirement: An outside clue is struck through by a click or a modified cursor key

A click on an outside clue, or a cursor key held with Shift or Ctrl that points
onto one, SHALL toggle that clue's struck-through ("done") state.

#### Scenario: Clue strike toggles

- **WHEN** the player clicks an outside clue
- **THEN** `executeMove` toggles that clue's done flag

### Requirement: Towers is solved while the filled grid breaks no rule

The board SHALL be reported solved exactly while the filled grid violates no
clue and no Latin constraint.

#### Scenario: Entering the last correct tower completes the board

- **WHEN** the player enters the final tower that completes a correct grid
- **THEN** `status` reports the state `executeMove` returns as solved

### Requirement: Towers renders in selectable 3D and 2D styles with pencil marks

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

### Requirement: Towers tells its inks and its selection apart

The renderer SHALL color given towers, user-entered towers, struck-through
("done") clues, and error cells distinctly.

#### Scenario: Two towers of one height in a row

- **WHEN** the player enters a height a second time in one row
- **THEN** both of those towers' digits are drawn in the error color

### Requirement: Towers repaints the neighbors a tower reaches into

Cells SHALL be diffed against a per-tile cache that accounts for a 3D tower's
protrusion into the neighbors above it and to its right.

#### Scenario: A tower is placed beside an empty cell

- **WHEN** a tower is entered under the 3D appearance
- **THEN** the cells above it, to its right and diagonally above-right are
  repainted in the same frame as its own

### Requirement: Towers exposes an appearance preference

The game SHALL offer an appearance preference under the key `appearance`, a
choice of 2D or 3D in that order, defaulting to 3D.

#### Scenario: Appearance preference drives rendering style

- **WHEN** the appearance preference is changed between 3D and 2D
- **THEN** subsequent frames render in the selected style

### Requirement: Towers checks for mistakes against the unique solution

`findMistakes` SHALL re-solve the board from its clues and givens, never from
the player's pencil notes, and return every marking that contradicts the unique
solution: a filled cell whose tower differs from it (`kind: "cell"`), and a
cell whose non-empty candidate set lacks its solution height (`kind: "note"`).
Both kinds SHALL render as the same red cell overlay. When the board is not
uniquely solvable from the givens, `findMistakes` SHALL return an empty result.

#### Scenario: A wrong tower is flagged

- **WHEN** the player enters a tower height that contradicts the unique solution
- **THEN** `findMistakes` includes that cell with `kind: "cell"`

#### Scenario: A note that excludes the correct height is flagged

- **WHEN** an empty cell carries pencil notes that do not include the cell's
  solution height
- **THEN** `findMistakes` includes that cell with `kind: "note"`

### Requirement: Towers offers a sticky pencil mode

Towers SHALL offer the sticky pencil preference, on by default. With it on, a
right-click SHALL toggle a persistent pencil mode and move the highlight to the
clicked cell, unless that cell can take no pencil mark, and a left-click SHALL
only move the highlight, preserving the current pencil or real mode. With it off, a
left-click SHALL revert to real entry and a right-click SHALL be a per-cell
pencil select. The keyboard path SHALL be the same with sticky mode on or off.

#### Scenario: Sticky mode keeps pencil entry across left-clicks

- **WHEN** sticky pencil mode is on and the player right-clicks a cell, then
  left-clicks a different cell
- **THEN** pencil mode stays on, the highlight moves to the second cell, and a
  digit there writes a pencil mark (not a real entry)
- **AND** the on-screen pencil-mode indicator is shown the whole time

#### Scenario: Sticky mode off, a left-click reverts to real entry

- **WHEN** the sticky pencil preference is off and the player right-clicks a cell
  to pencil it, then left-clicks another cell
- **THEN** the left-click reverts to real entry

### Requirement: Towers provides an explained, pencil-notes-based deduction hint

The hint SHALL teach Towers' candidate-elimination reasoning by setting and
striking pencil notes. It SHALL be the solver's own narrated deduction script:
the recording solver runs on a sound candidate cube seeded from the placed grid
only, never from the player's notes, and its ordered operations are expressed
against the player's live notes and grid as a sequence of `HintStep`s.

#### Scenario: The player has edited the notes

- **WHEN** a hint is requested on a mistake-free board whose notes the player
  has edited
- **THEN** the recording solver is seeded from the placed towers alone
- **AND** each step is expressed against the notes as they stand

### Requirement: A Towers hint step populates, eliminates or places

Under the `populate` reading Towers starts on, a hint's steps SHALL be of three
kinds: a populate step, emitted only when some empty cell lacks notes, that
fills every empty cell's candidate marks through the fill-all (`pencilAll`)
move; eliminate steps, each one `pencilStrike` move clearing what a single
technique firing rules out, one step for each height it rules out; and place
steps that fill a cell whose sound candidates have collapsed to one.

#### Scenario: A clue elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a clue
  line-of-sight deduction rules a height out of one or more cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates

### Requirement: A Towers hint is ordered the way a person solves

The hint's rung order SHALL put a naked single first: an empty cell whose live
notes have collapsed to a single candidate, which is sound on a mistake-free
board. After it SHALL come the clue lines that need no notes: a clue equal to
the grid size, whose line climbs from 1 beside the clue, and a clue of 1,
which has the tallest tower beside it. Then SHALL come the next clue
elimination, and after that a forced placement. A freshly built plan SHALL
open in that order.

#### Scenario: A naked single is offered ahead of further elimination

- **WHEN** a hint is requested on a mistake-free board where some empty cell's
  pencil notes have collapsed to a single candidate
- **THEN** the next step places that height in that cell

#### Scenario: A full-height clue opens an empty board

- **WHEN** a hint is requested on an empty board with no notes, one of whose
  clues equals the grid size
- **THEN** the plan opens by placing that clue's line in order from the clue,
  one cell a leg, before any step that fills in notes

### Requirement: A Towers hint step says what was spotted and why it forces the move

Each step SHALL carry a narration that meets the hint quality bar: it leads
with the spotted indication (the clue or line pattern), then gives the
reasoning, then a necessity-voice conclusion.

#### Scenario: A clue elimination is narrated

- **WHEN** a hint step strikes heights that a clue's line of sight rules out
- **THEN** the narration names the clue pattern and states why those heights
  cannot sit there, concluding in the necessity voice

### Requirement: A Towers hint step marks the clue it reasons from and the cells it acts on

Each step's highlight SHALL mark the driving clue cell or cells and their line
of sight, so the player can see which clue the hint is about: the clue
outlined in its slot beside the grid, and the line striped through the clue
slots at both its ends. It SHALL ring the target cell or cells and cross
through the struck candidates, with the equivalent strikes of one firing
sharing the target's mark.

#### Scenario: A clue elimination is marked

- **WHEN** a hint step strikes heights that a clue's line of sight rules out
- **THEN** the driving clue is outlined, its line of sight is striped, each
  cell struck from is ringed and each struck candidate is crossed through

### Requirement: Every Towers hint step is progress the hint never undoes

Every step SHALL be monotone progress: a note added by populate, a note removed
by eliminate, or a cell filled by place, never undone by the hint. A freshly
recomputed hint from any mistake-free mid-game position of a board whose tier
needs no search SHALL therefore make progress and lead to a solved board. On
recompute the script SHALL skip any operation whose effect is already on the
board and resume at the first that is not.

#### Scenario: The hint resumes from a self-played mid-game position

- **WHEN** a hint is requested from a mistake-free position, of a board whose
  tier needs no search, that the player reached by their own notes and
  placements
- **THEN** the freshly-recomputed hint makes progress (a strike or a placement)
  and, applied step by step with recompute, leads to a solved board

### Requirement: hintKeepTrack advances the plan when a move matches the step

`hintKeepTrack` SHALL advance the plan when the player's move matches the
displayed step's intent. A pencil toggle that clears one of a strike step's
marks SHALL be `onTrack`, the step shrinking in place to the marks left, or
`completed` when it clears the last; a `pencilStrike` of all the step's marks
SHALL be `completed`; a placement of the hinted value SHALL be `completed`.
A move that does not match SHALL drop the plan to recompute (`off`).

#### Scenario: A strike followed one note at a time

- **WHEN** a strike step shows two marks and the player clears one of them
  with a pencil toggle
- **THEN** the verdict is `onTrack` and the step's move strikes the other mark
  alone

### Requirement: Towers auto-pencils row/column eliminations on placement

The game SHALL provide an auto-pencil preference, off by default: when it is on
and the player places a tower height, the game SHALL strike that height from
the pencil marks of every other cell in the same row and column, and when it is
off a placement SHALL leave other cells' pencil marks untouched. The decision
SHALL be fixed at move-creation time, recorded on the move, so that replaying a
saved game is deterministic regardless of the preference's later value.

#### Scenario: Placing a tower clears matching notes in its line

- **WHEN** auto-pencil is on and the player places height `n` in a cell
- **THEN** every other empty cell in that cell's row and column loses candidate `n`
  from its pencil marks
- **AND** cells sharing neither the row nor the column keep candidate `n`

#### Scenario: Auto-pencil off leaves notes untouched

- **WHEN** auto-pencil is off and the player places a height
- **THEN** no other cell's pencil marks change

### Requirement: Towers provides on-screen key labels

Towers SHALL implement `requestKeys(params)` returning one button per digit
`1..w` (labeled by the digit character) followed by a clear key (button code
`8`, labeled `"Clear"`).

#### Scenario: The keypad covers the grid's heights plus clear

- **WHEN** the key labels are requested for a `5×5` Towers board
- **THEN** the result is the buttons `1,2,3,4,5` followed by a clear key

### Requirement: Towers stands its towers on a quiet surface, with a given's lifted

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

### Requirement: The grid line recedes and never crosses a tower's base

The line between two play cells and the frame round the play area SHALL be the
collection's surface grid line, and SHALL NOT be drawn across the base of a
tower standing beside it. Under the 2D appearance every line of the grid SHALL
be that line. The clue ring SHALL stay on the board, outside the surface.

#### Scenario: A tower keeps its edges and the grid recedes

- **WHEN** a board is drawn with the 3D appearance
- **THEN** a tower's outline is ink
- **AND** the edges of an empty play cell are the surface grid line

### Requirement: The selection's wash and the hint's marks keep to the cell

The selection's wash SHALL be drawn over whichever surface the cell has, on a
tower's faces as on its top. The hint's marks SHALL stay on the cell's border.

#### Scenario: A tower the player entered is selected

- **WHEN** a cell holding a tower the player entered is selected for real
  entry under the 3D appearance
- **THEN** the tower's top and both its faces are drawn in the wash
