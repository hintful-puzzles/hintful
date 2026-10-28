# unequal Specification

## Purpose
Unequal (Futoshiki), the Latin-square puzzle whose clues between squares
constrain neighbors: greater-than signs in Unequal mode, and in Adjacent mode
bars on exactly the pairs of consecutive values. This spec holds the puzzle's
rules, its params and description formats, its controls and keypad, what its
generator promises, how its board looks, its mistake check, and its explained
deduction hint. What it shares with every note-taking game is in
`engine-notes`, `engine-hints` and `engine-candidate-hints`.

## Requirements

### Requirement: Rules: Unequal is a Latin square with clues between neighbors

Unequal SHALL be a Latin-square puzzle on an `order × order` grid: the player
places a number `1..order` in every cell so each row and column contains every
number exactly once, subject to clues between orthogonally adjacent cells. The
board SHALL be reported solved exactly while the filled grid satisfies every
row, column and clue constraint.

#### Scenario: Entering the last correct number completes the board

- **WHEN** the player enters the final number that completes a correct grid
- **THEN** `status` reports the resulting state as solved

### Requirement: Rules: Unequal has two modes

The game SHALL support two modes. In **Unequal** a greater-than sign between
two cells means the number at its open end is greater than the number at its
pointed end. In **Adjacent** a bar between two cells means their numbers differ
by exactly 1, and the absence of a bar between two cells means they do not.

#### Scenario: A missing bar is a clue

- **WHEN** an Adjacent-mode grid is filled as a Latin square in which two
  neighboring cells with no bar between them hold 2 and 3
- **THEN** the board is not solved

### Requirement: Rules: Unequal's mistake check re-solves from its givens and clues

Unequal's `findMistakes` SHALL judge the board against the answer it re-solves
from the givens and clues.

#### Scenario: A wrong number that breaks no rule

- **WHEN** the player enters a number that repeats nothing in its row or
  column, breaks no sign or bar as the board stands, and is not the answer's
- **THEN** `findMistakes` includes that cell

### Requirement: Params: Unequal's parameters and their encoding

Params SHALL be `order`, `mode` (Unequal or Adjacent), and `diff`, held as the
values `"trivial"`, `"easy"`, `"tricky"`, `"extreme"` and `"recursive"`, which
are the tiers Easy, Normal, Tricky, Hard and Unreasonable in that order. They
SHALL be encoded `{order}` with an `a` suffix for Adjacent mode and a `d{c}`
suffix for difficulty when full, `c` being `t`, `e`, `k`, `x` or `r` in that
order of the values. A string with no `d` SHALL decode as Normal.

#### Scenario: A string with no difficulty

- **WHEN** `4` is decoded
- **THEN** it is a 4×4 Unequal board at Normal, whose full form is `4de`
- **AND** `5a` decoded is an Adjacent 5×5 board at Normal

#### Scenario: Params round-trip

- **WHEN** params `{ order: 5, mode: "adjacent", diff: "tricky" }` are encoded
  with `full = true`
- **THEN** the result is `5adk`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `5a`

### Requirement: Params: Unequal refuses small Adjacent boards and the 3×3 tiers no board needs

`validateParams` SHALL refuse an Adjacent puzzle of Tricky difficulty or
harder below order 5, and SHALL refuse, when a board is to be dealt, an order
of 3 at Tricky or Unreasonable, which no 3×3 board needs.

#### Scenario: A small Adjacent puzzle has no upper tiers

- **WHEN** `validateParams` is called with an Adjacent puzzle below order 5 at
  Tricky or harder
- **THEN** it returns a non-null error string

#### Scenario: A 3×3 at Hard deals

- **WHEN** a board is to be dealt from the params `3dx`
- **THEN** it is not refused, and the board dealt needs Hard

#### Scenario: A 3×3 at Unreasonable is refused

- **WHEN** a board is to be dealt from the params `3dr`
- **THEN** it is refused with "No 3x3 puzzle is Unreasonable."
- **AND** a board that arrives with its description under those params opens

### Requirement: Description: Unequal descriptions encode per-cell numbers and adjacency flags

The desc SHALL encode the grid in scan order as one field per cell, each ending
in a comma: a decimal number (`0` for a blank cell) followed by zero or more of
the flag letters `U`, `R`, `D`, `L`, in that order, marking an adjacency clue
toward the up, right, down, or left neighbor.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board is generated and its desc decoded by `newState`
- **THEN** every given number is on the board and cannot be edited
- **AND** every adjacency flag is placed at its decoded cell
- **AND** every non-given cell starts empty with no pencil marks

### Requirement: Description: A malformed Unequal description is refused

A desc SHALL be refused when it has the wrong number of cells, a number outside
`0..order`, a flag pointing off the grid, or contradictory flags: in Adjacent
mode a clue toward a neighbor requires the reciprocal clue back, and in Unequal
mode a `>` toward a neighbor forbids the reciprocal `>`. Every cell SHALL be
written out: a letter standing for a run of blank cells SHALL be refused.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with the wrong number of cells or a flag that points off the
  grid is validated
- **THEN** the result is a non-null error

#### Scenario: A bar flagged from one end only

- **WHEN** an Adjacent-mode desc flags a clue toward a neighbor that does not
  flag it back
- **THEN** the desc is refused as contradictory

### Requirement: Generation: What an Unequal board promises at its tier is the collection's

What a board dealt at a tier promises SHALL be the collection's
(`engine-difficulty`, "Every tier promises one solution found at its cap", "A
difficulty tier binds the board it generates" and "A generator never settles
for a lower tier"), in both modes and with no departure.

#### Scenario: An Adjacent board at Hard

- **WHEN** a board is dealt from the params `5adx`, Adjacent 5×5 at Hard
- **THEN** the solver capped at Tricky does not finish it, and capped at Hard
  it does

### Requirement: Generation: An Adjacent board carries every bar

In Adjacent mode `newDesc` SHALL flag every adjacency the solution implies, so
that the absence of a bar is a clue, and only number givens are added and
stripped.

#### Scenario: An Adjacent board carries every bar

- **WHEN** a board is generated in Adjacent mode
- **THEN** a bar is flagged, from both ends, between every pair of neighboring
  cells whose solution values differ by exactly 1, and between no other pair

### Requirement: Controls: A digit places a number or toggles its pencil mark, and Backspace or Space clears

Unequal SHALL take its selection from the engine's note-taking cell
(`engine-notes`, "The note-taking cell is one shared mechanic"). With a cell
highlighted, a digit `1..order` (entered as a digit, or a letter for 11 and
above) SHALL place that number, or toggle the pencil mark in pencil mode, and
backspace, space, or below order 10 the `0` key, SHALL clear it. Immutable
(given) cells SHALL reject entry, and in pencil mode no key SHALL change a
cell that holds a number.

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)

### Requirement: Controls: A clue is struck through by a click or a modified arrow

A click of either button on a greater-than sign or adjacency bar in the gap
between two cells, or a shift/ctrl-cursor toward a neighboring clue, SHALL
toggle that clue's struck-through ("spent") state.

#### Scenario: Clicking a clue toggles its spent state

- **WHEN** the player clicks a greater-than sign or adjacency bar
- **THEN** `executeMove` toggles that clue's spent flag

### Requirement: Controls: Unequal provides on-screen key labels

Unequal SHALL implement `requestKeys(params)` returning one button per grid
value `1..order` followed by a clear key (button code `8`, labeled `"Clear"`),
in both the Unequal and Adjacent modes. Each value button's label SHALL be its
own character.

#### Scenario: The keypad covers the grid's digits plus clear (order < 10)

- **WHEN** the key labels are requested for an order-4 Unequal board
- **THEN** the result is the buttons `1,2,3,4` followed by a clear key

### Requirement: Controls: The keypad is zero-based from order 10

The value-to-button mapping SHALL depend on the order, so it does not come from
the shared `digitKeys` helper the other digit games use. For `order < 10` the
buttons SHALL be `'1'..'9'`, value `v` being the character `'0' + v`. For
`order ≥ 10` the keypad SHALL be `'0'`-based: `'0'..'9'` cover values `1..10`
and `'a'`, `'b'` and so on cover `11..order`.

#### Scenario: The keypad is '0'-based for order ≥ 10

- **WHEN** the key labels are requested for an order-11 Unequal board
- **THEN** the result is the buttons `0,1,…,9,a` (values 1..11) followed by a clear key

### Requirement: Preferences: Auto-pencil strikes a placed number from its row and column

With auto-pencil on, placing a number SHALL strike it from the pencil marks of
the other cells of its row and column.

#### Scenario: A number is placed with auto-pencil on

- **WHEN** auto-pencil is on and the player places a number in a cell whose
  row and column hold cells penciled with it
- **THEN** no other cell of that row or column pencils that number

### Requirement: Hint: Unequal's hint is the shared candidate plan over rows and columns

Unequal's hint SHALL be the collection's candidate-elimination plan, taken
through its row/column preset (`engine-candidate-hints`, "A shared
candidate-elimination hint plan" and "A row/column Latin square answers no
question its regions already settle"), departing only in the reading it starts
on. Unequal SHALL supply its recording solver and the words of its sign and
bar deductions, which the requirements below state. What its marks stand for
SHALL be the legend's (`hintMarks`).

#### Scenario: A single on an Unequal board

- **WHEN** a step places a number because it fits one cell of its row
- **THEN** its sentence is the shared narrator's and names no sign or bar

### Requirement: Hint: A clue elimination is one firing of one clue

A clue elimination SHALL be the Unequal-mode greater-than "link" bound
deduction or the Adjacent-mode differ-by-1 deduction: a single technique
firing, striking the candidates it rules out of one cell by one `pencilStrike`
move. One recorded firing (one inequality link, or one cell and direction of an
adjacency clue) SHALL map to exactly one `group`, so a hint step never mixes
clues.

#### Scenario: A strike step stays in its narrated cell

- **WHEN** a clue elimination's step is built in either mode
- **THEN** every mark its `pencilStrike` clears lies in one cell, and that cell
  is one of the two the clue sits between

#### Scenario: An inequality bound is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled Unequal-mode board
  where a greater-than clue rules a value out of one of its two cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the narration names the greater-than relationship and the bounding
  cell's smallest/largest possible value, concluding in the necessity voice

#### Scenario: An adjacency clue is taught in Adjacent mode

- **WHEN** the player asks for a hint on a fully-penciled Adjacent-mode board
  where a bar (or its absence) beside a filled cell rules a value out of the
  neighbor
- **THEN** the hint returns a `pencilStrike` step clearing those candidates, the
  narration stating that the two numbers must (or must not) differ by exactly one

### Requirement: Hint: The hint starts on the implicit reading

Unequal's `newUi` SHALL state the implicit reading of an unmarked cell, because
a sign strikes from one cell at a time.

#### Scenario: A hint on a board with no notes

- **WHEN** a hint is asked, under the game's own default reading, on a board
  with no pencil notes
- **THEN** no step is the fill-all move

### Requirement: Hint: Unequal's clue sentences read correctly at the ends of the range

A clue step's indication SHALL be the inequality or adjacency pattern, and its
sentence SHALL read correctly at the degenerate value extremes: the
differ-by-1 clue SHALL speak of being one away from N and SHALL NOT say "N−1
or N+1".

#### Scenario: A bound at the edge of the range

- **WHEN** a greater-than clue strikes 1 from its larger cell while the cell
  across it can still be 1
- **THEN** the narration says the larger side cannot hold the smallest number,
  and does not say the other cell is "at least 1"

### Requirement: Hint: The hint's marks are drawn in the gap beside the box

The hint's marks SHALL stay in the gap beside the box.

#### Scenario: A selected box a hint rings

- **WHEN** an empty box is selected for an entry while a hint rings it
- **THEN** the wash fills the box, and the ring is drawn in the gap around it

### Requirement: Hint: A bar is read against a neighbor that is still undecided

In Adjacent mode the hint SHALL rule out of a cell each number that fits none
of the numbers still open in a neighbor: across a bar, a number with nothing
open one away from it there, and across a gap with no bar, a number that every
open number there equals or is one away from. It SHALL say "A bar joins this
cell to its neighbor with nothing open one away from" those numbers, or "No bar
joins this cell to its neighbor, whose numbers all clash with" them.

#### Scenario: A bar beside a neighbor down to two numbers

- **WHEN** a bar joins a cell that can still be 1 to 5 to a neighbor whose
  open numbers are 1 and 2
- **THEN** 4 and 5 are ruled out of the cell and 3 is kept, the neighbor's 2
  being one away from it
- **AND** the sentence says the neighbor has nothing open one away from 4 or 5

#### Scenario: A cell with no pencil marks

- **WHEN** the step's cell has no pencil marks and the hint reads an unmarked
  cell as holding every number its row and column do not
- **THEN** the step pencils in the numbers left, and its sentence ends "so this
  cell can only be" those numbers after the same premise

### Requirement: Hint: Unequal's hint reasons no harder than the board's tier

The hint's recording solver SHALL try a lower tier's technique before a
higher one's and, on a board below Unreasonable, SHALL be capped at the
board's own tier. So a sign's bound and a bar beside a placed number SHALL be
offered from Normal up, a bar read against an undecided neighbor and a set
within one row or column from Tricky up, and one number's places across
several rows and columns at Hard.

#### Scenario: A Normal board in Adjacent mode

- **WHEN** a hint is asked on a board dealt from the params `5ade`, Adjacent
  5×5 at Normal
- **THEN** no step reads a bar against an undecided neighbor, and none is a
  set

#### Scenario: An Easy board has no clue strikes

- **WHEN** a hint is asked on a board dealt from the params `4dt`, 4×4 at Easy
- **THEN** no step reasons from a sign: each one places a number, as the last
  its row and column leave the cell or in the last cell of a row or column
  left for it

### Requirement: Look: Unequal renders greater-than signs or adjacency bars between cells

`redraw` SHALL render the `order × order` grid with a gap between cells,
drawing, in Unequal mode, a greater-than sign in the gap pointing from the
larger toward the smaller cell of each inequality clue, and, in Adjacent mode,
a bar in the gap of each adjacency clue. Each clue SHALL be colored to
distinguish a normal clue, a currently-violated clue (red), and a
struck-through ("spent") clue.

#### Scenario: Unequal mode draws greater-than signs

- **WHEN** the initial frame of a generated Unequal-mode board is rendered
- **THEN** a greater-than polygon is drawn in the gap of each inequality clue

#### Scenario: Adjacent mode draws adjacency bars

- **WHEN** the initial frame of a generated Adjacent-mode board is rendered
- **THEN** an adjacency bar is drawn in the gap of each adjacency clue

### Requirement: Look: Unequal draws a cell's number or its pencil marks

Filled cells SHALL show their number, colored to distinguish given,
user-entered, and error cells. Empty cells SHALL show their pencil marks in an
auto-sized grid layout.

#### Scenario: A duplicate is drawn as an error

- **WHEN** the player enters a number its row already holds
- **THEN** the entered number is drawn in the error color, and a given is still
  drawn in the color of a given

### Requirement: Look: Unequal draws its boxes as quiet surfaces, with a given's lifted

`redraw` SHALL draw each cell as its own box, apart from its neighbors, on the
collection's cell surface, and a box holding a given number on the collection's
lifted surface of a given, so that a given is told by the box under it as well
as by its ink. A box's outline SHALL be the collection's surface grid line. The
signs and bars between boxes are clues and SHALL keep their own colors, drawn
on the board between the boxes.

#### Scenario: A given is told by the box under it

- **WHEN** a board with given numbers is drawn
- **THEN** each given's box is the lifted surface
- **AND** every other box is the cell surface, outlined in the surface grid line
