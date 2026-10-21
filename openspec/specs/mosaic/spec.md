# mosaic Specification

## Purpose
Mosaic, the puzzle of deciding every square, marked or blank, so that each
number counts the marked squares in the three-by-three block centered on it:
what its params refuse and what a short params string means, its description
format, what its generator promises of a board, what a toggle does to a cell,
the mistake check against the board's one answer, its deduction, the hint's
sentences and their order, and how its marks and numbers are drawn.

## Requirements

### Requirement: Rules: A Mosaic toggle cycles a mark and a paint fills only unmarked cells

One step of a toggle SHALL take a cell around the cycle unmarked, marked,
blank, and two steps SHALL take it round the other way. A paint
SHALL set only the still-unmarked cells along its straight run. The game
SHALL make no `paint` move of its own, and SHALL still replay one from a
saved game. `executeMove` SHALL throw on an out-of-bounds target.

#### Scenario: Toggling cycles a cell

- **WHEN** a cell is toggled three times (single steps)
- **THEN** it passes marked → blank → unmarked

#### Scenario: A double toggle goes the other way

- **WHEN** an unmarked cell is toggled by two steps
- **THEN** it is blank

#### Scenario: Painting fills only unmarked cells

- **WHEN** a paint move covers a run containing a marked cell and unmarked
  cells, painting blank
- **THEN** the unmarked cells become blank and the already-marked cell is
  unchanged

### Requirement: Rules: Mosaic flags a satisfied clue and a contradicted one

A clue SHALL be flagged `SOLVED` when it is exactly satisfied with no cell of
its neighborhood unmarked, and `ERROR` when it is overcommitted, with more
cells marked than the clue or too few cells left that could be. The flags and
the count of clues left SHALL follow the marks.

#### Scenario: A satisfied clue grays out and a contradicted clue reddens

- **WHEN** a clue's neighborhood is fully determined with exactly the clue's
  count marked
- **THEN** the clue carries the `SOLVED` flag (drawn gray)
- **AND** when more cells are marked around a clue than its value, it carries
  the `ERROR` flag (drawn red)

### Requirement: Rules: Mosaic is complete when every clue is satisfied

A clue SHALL count the marked cells of its 3×3 neighborhood, itself included.
The board SHALL be complete exactly when every shown clue is satisfied with no
cell of its neighborhood unmarked.

#### Scenario: Completing every clue solves the game

- **WHEN** the last clue becomes satisfied
- **THEN** no clue is left and `status` returns `"solved"`

### Requirement: Rules: Mosaic checks mistakes against the board's one answer

`findMistakes` SHALL return every cell the player has determined whose mark
contradicts the board's one answer, and each SHALL be drawn with an
error-colored outline overlay.

#### Scenario: findMistakes flags a wrong mark

- **WHEN** the player marks a cell that is blank in the solution and Check &
  Save runs
- **THEN** `findMistakes` returns that cell
- **AND** a correctly-marked board returns no mistakes

### Requirement: Params: A Mosaic params string may leave out its aggressiveness and its difficulty

Mosaic's params, a size, whether generation is aggressive and a difficulty,
SHALL be bounded and encoded as its `paramConfig` and its declared codec give
(`engine-params`, "A game declares its params encoding once, and both codec
halves are derived"). A string with no `h` SHALL decode with aggressive
generation on, whatever its size, a string with no difficulty letter SHALL
decode as Easy, and a string of one number SHALL decode as a square board.

#### Scenario: A string from before the tiers reads as Easy

- **WHEN** `10x8` and `50x50h0` are decoded
- **THEN** each is an Easy board, the second with `aggressive` false

#### Scenario: One number is a square board

- **WHEN** `7` is decoded
- **THEN** it is a 7×7 Easy board with aggressive generation on

### Requirement: Params: Mosaic refuses a board of more than 10000 squares

`validateParams` SHALL refuse a board of more than 10000 tiles.

#### Scenario: A board one row past the limit

- **WHEN** the params of a board of 101×100 cells are checked
- **THEN** they are refused with a non-null error string
- **AND** a 100×100 board is accepted

### Requirement: Params: Mosaic's menu leaves its two smallest boards and its largest at Easy

The menu `presets` builds SHALL offer its two smallest boards and its largest
as Easy alone, so that the menu is one section, and every size SHALL still be
dealt at every difficulty from the Custom dialog. Every preset SHALL ask for
aggressive generation except the largest, 50×50, where it is too slow.

#### Scenario: The smallest board is on the menu once

- **WHEN** Mosaic's preset menu is read
- **THEN** 3×3 appears as Easy and at no other difficulty
- **AND** a Normal and an Unreasonable 3×3 board are each dealt when asked for

### Requirement: Description: Mosaic descriptions are run-length clue grids

The desc SHALL encode the board in scan order: a digit `0`-`9` for each shown
clue and a run letter for each run of hidden cells. A desc holding
any other character, or one whose decoded length differs from `width*height`,
SHALL be refused.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded from the
  resulting board
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc with an invalid character, or with a decoded length
  mismatching the params, is checked
- **THEN** the check returns a non-null error

### Requirement: Generation: Mosaic generates deduction-solvable boards

`newDesc` SHALL generate a random image of marked and blank cells and compute
every cell's clue from it, a border cell counting only its in-bounds
neighbors. It SHALL regenerate until the deductive solver completes the board
from its clues alone. An Easy board SHALL be that board with its clues
hidden as upstream hides them.

#### Scenario: Generated boards are valid and solvable

- **WHEN** `newDesc` runs at Easy for a seeded RNG across several sizes with
  aggressive generation on and off
- **THEN** every desc is accepted as a description of its params
- **AND** the deductive solver solves every resulting board from its visible
  clues alone

### Requirement: Generation: Mosaic hides the clues a board does not need

Once a generated board is solvable, `newDesc` SHALL hide every clue whose
deduction never narrowed anything. In aggressive mode it SHALL additionally
try hiding each remaining clue and SHALL revert any hide
that makes the board unsolvable.

#### Scenario: An aggressive board still solves

- **WHEN** a board is generated with aggressive generation on
- **THEN** the deductive solver solves it from the clues left showing

### Requirement: Generation: An Unreasonable Mosaic board is an Easy one with clues the search can spare hidden

At Unreasonable the generator SHALL start from an Easy board, and on some
tries from every clue showing, which the smallest boards are dealt from. It
SHALL hide clues while the search still proves one answer. With aggressive
generation it SHALL try every clue. Without, it SHALL stop at the first clue
whose loss stops the deduction, two numbers compared included.

#### Scenario: A board keeps its numbers where generation is not aggressive

- **WHEN** an Unreasonable 10×10 board is dealt from one seed with aggressive
  generation off and on
- **THEN** the first shows more numbers than the second

#### Scenario: The smallest and the largest boards carry the tier

- **WHEN** an Unreasonable 3×3, 3×20, 30×30, and without aggressive
  generation 50×50 and 100×100 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Generation: A Normal Mosaic board needs a comparison and no search

At Normal the generator SHALL hide clues of an Easy board while the deduction,
two numbers compared included, still finishes it, and SHALL keep the board
only where one number at a time does not. With aggressive generation it SHALL
try every clue. Without, it SHALL try a part of them, so the board keeps most
of its numbers.

#### Scenario: A dealt Normal board is finished by comparing

- **WHEN** `newDesc` produces Normal boards from 3×3 to 10×10, with aggressive
  generation on and off
- **THEN** the deduction finishes each, and compares two numbers on the way
- **AND** exactly one picture fits each, by a count that has no search in it

#### Scenario: A Normal board shows fewer numbers than an Easy one

- **WHEN** 10×10 boards are dealt from the same seeds at Easy and at Normal
- **THEN** the Normal boards show fewer numbers
- **AND** Normal boards dealt without aggressive generation show more than
  those dealt with it

#### Scenario: The hint finishes a Normal board

- **WHEN** the hint is followed on a dealt Normal board
- **THEN** it reaches the solution without refusing, and some of its steps
  compare two numbers

### Requirement: Generation: A Mosaic board is Easy, Normal or Unreasonable by what finishes it

A board SHALL count as Easy where one number at a time finishes it, as Normal
where two numbers compared do, and as Unreasonable where it has exactly one
answer that the deduction does not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the deduction does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board the comparison finishes opens as Normal

- **WHEN** a 5×5 board that one number at a time does not finish and two
  numbers compared do is entered with no difficulty letter, with `de`, and
  with `du`
- **THEN** the first two open as Normal, and the third keeps the difficulty
  it was saved at

### Requirement: Solver: Mosaic's Solve marks every cell and flags it solved

Mosaic's solve move SHALL set every cell marked or blank as the board's one
answer has it, each flagged solved.

#### Scenario: Solve completes the board

- **WHEN** the Solve command runs on a generated board of any difficulty
- **THEN** every cell is determined and the board is solved

### Requirement: Solver: Mosaic's search assumes an undecided square shaded and then clear

Where its deduction stops, Mosaic's search SHALL assume an undecided square
shaded and then clear. A square no number counts is free, so a board with one
has several answers.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 3×3 board the rule finishes, on a 5×5 with
  one answer that the deduction does not reach, on a 3×3 with a lone 5 in the
  middle and on a 3×3 whose corner counts none and whose middle counts nine
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by shading or clearing one
  square at a time
- **THEN** the search reports one answer exactly where one picture fits,
  several where more do and none where none does

### Requirement: Solver: Mosaic's rule says when a block cannot meet its number

The deduction SHALL report a contradiction as soon as a number's block holds
more shaded squares than the number, or too few squares that are not clear to
reach it, whether or not every square of the block is decided. It SHALL report
one as well where a number needs more shaded squares beyond another's need
than it has empty squares outside the other's block.

#### Scenario: A block goes wrong with squares still undecided

- **WHEN** the search is given one position to try on a 3×3 board whose
  corner is 4 and whose middle is 3, and on one whose corner is 0 and whose
  middle is 6
- **THEN** it reports no answer for each
- **AND** on a 3×3 board with a lone 5 it reports that it stopped

#### Scenario: Two numbers are wrong only together

- **WHEN** the search is given one position to try on the 3×3 board `14g`, a
  corner 1 beside a 4
- **THEN** it reports no answer

### Requirement: Solver: Mosaic's deduction compares two numbers whose blocks overlap

Where no number decides a square alone, the board-side solver SHALL compare
each two numbers whose blocks overlap. Where one still needs as many more
shaded squares than the other as it has empty squares outside the other's
block, those squares SHALL be shaded. Where the two need the same and the
first has no empty square outside the other's block, the other's empty squares
outside the first's SHALL be clear. A number SHALL be compared only where no
number decides anything alone.

#### Scenario: A number needs more than its neighbor by all it has outside

- **WHEN** the deduction runs on the 3×3 board `13g`, a corner 1 beside a 3
- **THEN** it shades the 3's two squares outside the 1's block, and stops

#### Scenario: A number inside another's block needs as many

- **WHEN** the deduction runs on the 3×3 board `22g`, a corner 2 beside a 2
- **THEN** it clears the second 2's two squares outside the corner's block

#### Scenario: A board one number at a time does not finish

- **WHEN** the 5×5 board `0b4c4b4a6a3d3a2c` is solved
- **THEN** the solver finishes it, where upstream's rule alone stops short

### Requirement: Controls: Mosaic takes its buttons, keys and drag from its verbs, and a finished board takes none

Mosaic's buttons, keys and drag SHALL be those its `targetVerbs` declares, the
primary verb one step of the toggle and the secondary two, with a sweep over
the cells holding the mark the pressed cell held (`engine-input`, "The engine
owns a declaring game's press and select keys" and "A drag on from a press
repeats the press"). `interpretMove` SHALL add one arm of its own: once the
board is complete, the game SHALL accept only cursor movement.

#### Scenario: A drag from a marked cell clears marks

- **WHEN** the player presses a marked cell with the primary button and drags
  across a marked cell and an unmarked cell
- **THEN** both marked cells become blank and the unmarked cell is left as it
  was

#### Scenario: A finished board takes no click

- **WHEN** the board is complete and the player clicks a cell
- **THEN** no move is made
- **AND** an arrow key still moves the cursor

### Requirement: Hint: Mosaic's hint stops where the rule does

On an Unreasonable board as on any other, the steps of Mosaic's hint SHALL be
those one number at a time forces and then those two numbers compared force.

#### Scenario: The hint stops, and goes on from a square tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** with a square marked as the solution has it wherever the hint
  stops, the hint finishes the board

### Requirement: Hint: Mosaic's hint says a comparison of two numbers

A hint step that compares two numbers SHALL name both by their values, and by
where each sits where the values are equal. The squares it rings SHALL be
squares only one of the two counts. A step that shades SHALL say how many more
the first needs than the second and that it has only that many empty squares
outside the second's block. A step that clears SHALL say that both need the
same.

#### Scenario: The ringed squares belong to one block only

- **WHEN** a step that shades by comparison is shown
- **THEN** every ringed square is in the first number's block and outside the
  other's, and both blocks' perimeters are drawn

#### Scenario: Two 7s side by side

- **WHEN** a step compares two 7s in one row
- **THEN** it says "The left 7 still needs 2 more purple squares than the
  right 7, and only 2 of its empty squares are outside the right 7's block, so
  these squares must be purple.", or the same with left and right exchanged

### Requirement: Hint: One Mosaic number alone settles its block

A number whose block already holds as many shaded squares as it counts SHALL
make every empty square of the block clear. A number whose block holds only
as many squares that are not clear as it counts SHALL make every empty square
of the block shaded. The hint step SHALL say of a 0 that it allows no shaded
squares and of a number equal to its block's size that it needs all of them.

#### Scenario: The three sentences of a small board

- **WHEN** the hint's plan is read on the 3×3 board `d7a2a4`
- **THEN** it says "This 4 needs all 4 of its squares purple, so these squares
  must be purple.", then "This 2 already has its 2 purple squares, so these
  squares must be clear.", then "This 7 needs 7 purple squares, and only 7 of
  its squares are not clear, so these squares must be purple."

#### Scenario: A number on a shaded square

- **WHEN** the number a step names sits on a shaded square
- **THEN** its circle is drawn in the color of the number

### Requirement: Hint: Mosaic's hint asks the numbers in reading order, and the nearest pair first

The plan SHALL ask every number once in reading order, and SHALL ask a number
again, after those already waiting, each time a square of its block is
decided. Where the numbers alone decide nothing, each number in turn SHALL be
compared with the numbers whose blocks overlap its own, the nearest first, a
number beside it before one two squares away, and the first comparison that
decides a square SHALL be the step.

#### Scenario: The first number that decides is not the first number

- **WHEN** the hint is asked on the 3×3 board `d7a2a4`, whose 7 and 2 come
  before its 4 in reading order and decide nothing as dealt
- **THEN** the first step is the 4's

### Requirement: Status bar: The Mosaic status bar counts the numbers left

The status bar SHALL read `Clues left: {n}`, counting the shown numbers that
are not yet met with every square of their block decided, and SHALL be empty
once none is left.

#### Scenario: A board as dealt

- **WHEN** the 3×3 board `d7a2a4` is opened
- **THEN** the status bar reads "Clues left: 3"
- **AND** it is empty once the hint's three steps are played

### Requirement: Look: A Mosaic number reads over whatever its cell holds

A cell's number SHALL be drawn over whatever the cell holds and SHALL read
against it in both color schemes: on the shaded piece it is drawn in a color
that does not invert with the scheme. A satisfied number SHALL be drawn
fainter than an unsatisfied one on the piece and on the clear square, which
are the two places it can be: on the clear square in the square's faint
color, the cross's.

#### Scenario: A satisfied number grays on the piece and off it

- **WHEN** a satisfied number is drawn on a marked cell
- **THEN** it is drawn in a different color from an unsatisfied number on a
  marked cell
- **AND** a satisfied number on a blank cell is drawn in a different color
  from an unsatisfied number on a blank cell

### Requirement: Look: A contradicted Mosaic number is red, and a badge on the piece

A contradicted number SHALL be drawn in the error color on bare surface. On
the shaded piece and on the clear square it SHALL be drawn as a badge: a disc
in the error color under the number.

#### Scenario: A contradicted number on a marked cell

- **WHEN** a marked cell's number has more marked cells around it than its
  value
- **THEN** a disc in the error color is drawn on the piece, and the number
  over the disc

#### Scenario: A contradicted number on a blank cell

- **WHEN** a blank cell's number has more marked cells around it than its
  value
- **THEN** a disc in the error color is drawn on the clear square, and the
  number over the disc

### Requirement: Look: Mosaic's win flash takes the place of a blank cell's clear surface

The win flash SHALL fill a lit blank cell with a flash color in place of its
clear surface, and the cell SHALL keep its cross and its number.

#### Scenario: A lit blank cell

- **WHEN** the win flash's highlight is on a blank cell with no number
- **THEN** the cell is filled with a flash color and still carries its
  faint cross

### Requirement: Look: Mosaic draws a marked cell as a piece and a blank cell as the clear square

`redraw` SHALL draw a marked cell as the collection's shaded piece, inset on
the plain cell surface, a blank cell as the collection's clear square, a
surface of its own over the whole cell with no piece, and an unmarked cell as
plain surface holding nothing.

#### Scenario: The three marks are a piece, a surface of its own and nothing

- **WHEN** a board holding a marked cell, a blank cell and an unmarked cell is
  drawn
- **THEN** the marked cell holds the shaded piece on the plain surface, the
  blank cell is filled with the clear square's color and holds no piece, and
  the unmarked cell is plain surface and holds nothing
