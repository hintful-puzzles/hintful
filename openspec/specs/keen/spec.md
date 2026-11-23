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

Keen's params SHALL be a grid size `w`, one of the tiers Easy, Normal,
Tricky, Hard or Unreasonable, and whether every cage's clue is a product
(multiplication only), as its description states them. The default board
SHALL be 6×6 at Normal, upstream's.

#### Scenario: The Tricky preset

- **WHEN** `6dh` is decoded
- **THEN** it is a 6×6 board at Tricky, labeled "6x6 Tricky"

### Requirement: Params: Keen's params encoding

Params SHALL be encoded `{w}` without `full` and `{w}d{c}{m?}` with `full`,
where `c` is `e`, `n`, `h`, `x` or `u` for the five tiers in order and a
trailing `m` marks a multiplication-only puzzle. A string with no `d` SHALL
decode as Normal, and one with no `m` as a puzzle with every operation. An
`m` before the tier SHALL make the string unreadable.

#### Scenario: A string with no tier

- **WHEN** `6` is decoded
- **THEN** it is a 6×6 board at Normal with every operation, whose full form
  is `6dn`

#### Scenario: Params round-trip

- **WHEN** a 6×6 board at Tricky with every operation is encoded with
  `full = true`
- **THEN** the result is `6dh`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`
- **AND** a multiplication-only puzzle's full encoding ends with `m`

### Requirement: Params: A 3×3 Keen is not dealt above Normal

When a board is to be dealt, a 3×3 puzzle at any tier above Normal SHALL be
refused, in the collection's sentence for a size that has no board of the
tier, because no 3×3 board needs more than Normal.

#### Scenario: A 3×3 Tricky is asked for

- **WHEN** a board of `3dh` is to be dealt
- **THEN** it is refused: "No 3x3 puzzle is Tricky."

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
the wrong number of clues, when a clue tag is unrecognized, and when its clues
have no answer, as a subtraction or division clue on a cage that is not two
cells has none.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with a malformed block structure, too few or too many clues,
  or an unknown clue tag is loaded
- **THEN** it is refused with a non-null error string

#### Scenario: A subtraction clue on a cage of three cells

- **WHEN** `aa_a_aa_ba_5a,d2s1s2m4d2m6s2` is loaded on `4de`, a difference on
  its cage of three cells
- **THEN** it is refused: "The clues in this game ID contradict each other."

### Requirement: Description: A Keen clue's value is one its cage could make

A desc SHALL be refused, as holding a number out of range for its board, when
a clue's value is outside what its operation could make of the cage: `1` to
the cage's area times `w` for an addition clue, `1` to `w` raised to the
cage's area for a multiplication clue, `1` to `w − 1` for a subtraction clue,
and `2` to `w` for a division clue. A desc whose clues, each in range, have
no answer or more than one SHALL be refused too, as every born game's is.

#### Scenario: A dealt 4×4 board

- **WHEN** `__a__a_ba_a__a_b,m3d2s2a5m12s1a7` is loaded on `4de`
- **THEN** the board has seven cages, and the first, the two cells at the top
  of the left column, must multiply to 3
- **AND** the desc is written back byte for byte

#### Scenario: A ratio of one

- **WHEN** that desc is loaded with its `d2` changed to `d1`
- **THEN** it is refused: "This game ID has a number out of range for its
  board."

#### Scenario: A product no two digits make

- **WHEN** that desc is loaded with its `m3` changed to `m5`
- **THEN** it is refused, since its clues have no answer: "The clues in this
  game ID contradict each other."

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

### Requirement: Description: Keen's text format prints each cage's clue

The text format SHALL draw the cages' walls and each cell's number, and
print each cage's clue, its value and its sign, after the row of the cage's
first cell, in the order of those cells, since a clue is wider than a cell.

#### Scenario: A 4×4 board as text

- **WHEN** `aa_a_aa_ba_5a,d2s1a9m4d2m6s2` on `4de` is copied as text
- **THEN** its first row of cells is followed by `2÷ 1−`

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
and SHALL prune the candidate cube accordingly: at Easy, and only at a cap of
Easy, by amalgamating all values, at Normal by per-square value bitmaps, and
at Tricky by the cross-cage "a digit required in this row or column"
intersection.

#### Scenario: A cage needs a digit in one row

- **WHEN** at Tricky every consistent layout of a cage places a 1 somewhere
  along one row
- **THEN** 1 is removed from the candidates of that row's cells outside the cage

### Requirement: Generation: A Keen cage has at most six cells and a balanced mix of clues

Every cage SHALL have area two to six, laid at random as dominoes and the
cells left over joined to a neighbor (upstream's), and the deal SHALL give
each cage one clue, dealing ratios, differences, products and sums in turn
so each is about as common as the cages allow. A clue that leaves its cage
little choice SHALL be dealt only where no other kind suits, and every
value a cage makes SHALL be dealable, however large.

#### Scenario: A poor clue

- **WHEN** a cage of two cells could take a sum too small or too large to
  leave a choice, or above Normal a product with as few ways to make it
- **THEN** that clue is dealt only where no other kind suits it, and a
  difference of `w − 1` or a ratio above half the size is never dealt

#### Scenario: The cages of a dealt board

- **WHEN** a board is dealt for given params
- **THEN** every cage has two to six cells, and every subtraction or division
  cage has area 2

#### Scenario: A large product

- **WHEN** a multiplication-only 5×5 board is dealt
- **THEN** a cage of three cells may carry a product above 31

### Requirement: Solver: Keen's ladder is its description

Keen's solver SHALL run the ladder of `keen.description.yaml`: the three cage
readings it states and the Latin library's it places, each at the tier the
description gives it, checked sound against the description's rules, a Latin
square whose cages each make their clue by its sign. The search above them
stays the engine's.

#### Scenario: A value no filling of a cage puts in a cell is struck

- **WHEN** no filling of a cage from its cells' candidates, two cells
  sharing a line apart, that makes its clue puts a value in one of its
  cells, at a cap of Normal or above
- **THEN** the solver strikes it from that cell, in one firing for the cage,
  recorded with the cage's clue and cells

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

### Requirement: Controls: A Keen cage clue is marked done

A press on a cage's clue text, with a little slack, SHALL mark the clue done
(drawn gray) and a second press unmark it; a press elsewhere in the square
SHALL select it as before. Shift or Ctrl with an arrow key SHALL mark the
clue of the next cage that way from the cursor, so the key decides which,
as it does a sign's in Unequal. A clue marked done that breaks SHALL be
drawn red over the gray.

#### Scenario: Shift and an arrow

- **WHEN** the cursor is on a cell of a cage, another cage lies to its
  right, and Shift with the right arrow is pressed twice
- **THEN** that other cage's clue is marked done, and then unmarked, and
  the cursor's own cage's clue is unchanged

### Requirement: Preferences: Auto-pencil strikes a placed digit from its row and column

With auto-pencil enabled, a real placement SHALL additionally strike that digit
from the pencil marks of every other cell in its row and column.

#### Scenario: A digit is placed with auto-pencil on

- **WHEN** auto-pencil is on and the player places a 4 in a cell whose row and
  column hold cells penciled with 4
- **THEN** the new state has no 4 among the pencil marks of that row and column

### Requirement: Hint: Keen's hint is the shared candidate plan over rows and columns

Keen's hint SHALL be the fill board's candidate walk, built from its
description (`described-fill-game`), with no departure: the Latin library's
rungs and its own three cage techniques, each worded by the description, a
cage firing split into a leg a cell. The reading a fresh game starts on SHALL
be the one that pencils every candidate in first.

#### Scenario: A single on a Keen board

- **WHEN** a step places a digit because it fits one cell of its row
- **THEN** its sentence is the shared narrator's and names no cage

### Requirement: Hint: A cage elimination is one firing, and a firing is one cage's

A cage elimination SHALL be taught as one firing: no layout of the cage's
digits consistent with its clue leaves a candidate possible in a cage cell, or,
at the harder level, a digit the cage requires along a row or column is ruled
out elsewhere in that line. A firing SHALL be one cage's, so a hint step never
mixes cages, and its strikes SHALL be a step a cell.

#### Scenario: A cage elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a cage's
  arithmetic clue rules a digit out of one of its cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the cage's cells are striped and the cell is ringed in the hint color

#### Scenario: Two cages could prune at once

- **WHEN** a board's notes let two cages each rule a candidate out
- **THEN** each cage's strikes are a firing of their own, and no step strikes
  for both

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

On a board below Unreasonable the hint SHALL run only the techniques of the
board's own tier, so a hint step never rests on a deduction above the tier the
board was dealt at.

#### Scenario: A hint on a Normal board

- **WHEN** a hint is asked for on a board of `6dn`
- **THEN** no step is a digit a cage requires along a line, a set deduction or
  a forcing chain

### Requirement: Look: Keen draws a cell's digit or its pencil marks

`redraw` SHALL draw in each cell its placed digit, centered, or its pencil
marks in a grid sized to the number of marks.

#### Scenario: A placed digit is drawn

- **WHEN** a board is rendered to a recording drawing
- **THEN** a placed digit is drawn centered in its cell

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

The hint's ring SHALL circle the ringed cell's number or notes, as every born
game's does, and its outline SHALL follow the cells it names.

#### Scenario: A hint rings a cell inside a cage

- **WHEN** a hint rings a cell whose neighbor is in the same cage
- **THEN** a circle is drawn round the cell's notes

### Requirement: Look: Keen draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each digit that repeats in its row or column, and the clue of each
cage whose digits can no longer make it (`Game.rules`), counting each open
square of the cage as any digit it could still hold.

#### Scenario: A sum cage overshot before it is full

- **WHEN** the player puts a digit in a `+` cage so large that the cage's
  open squares, holding 1 each, would take it past its clue
- **THEN** the cage's clue is drawn red while its other squares are still
  open

#### Scenario: A repeated digit

- **WHEN** the same digit is placed twice in a row
- **THEN** both are drawn red

### Requirement: Look: A cage's clue is drawn with its sign at its first cell

Each cage's clue, its target value and its operation symbol, SHALL be drawn
at the top left of the cage's first cell in reading order, on every clue,
a multiplication-only puzzle's included. A clue SHALL be set at the largest
size, up to a quarter of the tile, that a hint's ring on its cell still
steps round: a five-character clue (`1440×`) always smaller, a
four-character one on a small tile.

#### Scenario: Cage clue is drawn

- **WHEN** a board is drawn
- **THEN** the cage clue text appears at each cage's first cell

#### Scenario: A multiplication-only puzzle shows its symbol

- **WHEN** a multiplication-only board is drawn
- **THEN** each clue is its target value followed by `×`

### Requirement: Look: A Keen cell's digit and notes sit below its clue

Every cell's notes and its digit SHALL be drawn below the line a cage's clue
takes, whether or not the cell holds a clue, so a clue never sits under a
digit and a row's digits stay level.

#### Scenario: A digit beside its cage's clue

- **WHEN** the player types a digit into a cage's first cell
- **THEN** the digit is drawn below the clue, and level with the digits
  beside it in its row
