# mosaic Specification

## Purpose
Mosaic, the puzzle of deciding every square, marked or blank, so that each
number counts the marked squares in the three-by-three block centered on it:
its params and description formats, what its generator promises of a board,
what a press and a drag do, the mistake check against the deduced solution,
and how its marks and numbers are drawn.

## Requirements

### Requirement: Mosaic's parameters and their encoding

Params SHALL be `width`, `height`, `aggressive`, which asks for harder
generation by clue minimization and defaults to true, and a difficulty, Easy
or Unreasonable. They SHALL encode as `{w}x{h}`, and in the full encoding
only an `h{0|1}` suffix when `aggressive` differs from its default, then the
difficulty as `de` or `du`. A string with no difficulty letter SHALL decode
as Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ width: 10, height: 8, aggressive: true }` at Easy are
  encoded in full
- **THEN** the result is `10x8de` (default aggressiveness elided)
- **AND** an Unreasonable 50×50 board with `aggressive` false encodes to
  `50x50h0du`
- **AND** decoding each string round-trips the params

#### Scenario: A string from before the tiers reads as Easy

- **WHEN** `10x8` and `50x50h0` are decoded
- **THEN** each is an Easy board, the second with `aggressive` false

### Requirement: Mosaic's largest preset deals without aggressive generation

Every preset SHALL ask for aggressive generation except the largest, 50×50,
where it is too slow.

#### Scenario: The largest preset is not aggressive

- **WHEN** the presets are listed
- **THEN** the 50×50 preset has `aggressive` false and every other preset has
  it true

### Requirement: Mosaic's size limits

A board narrower or shorter than 3 SHALL be refused. `validateParams` SHALL
refuse a board of more than 10000 tiles.

#### Scenario: Invalid params are rejected

- **WHEN** the params of a 2×3 board, or of a board of 101×100 cells, are
  checked
- **THEN** each is refused with a non-null error string
- **AND** a 3×3 board and a 100×100 board are accepted

### Requirement: Mosaic descriptions are run-length clue grids

The desc SHALL encode the board in scan order: a digit `0`-`9` for each shown
clue and a letter `a`-`z` for each run of 1-26 hidden cells. A desc holding
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

### Requirement: Mosaic generates deduction-solvable boards

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

### Requirement: Mosaic hides the clues a board does not need

Once a generated board is solvable, `newDesc` SHALL hide every clue whose
deduction never narrowed anything. In aggressive mode it SHALL additionally
try hiding each remaining clue and SHALL revert any hide
that makes the board unsolvable.

#### Scenario: An aggressive board still solves

- **WHEN** a board is generated with aggressive generation on
- **THEN** the deductive solver solves it from the clues left showing

### Requirement: A Mosaic toggle cycles a mark and a paint fills only unmarked cells

One step of a toggle SHALL take a cell around the cycle unmarked, marked,
blank; two steps are the right button's and select2's way round it. A paint
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

### Requirement: Mosaic flags a satisfied clue and a contradicted one

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

### Requirement: A Mosaic press toggles a cell and a drag repeats it

A pointer press SHALL toggle the cell it lands on, and a drag on from it SHALL
be the engine's sweep over the cells holding the mark the pressed cell held:
a drag from an unmarked cell lays a mark and a drag from a marked cell clears
marks. A click in the margin SHALL be ignored. Once the board is complete,
the game SHALL accept only cursor movement.

#### Scenario: A drag from a marked cell clears marks

- **WHEN** the player presses a marked cell with the primary button and drags
  across a marked cell and an unmarked cell
- **THEN** both marked cells become blank and the unmarked cell is left as it
  was

#### Scenario: A finished board takes no click

- **WHEN** the board is complete and the player clicks a cell
- **THEN** no move is made
- **AND** an arrow key still moves the cursor

### Requirement: Mosaic is complete when every clue is satisfied

A clue SHALL count the marked cells of its 3×3 neighborhood, itself included.
The board SHALL be complete exactly when every shown clue is satisfied with no
cell of its neighborhood unmarked, and completing it SHALL play a 0.5s flash.

#### Scenario: Completing every clue solves the game

- **WHEN** the last clue becomes satisfied
- **THEN** no clue is left, `status` returns `"solved"`, and a 0.5s flash
  plays

### Requirement: Mosaic's Solve applies the deduced solution

The Solve command SHALL take the board's one answer from the search that
counts its answers, at either difficulty, and apply the full solution, its
cells flagged solved. It SHALL fail with an error when the search did not
prove exactly one answer, saying which where it proved several or none.

#### Scenario: Solve completes the board

- **WHEN** the Solve command runs on a generated board of either difficulty
- **THEN** every cell is determined and the board is solved

### Requirement: Mosaic checks mistakes against the deduced solution

`findMistakes` SHALL return every cell the player has determined whose mark
contradicts the board's one answer, taken from the search at either
difficulty, and each SHALL be drawn with an error-colored outline overlay. It
SHALL return no mistakes when the search did not prove exactly one answer or
when the marks are consistent.

#### Scenario: findMistakes flags a wrong mark

- **WHEN** the player marks a cell that is blank in the solution and Check &
  Save runs
- **THEN** `findMistakes` returns that cell
- **AND** a correctly-marked board returns no mistakes

### Requirement: Mosaic draws its marks as a piece and a cross on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. Every cell SHALL
have the same surface whatever its mark, and the line between cells SHALL be
the collection's thin surface grid. A marked cell SHALL hold the collection's
shaded piece, inset on its cell. An unmarked cell SHALL be plain surface.

#### Scenario: The three marks are told apart without a fill

- **WHEN** a board holding a marked cell, a blank cell and an unmarked cell is
  drawn
- **THEN** all three cells are filled with the same surface color
- **AND** the marked cell holds the shaded piece, the blank cell holds a cross
  and the unmarked cell holds neither

### Requirement: A blank Mosaic cell carries a cross that leaves its number the middle

A blank cell SHALL hold no piece and no fill of its own. It SHALL carry the
collection's ruled-out cross: in the middle of the cell, or small in a corner
of it where the cell has a number, so that the number keeps the middle.

#### Scenario: A blank cell's cross and its number both read

- **WHEN** a blank cell that has a number is drawn
- **THEN** the cross is small and lies wholly to the right of the number's
  center and wholly above it

### Requirement: A Mosaic number reads over whatever its cell holds

A cell's number SHALL be drawn over whatever the cell holds and SHALL read
against it in both color schemes: on the shaded piece it is drawn in a color
that does not invert with the scheme. A satisfied number SHALL be drawn grayer
than an unsatisfied one on every kind of cell, the piece included.

#### Scenario: A satisfied number grays on the piece and off it

- **WHEN** a satisfied number is drawn on a marked cell
- **THEN** it is drawn in a different color from an unsatisfied number on a
  marked cell
- **AND** a satisfied number on a blank cell is drawn in a different color
  from an unsatisfied number on a blank cell

### Requirement: A contradicted Mosaic number is red, and a badge on the piece

A contradicted number SHALL be drawn in the error color on bare surface. On
the shaded piece it SHALL be drawn as a badge: a disc in the error color under
the number.

#### Scenario: A contradicted number on a marked cell

- **WHEN** a marked cell's number has more marked cells around it than its
  value
- **THEN** a disc in the error color is drawn on the piece, and the number
  over the disc

### Requirement: Mosaic names no hue of its own for either mark

The game SHALL name no hue of its own for either mark: its hint sentences, its
control words and its hint-mark legend SHALL say the engine's words for a
shaded cell and for a cell known not to be shaded, and its help page SHALL
name the shaded color by placeholder.

#### Scenario: A hint names the mark by the engine's word

- **WHEN** a hint step concludes that squares must be marked
- **THEN** its sentence says the engine's word for the shaded color
- **AND** a step that concludes squares must be blank says the engine's word
  for a cell known not to be shaded

### Requirement: Mosaic counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over its
one rule, assuming an undecided square shaded and then clear where the rule
stops. It SHALL report one answer, several, none, or that it stopped at its
budget, which SHALL be counted in positions and never in time. A square no
number counts is free, so a board with one has several answers.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 3×3 board the rule finishes, on a 5×5 with
  one answer that it does not reach, on a 3×3 with a lone 5 in the middle and
  on a 3×3 whose corner counts none and whose middle counts nine
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by shading or clearing one
  square at a time
- **THEN** the search reports one answer exactly where one picture fits,
  several where more do and none where none does

### Requirement: Mosaic's rule says when a block cannot meet its number

The rule SHALL report a contradiction as soon as a number's block holds more
shaded squares than the number, or too few squares that are not clear to
reach it, whether or not every square of the block is decided.

#### Scenario: A block goes wrong with squares still undecided

- **WHEN** the search is given one position to try on a 3×3 board whose
  corner is 4 and whose middle is 3, and on one whose corner is 0 and whose
  middle is 6
- **THEN** it reports no answer for each
- **AND** on a 3×3 board with a lone 5 it reports that it stopped

### Requirement: An Unreasonable Mosaic board has one answer that the rule does not reach

At Unreasonable the generator SHALL take an Easy board and hide further
clues, each only while the search still proves one answer within a budget of
its own, well under the search's, and SHALL keep the board only when the rule
stops short on it. With aggressive generation it SHALL try every clue.
Without, it SHALL stop at the first clue whose loss stops the rule.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 3×3 to 6×5, with
  aggressive generation on and off
- **THEN** the rule leaves each unfinished
- **AND** exactly one picture fits each, by a count that has no search in it

#### Scenario: A board keeps its numbers where generation is not aggressive

- **WHEN** an Unreasonable 10×10 board is dealt from one seed with aggressive
  generation off and on
- **THEN** the first shows more numbers than the second

#### Scenario: The smallest and the largest boards carry the tier

- **WHEN** an Unreasonable 3×3, 3×20, 30×30, and without aggressive
  generation 50×50 and 100×100 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Mosaic rejects board shapes it cannot generate

`validateParams` SHALL refuse, when a board is to be dealt at either
difficulty, a board longer than the longest that is dealt at its shorter
side, with a reason naming both. A board 20 or more across SHALL be dealt at
any length within the tile limit. A description that is supplied SHALL NOT
be held to the bound.

#### Scenario: A long thin board is refused with a reason

- **WHEN** a 3×21, a 5×31, an 8×51, a 101×12 and a 19×201 board are validated
  for generation
- **THEN** each is refused with a message naming its shorter side and that
  side's greatest length
- **AND** a 3×20, a 5×30, a 9×50, a 10×100, a 15×200 and a 20×500 board are
  admitted

#### Scenario: An existing long description still loads

- **WHEN** a 3×400 board's params accompany a supplied description
- **THEN** validation succeeds

### Requirement: Aggressive Unreasonable generation is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 900 squares with aggressive generation on, with a reason
that says to turn it off. The same size SHALL be dealt at Easy, and at
Unreasonable with aggressive generation off.

#### Scenario: A size dealt at Easy is refused at aggressive Unreasonable

- **WHEN** a 31×30 and a 50×50 board are checked for dealing
- **THEN** each is refused at Unreasonable with aggressive generation on
- **AND** each is admitted at Easy, and at Unreasonable with it off

### Requirement: Mosaic's menu offers each size at both difficulties

Mosaic's presets SHALL offer each of 3×3, 5×5, 10×10, 15×15, 25×25 and 50×50
as Easy and as Unreasonable, and the default SHALL be an Easy 10×10.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Mosaic's preset menu is read
- **THEN** its six sizes each appear as Easy and as Unreasonable

### Requirement: A pasted Mosaic board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the rule and the
hint finish it, and as Unreasonable where it has exactly one answer that they
do not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the rule does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 3×3 board with a lone 5, and a 3×3 board whose corner counts
  none and whose middle counts nine, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Mosaic's hint stops where the rule does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the steps the rule forces from the player's marks and no others, and
where none forces anything it SHALL refuse with the collection's sentence
that deduction has run out. It SHALL go on from the squares the player then
marks.

#### Scenario: The hint stops, and goes on from a square tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a square marked wrongly there is reported by the mistake check
- **AND** with a square marked as the solution has it wherever the hint
  stops, the hint finishes the board
