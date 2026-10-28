# keen Specification

## Purpose
Keen (KenKen), the Latin-square puzzle whose cages each carry an arithmetic clue
their digits must satisfy: its rules, its params and description formats, what
each tier asks of the solver, its controls and preferences, how it looks, and
what its hint says of a cage. What it shares with every note-taking and
candidate-hint game is in `engine-notes` and `engine-candidate-hints`.

## Requirements

### Requirement: Rules: Keen is a Latin square with arithmetic cages

The player SHALL place a digit `1..w` in every cell of a `w × w` grid so that
each row and column contains every digit exactly once. The grid SHALL be
partitioned into contiguous cages, each labeled with a target value and an
operation (`+`, `−`, `×`, `÷`) that the cage's digits must satisfy. Subtraction
and division cages SHALL always have area 2.

#### Scenario: A division domino reads either way round

- **WHEN** a two-cell cage carries the clue `2÷`
- **THEN** the digits 3 and 6 satisfy it in either order
- **AND** the digits 2 and 5 do not

### Requirement: Rules: A Keen board is solved when its grid is complete without errors

`status` SHALL report solved exactly when every row and column holds each digit
once and every cage's digits satisfy its clue, so a placement that completes
the grid with no errors completes the game.

#### Scenario: The last digit goes in

- **WHEN** a placement fills the last empty cell and leaves no cage or line in
  error
- **THEN** `status` reports solved

### Requirement: Rules: Keen's mistake check re-solves from the cage clues

Keen's `findMistakes` SHALL judge the board against the answer it re-solves
from the cage clues alone.

#### Scenario: A wrong digit its cage allows

- **WHEN** the player fills a cage with digits that satisfy its clue and are
  not the answer's, repeating nothing in a row or column
- **THEN** `findMistakes` includes each cell whose digit is not the answer's,
  though no cell is in error as the board stands

### Requirement: Params: Keen's parameters

Keen's params SHALL be a grid size `w`, a tier `diff` and `multiplicationOnly`.
`diff` SHALL be one of Easy, Normal, Tricky, Hard or Unreasonable, held as the
keys `"easy"`, `"normal"`, `"hard"`, `"extreme"` and `"unreasonable"`, so the
Tricky tier is `"hard"`.

#### Scenario: The Tricky preset

- **WHEN** `6dh` is decoded
- **THEN** its `diff` is `"hard"`, and the board is labeled "6x6 Tricky"

### Requirement: Params: Keen's params encoding

Params SHALL be encoded `{w}` without `full` and `{w}d{c}{m?}` with `full`,
where `c` is `e`, `n`, `h`, `x` or `u` for the five tiers in order and a
trailing `m` marks a multiplication-only puzzle. A string with no `d` SHALL
decode as Normal, and one with no `m` as a puzzle with every operation.

#### Scenario: A string with no tier

- **WHEN** `6` is decoded
- **THEN** it is a 6×6 board at Normal with every operation, whose full form
  is `6dn`

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, diff: "hard", multiplicationOnly: false }` (the Tricky
  tier) are encoded with `full = true`
- **THEN** the result is `6dh`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`
- **AND** a multiplication-only puzzle's full encoding ends with `m`

### Requirement: Params: A 3×3 Keen is not dealt above Normal

When a board is to be generated, `validateParams` SHALL refuse a 3×3 puzzle at
any tier above Normal, in the collection's sentence for a size that has no
board of the tier, because no 3×3 board needs more than Normal.

#### Scenario: A 3×3 Tricky is asked for

- **WHEN** `validateParams` is called with `full = true` on
  `{ w: 3, diff: "hard" }`
- **THEN** it returns "No 3x3 puzzle is Tricky."
- **AND** called with `full = false` on the same params it returns null

### Requirement: Description: Keen descriptions encode the block structure and cage clues

The desc SHALL consist of the block structure followed by a comma and the clue
list. The clue list SHALL give, for each cage in the order of the cages'
minimal cells, an operation tag (`a` add, `s` subtract, `m` multiply, `d`
divide) followed by the decimal target value. Every cell SHALL start blank:
Keen has no givens.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board is generated and its desc decoded by `newState`
- **THEN** the cage partition and per-cage clues match what was encoded
- **AND** every cell starts empty with no pencil marks

### Requirement: Description: The block structure is run lengths between dividing lines

The block structure SHALL encode the pattern of internal dividing lines as
run lengths of non-edges over the `2·w·(w−1)` internal grid lines (vertical
lines in reading order, then horizontal lines in transposed order), using `_`
for a run of 0, `a`–`y` for 1–25, and `z` for 25 non-edges and no following
edge. A run of three or more of the same letter SHALL be written as that letter
followed by a decimal repeat count.

#### Scenario: Repeated letters are compressed

- **WHEN** the run lengths give the same letter four times in a row
- **THEN** the block structure holds that letter followed by `4`
- **AND** the same letter twice in a row is written as the letter twice

### Requirement: Description: A malformed Keen description is refused

A desc SHALL be refused when its block structure is malformed, when it gives
the wrong number of clues, when a clue tag is unrecognized, and when it gives a
subtraction or division clue to a cage whose area is not 2.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with a malformed block structure, too few or too many clues,
  or an unknown clue tag is loaded
- **THEN** it is refused with a non-null error string

#### Scenario: A subtraction clue on a cage of three cells

- **WHEN** a desc gives a subtraction or division clue to a cage that is not a
  domino
- **THEN** it is refused: "This game ID gives a subtraction or division clue to
  a block that isn't two cells."

### Requirement: Description: A Keen clue's value is one its cage could make

A desc SHALL be refused, as holding a number out of range for its board, when
a clue's value is outside what its operation could make of the cage: `1` to
the cage's area times `w` for an addition clue, `1` to `w` raised to the
cage's area for a multiplication clue, `1` to `w − 1` for a subtraction clue,
and `2` to `w` for a division clue. A value inside the range SHALL load
whether or not any digits make it.

#### Scenario: A dealt 4×4 board

- **WHEN** `__a__a_ba_a__a_b,m3d2s2a5m12s1a7` is loaded on `4de`
- **THEN** the board has seven cages, and the first, the two cells at the top
  of the left column, must multiply to 3
- **AND** the three-cell cage down the right column must multiply to 12

#### Scenario: A ratio of one

- **WHEN** that desc is loaded with its `d2` changed to `d1`
- **THEN** it is refused: "This game ID has a number out of range for its
  board."

#### Scenario: A product no two digits make

- **WHEN** that desc is loaded with its `m3` changed to `m5`
- **THEN** it loads, since 5 is no more than 16

### Requirement: Description: A Keen repeat count below three is refused

A decimal repeat count in the block structure SHALL be at least 3 and at most
the number of internal grid lines plus one. A count outside that SHALL refuse
the desc as holding a number out of range for its board, so two of the same
letter are only ever the letter written twice.

#### Scenario: A letter followed by 2

- **WHEN** `__a__a_ba_a__a_b,m3d2s2a5m12s1a7` is loaded on `4de` with its
  leading `__` changed to `_2`
- **THEN** it is refused: "This game ID has a number out of range for its
  board."

### Requirement: Generation: Keen's tiers are the Latin-square deductions a board needs

The solver SHALL accept a completed grid only when every cage's digits satisfy
its clue. Of the shared Latin-square deductions, Easy and Normal SHALL allow
the simple ones, Tricky the set deductions, Hard the deeper set deductions and
the wing, and Unreasonable forcing chains and recursion.

#### Scenario: Solver grades a known board

- **WHEN** the solver is run on a generated board at its difficulty
- **THEN** it returns that difficulty and fills the grid with the unique solution

### Requirement: Generation: A cage deduction enumerates the cage's layouts

The cage deductions SHALL enumerate, for each cage, the digit layouts
consistent with the current candidate cube and the cage's operation and value,
and SHALL prune the candidate cube accordingly: at Easy by amalgamating all
values, at Normal by per-square value bitmaps, and at Tricky by the cross-cage
"a digit required in this row or column" intersection.

#### Scenario: A cage needs a digit in one row

- **WHEN** at Tricky every consistent layout of a cage places a 1 somewhere
  along one row
- **THEN** 1 is removed from the candidates of that row's cells outside the cage

### Requirement: Generation: A Keen cage has at most six cells and a balanced mix of clues

Every cage SHALL have area at most 6, and the generator SHALL assign a balanced
mix of cage operations and values that avoids low-quality clues.

#### Scenario: The cages of a dealt board

- **WHEN** a board is generated for given params
- **THEN** no cage has more than 6 cells, and every subtraction or division
  cage has area 2

### Requirement: Controls: Keen selects a cell through the shared note-taking cell

Keen SHALL take its selection, its pencil mode and its Mark-all from the
engine's note-taking cell (`engine-notes`, "The note-taking cell is one shared
mechanic"). Every cell SHALL take an entry, since Keen has no givens, and only
an empty cell SHALL take a pencil mark.

#### Scenario: A right press on a filled cell without sticky mode

- **WHEN** sticky pencil mode is off and the player right-presses a cell that
  holds a digit
- **THEN** the highlight moves to that cell and is not shown, because the cell
  can take no pencil mark

### Requirement: Controls: A Keen digit key enters or pencils its digit, and 0, Backspace and Space clear

With a cell highlighted, a digit key `1..w` SHALL enter that digit, or in
pencil mode toggle that pencil mark, and backspace or space, which is the
cursor-select2 key, SHALL clear the cell. The `0` key SHALL clear the cell as
they do, and a digit key above `w` SHALL do nothing. In pencil mode no key
SHALL change a cell that holds a digit.

#### Scenario: Placing and penciling digits

- **WHEN** a cell is highlighted and a digit key is pressed
- **THEN** that digit is placed in the cell, or in pencil mode its pencil mark
  is toggled

#### Scenario: A digit the grid does not hold

- **WHEN** a cell of a 4×4 board is highlighted and `5` is pressed
- **THEN** nothing changes
- **AND** with pencil mode off, `0` pressed on a cell holding a digit empties
  it

#### Scenario: A clear key in pencil mode on a filled cell

- **WHEN** pencil mode is on, the cursor is on a cell holding a digit, and
  Backspace is pressed
- **THEN** no move is made and the digit stays

### Requirement: Preferences: Auto-pencil strikes a placed digit from its row and column

With auto-pencil enabled, a real placement SHALL additionally strike that digit
from the pencil marks of every other cell in its row and column.

#### Scenario: A digit is placed with auto-pencil on

- **WHEN** auto-pencil is on and the player places a 4 in a cell whose row and
  column hold cells penciled with 4
- **THEN** the new state has no 4 among the pencil marks of that row and column

### Requirement: Hint: Keen's hint is the shared candidate plan over rows and columns

Keen's hint SHALL be the collection's candidate-elimination plan, taken through
its row/column preset (`engine-candidate-hints`, "A shared candidate-elimination
hint plan" and "A row/column Latin square answers no question its regions
already settle"), with no departure. Keen SHALL supply its recording solver and
the words of its two cage deductions, which the requirements below state.

#### Scenario: A single on a Keen board

- **WHEN** a step places a digit because it fits one cell of its row
- **THEN** its sentence is the shared narrator's and names no cage

### Requirement: Hint: A cage elimination is one firing, and a firing is one cage's

A cage elimination SHALL be taught as one firing: no layout of the cage's
digits consistent with its clue leaves a candidate possible in a cage cell, or,
at the harder level, a digit the cage requires along a row or column is ruled
out elsewhere in that line. A firing SHALL be one cage's, so a hint step never
mixes cages.

#### Scenario: A cage elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a cage's
  arithmetic clue rules a digit out of one of its cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the cage's cells are striped and the cell is ringed in the hint color

#### Scenario: Two cages could prune at once

- **WHEN** the recording solver reaches a board on which two cages each rule a
  candidate out
- **THEN** each cage's eliminations are recorded under a `group` of their own

### Requirement: Hint: A cage deduction's sentence names the cage by its clue

A cage step's narration SHALL name the cage by its clue's goal ("sum to N",
"multiply to N", "differ by N", "have a ratio of N").

#### Scenario: A sum cage rules two digits out of a cell

- **WHEN** a cage with the clue `8+` allows neither 1 nor 4 in one of its cells
- **THEN** the step reads "No way to make this cage sum to 8 puts 1 or 4 in this
  cell, so 1 and 4 must go."

#### Scenario: A cage places a digit along its row

- **WHEN** every way to fill a `10×` cage places a 1 in its row
- **THEN** the step's sentence begins "This cage must multiply to 10, and every
  way to fill it places a 1 in its row"

### Requirement: Hint: Keen's hint deduces at the tier of the board's params

On a board below Unreasonable the hint's recording solve SHALL run at the tier
of the board's own params, so a hint step never rests on a deduction above the
tier the board was dealt at.

#### Scenario: A hint on a Normal board

- **WHEN** a hint is asked for on a board of `6dn`
- **THEN** the recording solver runs with its cap at Normal
- **AND** no step it records is a set deduction or a forcing chain

### Requirement: Look: Keen draws a cell's digit or its pencil marks

`redraw` SHALL draw in each cell its placed digit, centered, or its pencil
marks in a grid sized to the number of marks.

#### Scenario: A placed digit is drawn

- **WHEN** a board is rendered to a recording drawing
- **THEN** a placed digit is drawn centered in its cell

### Requirement: Look: A cage's clue is drawn at its minimal cell

`redraw` SHALL draw each cage's clue, its target value and its operation
symbol, at the cage's minimal cell. The symbol SHALL be omitted for area-1
cages and for multiplication-only puzzles.

#### Scenario: Cage clue is drawn

- **WHEN** a board is rendered to a recording drawing
- **THEN** the cage clue text appears at each cage's minimal cell

#### Scenario: A multiplication-only puzzle shows no symbol

- **WHEN** a multiplication-only board is rendered
- **THEN** each clue is its target value alone

### Requirement: Look: Keen shows rule violations and mistakes on the board

`redraw` SHALL show live rule-violation errors, a cage whose filled digits
violate its clue and duplicate digits in a row or column, and the Check & Save
mistake overlay.

#### Scenario: A digit repeats in a row

- **WHEN** a row holds the same digit in two cells
- **THEN** both digits are drawn in the error color

### Requirement: Look: Keen draws its digits on a quiet surface inside heavy cages

`redraw` SHALL draw every cell on the collection's cell surface. The line
between two cells of one cage SHALL be the collection's surface grid line. A
cage's boundary and the frame round the grid, which is the boundary of the
cages along it, SHALL stay in ink, as SHALL each cage's clue. Keen has no given
digits, so no cell takes the lifted surface of a given.

#### Scenario: Only a cage's boundary is heavy

- **WHEN** a board is drawn
- **THEN** every cell is the cell surface
- **AND** the line between two cells of one cage is the surface grid line
- **AND** the line between two cages, and the frame, are ink

### Requirement: Look: The hint's ring and its outline are drawn in the gutter

The hint's ring and its outline SHALL stay in the gutter at the cell's edge.

#### Scenario: A hint rings a cell inside a cage

- **WHEN** a hint rings a cell whose neighbor is in the same cage
- **THEN** the ring covers the gutter between the two cells, and nothing of it
  is drawn inside either cell
