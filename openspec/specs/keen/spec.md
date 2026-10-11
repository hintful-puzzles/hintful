# keen Specification

## Purpose
Keen (KenKen), the Latin-square puzzle whose cages each carry an arithmetic clue
their digits must satisfy: its rules, its params and description formats, what
each tier asks of the solver, its controls and preferences, how it looks, and
what its hint says of a cage. What it shares with every note-taking and
candidate-hint game is in `engine-notes` and `engine-candidate-hints`.

## Requirements

### Requirement: Keen is a Latin square with arithmetic cages

The player SHALL place a digit `1..w` in every cell of a `w × w` grid so that
each row and column contains every digit exactly once. The grid SHALL be
partitioned into contiguous cages, each labeled with a target value and an
operation (`+`, `−`, `×`, `÷`) that the cage's digits must satisfy. Subtraction
and division cages SHALL always have area 2.

#### Scenario: A division domino reads either way round

- **WHEN** a two-cell cage carries the clue `2÷`
- **THEN** the digits 3 and 6 satisfy it in either order
- **AND** the digits 2 and 5 do not

### Requirement: Keen's parameters

Params SHALL be `w`, `diff` and `multiplicationOnly`. `diff` SHALL be one of
Easy, Normal, Tricky, Hard or Unreasonable, held as the keys `"easy"`,
`"normal"`, `"hard"`, `"extreme"` and `"unreasonable"`, so the Tricky tier is
`"hard"`. The grid size SHALL be refused outside `3 ≤ w ≤ 9`, by the bounds its
`paramConfig` item declares.

#### Scenario: Invalid params are rejected

- **WHEN** the engine's params check is given `w < 3` or `w > 9`
- **THEN** it returns a non-null error sentence naming the grid size

### Requirement: Keen's params encoding

Params SHALL be encoded `{w}` without `full` and `{w}d{c}{m?}` with `full`,
where `c` is `e`, `n`, `h`, `x` or `u` for the five tiers in order and a
trailing `m` marks a multiplication-only puzzle. A difficulty letter the
encoding does not know SHALL decode as the default tier.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, diff: "hard", multiplicationOnly: false }` (the Tricky
  tier) are encoded with `full = true`
- **THEN** the result is `6dh`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`
- **AND** a multiplication-only puzzle's full encoding ends with `m`

#### Scenario: A difficulty letter that names no tier

- **WHEN** the params string `6dq` is decoded
- **THEN** the grid size is 6 and the difficulty is the default tier, Normal
- **AND** the params are not refused

### Requirement: A 3×3 Keen is not dealt above Normal

When a board is to be generated, `validateParams` SHALL refuse a 3×3 puzzle at
any tier above Normal, in the collection's sentence for a size that has no
board of the tier, because no 3×3 board needs more than Normal.

#### Scenario: A 3×3 Tricky is asked for

- **WHEN** `validateParams` is called with `full = true` on
  `{ w: 3, diff: "hard" }`
- **THEN** it returns "No 3x3 puzzle is Tricky."
- **AND** called with `full = false` on the same params it returns null

### Requirement: Keen descriptions encode the block structure and cage clues

The desc SHALL consist of the block structure followed by a comma and the clue
list. The clue list SHALL give, for each cage in the order of the cages'
minimal cells, an operation tag (`a` add, `s` subtract, `m` multiply, `d`
divide) followed by the decimal target value. Every cell SHALL start blank:
Keen has no givens.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board is generated and its desc decoded by `newState`
- **THEN** the cage partition and per-cage clues match what was encoded
- **AND** every cell starts empty with no pencil marks

### Requirement: The block structure is run lengths between dividing lines

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

### Requirement: A malformed Keen description is refused

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

### Requirement: Keen's tiers are the Latin-square deductions a board needs

The solver SHALL accept a completed grid only when every cage's digits satisfy
its clue. Of the shared Latin-square deductions, Easy SHALL allow the simple
ones, Tricky the set deductions, Hard the deeper set deductions and forcing
chains, and Unreasonable recursion.

#### Scenario: Solver grades a known board

- **WHEN** `solveKeen` is run on a generated board at its difficulty
- **THEN** it returns that difficulty and fills the grid with the unique solution

### Requirement: A cage deduction enumerates the cage's layouts

The cage deductions SHALL enumerate, for each cage, the digit layouts
consistent with the current candidate cube and the cage's operation and value,
and SHALL prune the candidate cube accordingly: at Easy by amalgamating all
values, at Normal by per-square value bitmaps, and at Tricky by the cross-cage
"a digit required in this row or column" intersection.

#### Scenario: A cage needs a digit in one row

- **WHEN** at Tricky every consistent layout of a cage places a 1 somewhere
  along one row
- **THEN** 1 is removed from the candidates of that row's cells outside the cage

### Requirement: Keen selects a cell through the shared note-taking cell

Keen SHALL take its selection from the engine's note-taking cell. Every cell
SHALL take an entry, since Keen has no givens, and only an empty cell SHALL
take a pencil mark. The cursor keys SHALL move the highlight.

#### Scenario: A right press on a filled cell without sticky mode

- **WHEN** sticky pencil mode is off and the player right-presses a cell that
  holds a digit
- **THEN** the highlight moves to that cell and is not shown, because the cell
  can take no pencil mark

### Requirement: Keen interprets digit, pencil, and mark-all input

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

### Requirement: Auto-pencil strikes a placed digit from its row and column

With auto-pencil enabled, a real placement SHALL additionally strike that digit
from the pencil marks of every other cell in its row and column.

#### Scenario: A digit is placed with auto-pencil on

- **WHEN** auto-pencil is on and the player places a 4 in a cell whose row and
  column hold cells penciled with 4
- **THEN** the new state has no 4 among the pencil marks of that row and column

### Requirement: A Keen board is solved when its grid is complete without errors

`status` SHALL report solved exactly when every row and column holds each digit
once and every cage's digits satisfy its clue, so a placement that completes
the grid with no errors completes the game.

#### Scenario: The last digit goes in

- **WHEN** a placement fills the last empty cell and leaves no cage or line in
  error
- **THEN** `status` reports solved

### Requirement: Keen draws a cell's digit or its pencil marks

`redraw` SHALL draw in each cell its placed digit, centered, or its pencil
marks in a grid sized to the number of marks.

#### Scenario: A placed digit is drawn

- **WHEN** a board is rendered to a recording drawing
- **THEN** a placed digit is drawn centered in its cell

### Requirement: A cage's clue is drawn at its minimal cell

`redraw` SHALL draw each cage's clue, its target value and its operation
symbol, at the cage's minimal cell. The symbol SHALL be omitted for area-1
cages and for multiplication-only puzzles.

#### Scenario: Cage clue is drawn

- **WHEN** a board is rendered to a recording drawing
- **THEN** the cage clue text appears at each cage's minimal cell

#### Scenario: A multiplication-only puzzle shows no symbol

- **WHEN** a multiplication-only board is rendered
- **THEN** each clue is its target value alone

### Requirement: Keen shows rule violations and mistakes on the board

`redraw` SHALL show live rule-violation errors, a cage whose filled digits
violate its clue and duplicate digits in a row or column, and the Check & Save
mistake overlay.

#### Scenario: A digit repeats in a row

- **WHEN** a row holds the same digit in two cells
- **THEN** both digits are drawn in the error color

### Requirement: Keen flags mistakes against its unique solution

The game SHALL implement `findMistakes`: re-solve from the cage clue structure
to the unique solution and return every player cell that contradicts it: a
filled cell whose digit is wrong (`"cell"`), and an empty cell whose non-empty
pencil notes have crossed out its solution digit (`"note"`). When the board is
not uniquely solvable from the clues the result SHALL be empty.

#### Scenario: A wrong digit and a wrong note are flagged

- **WHEN** the player fills a cell with a digit other than its solution value, or
  pencils out the solution digit in an empty cell
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose notes merely carry extra (non-solution) candidates is not
  flagged

### Requirement: Keen exposes pencil-mark preferences

The game SHALL offer a sticky-pencil-mode preference and an auto-pencil
preference.

#### Scenario: Pencil preferences are exposed with their defaults

- **WHEN** the game's preferences are read
- **THEN** they include a sticky-pencil-mode boolean defaulting to on
- **AND** an auto-pencil boolean defaulting to off

### Requirement: Keen provides an explained deduction hint

The hint SHALL teach the player the next deduction in pencil-notes terms. Its
deductions SHALL be capped below recursion, because a guess is not a teachable
note strike.

#### Scenario: A hint on an Unreasonable board

- **WHEN** a hint is asked for on a board of the Unreasonable tier
- **THEN** the recording solver runs with its cap at Hard, and no step rests on
  a trial

### Requirement: A cage elimination is one firing, struck as one journey

A cage elimination SHALL be taught as one firing: no layout of the cage's
digits consistent with its clue leaves a candidate possible in a cage cell, or,
at the harder level, a digit the cage requires along a row or column is ruled
out elsewhere in that line. A firing SHALL be one cage's, so a hint step never
mixes cages. It SHALL strike what it rules out through `pencilStrike` moves
linked as one journey, and every cell it strikes in SHALL be marked in the one
acted-on hint color.

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

### Requirement: A cage deduction's sentence names the cage by its clue

A cage step's narration SHALL lead with the spotted indication, the cage named
by its clue's goal ("sum to N", "multiply to N", "differ by N", "have a ratio
of N"), then give the reasoning, then end in a necessity-voice conclusion.

#### Scenario: A sum cage rules two digits out of a cell

- **WHEN** a cage with the clue `8+` allows neither 1 nor 4 in one of its cells
- **THEN** the step reads "No way to make this cage sum to 8 puts 1 or 4 in this
  cell, so we must cross them out."

#### Scenario: A cage places a digit along its row

- **WHEN** every way to fill a `10×` cage places a 1 in its row
- **THEN** the step's sentence begins "This cage must multiply to 10, and every
  way to fill it places a 1 in its row"

### Requirement: Keen provides on-screen key labels

Keen SHALL implement `requestKeys(params)` returning one button per digit `1..w`
(labeled by the digit character) followed by a clear key (button code `8`,
labeled `"Clear"`).

#### Scenario: The keypad covers the grid's digits plus clear

- **WHEN** the key labels are requested for a `6×6` Keen board
- **THEN** the result is the buttons `1,2,…,6` followed by a clear key

### Requirement: Keen generates boards uniquely solvable at exactly the requested difficulty

`newDesc` SHALL deal a board only when the graded solver solves it at exactly
the requested difficulty: solvable at `diff` and not at `diff − 1`. Every cage
SHALL have area at most 6, and the generator SHALL assign a balanced mix of
cage operations and values that avoids low-quality clues. It SHALL regenerate
otherwise, under a capped-iteration backstop that throws and does not hang.

#### Scenario: Generated board is uniquely solvable at its difficulty

- **WHEN** a board is generated for given params
- **THEN** the solver solves it uniquely at the requested difficulty
- **AND** the solver fails to solve it at one difficulty level lower (for
  difficulties above Easy)
- **AND** no cage has more than 6 cells, and every subtraction or division
  cage has area 2

### Requirement: Keen draws its digits on a quiet surface inside heavy cages

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

### Requirement: The selection is drawn under the clue, and the hint's ring in the gutter

The selection's wash and its pencil-mode corner SHALL be drawn over the cell's
surface, under the cage's clue. The hint's ring and its outline SHALL stay in
the gutter at the cell's edge.

#### Scenario: A cage's minimal cell is selected for a pencil mark

- **WHEN** the cell that carries a cage's clue is highlighted in pencil mode
- **THEN** the corner triangle is painted before the clue, and the clue is drawn
  whole on top of it

### Requirement: A multiplication-only 9×9 Keen is not dealt above Tricky

When a board is to be generated, `validateParams` SHALL refuse a 9×9
multiplication-only puzzle at Hard or Unreasonable, in the collection's
sentence for boards too rare to deal, because such a board exists and takes
too long to find. Every other size SHALL be dealt with multiplication only at
every tier its size has, and a 9×9 with every operation SHALL be dealt at
every tier.

#### Scenario: A multiplication-only 9×9 Hard is asked for

- **WHEN** `9dxm` is decoded and `validateParams` is called with `full = true`
- **THEN** it returns "Hard 9x9 puzzles with multiplication only are too rare
  to deal."
- **AND** called with `full = false` it returns null

#### Scenario: The tier below, and the size below

- **WHEN** `9dhm`, a multiplication-only 9×9 Tricky, or `8dxm`, a
  multiplication-only 8×8 Hard, is validated with `full = true`
- **THEN** it is not refused

### Requirement: A Keen clue's value is one its cage could make

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

### Requirement: A Keen repeat count below three is refused

A decimal repeat count in the block structure SHALL be at least 3 and at most
the number of internal grid lines plus one. A count outside that SHALL refuse
the desc as holding a number out of range for its board, so two of the same
letter are only ever the letter written twice.

#### Scenario: A letter followed by 2

- **WHEN** `__a__a_ba_a__a_b,m3d2s2a5m12s1a7` is loaded on `4de` with its
  leading `__` changed to `_2`
- **THEN** it is refused: "This game ID has a number out of range for its
  board."

### Requirement: A Keen label ends in multiplication only for a product-only puzzle

The label of a multiplication-only params set SHALL be its size and tier
followed by ", multiplication only". The label of any other params set SHALL
be its size and tier alone.

#### Scenario: The multiplication-only preset

- **WHEN** the label of `6dnm` is asked for
- **THEN** it is "6x6 Normal, multiplication only"
- **AND** the label of `6dn` is "6x6 Normal"

### Requirement: Keen's hint deduces at the tier of the board's params

The hint's recording solve SHALL run at the tier of the board's own params,
capped at Hard, so a hint step on a board never rests on a deduction above
the tier the board was dealt at.

#### Scenario: A hint on a Normal board

- **WHEN** a hint is asked for on a board of `6dn`
- **THEN** the recording solver runs with its cap at Normal
- **AND** no step it records is a set deduction or a forcing chain
