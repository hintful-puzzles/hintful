## ADDED Requirements

### Requirement: A born game's size bounds are its description's

What the sizes alone cannot say of a board SHALL be the description's
`play.bounds`: bounds on the sides' sum, their product, the shorter and the
longer, and further bounds on a board of a tier. A board outside the first
SHALL be refused with a sentence naming the bound; a full ID outside a
tier's SHALL be refused as having no such tier.

#### Scenario: Range's bounds

- **WHEN** Range's params `64x65`, `2x2` and `1x5du` are checked
- **THEN** the first is refused for its width plus height, the second for
  its sides, and the third as no 1x5 puzzle being Unreasonable

### Requirement: A born game's number may be plain

A number on a cell whose meaning reads no block of cells SHALL be named
`play.plain`: it SHALL have no block to outline or search in, SHALL never
turn faint, and SHALL not be counted in the status bar. Outlined by a step,
it SHALL be one of the area's squares and SHALL not be circled.

#### Scenario: Range's numbers

- **WHEN** a Range hint outlines a square holding a number
- **THEN** the number is not circled, and the status bar counts no number

### Requirement: A born game's hidden clues may keep a symmetry

Where `deal.symmetric` is `halfTurn`, the clues of the hidden kind SHALL be
dealt symmetric under a half turn: a clue whose partner square has none
SHALL go before any is hidden, and each other SHALL be hidden, and kept,
with its partner, at every tier and by the search tier's strip.

#### Scenario: Range's deal

- **WHEN** a Range board is dealt at either tier
- **THEN** each numbered square's partner under a half turn holds a number

### Requirement: A born game's scatter may try a share and keep the rest joined

`scatter.tried` SHALL make the share one of the cells tried in a random
order, each taken where it may be, so the count taken varies; and
`scatter.joinedRest` SHALL take a cell only where the cells not taken stay
one group side by side (upstream's range.c).

#### Scenario: Range's answer

- **WHEN** a Range answer is drawn
- **THEN** no two shaded squares touch, and the clear squares are one group

### Requirement: A born game's run code may write whole numbers

The `digits` segment with `apart` SHALL write each clue as a whole number,
`apart` between two with no run between them and nowhere else, and SHALL
refuse a number below the kind's least value or above its largest at the
cell.

#### Scenario: Range's upstream ID

- **WHEN** the Range desc `9a9g2c7k12_5k3c5g4a6` is read on a 9x6 board
- **THEN** its numbers are 9, 9, 2, 7, 12 and 5 in reading order, the 12 and
  the 5 side by side
- **AND** `2_c5d`, `0h` and `25g` on a 3x3 board are refused

### Requirement: A born game's params may give a size beyond the grid's

A size the rules read that the grid is not measured in SHALL be given by
the params, as `play.sizes` declares it: its letter, and a ruleset for each
value, which the Custom dialog offers as the game mode and the help's
`{{rulesets}}` lists. A ruleset's `least` SHALL refuse a narrower board,
naming the ruleset. A preset board SHALL give the size after its `WxH` by
its letter. Every technique and rule that reads the size SHALL get it.

#### Scenario: Star Battle's stars

- **WHEN** Star Battle's params `10s2dn` are read, and a 7x7 grid of two
  stars is checked
- **THEN** the board is 10x10 with two stars to a row at Normal, and the
  grid is refused with "Two stars: the grid size must be at least 8."

### Requirement: A born game's grid may be square

Where the description's grid is as high as it is wide, the Custom dialog
SHALL offer one grid size, the params SHALL write it as a bare number, and
the game SHALL have no turned board.

#### Scenario: Star Battle's size

- **WHEN** a 10x10 Star Battle board is encoded
- **THEN** its params start `10`, not `10x10`

### Requirement: A born game's answer may be a count to every line

`deal.sample.lines` SHALL draw `count` cells of its value in every row and
column, none within `apart` of another, at random, `count` a number or a
size the params give; and `deal.grow`'s `holds`, `smallest` and `parts`
SHALL each be a number or a formula of the board's sizes, `closed` SHALL be
optional, and a desc with another count of parts than `parts` SHALL be
refused.

#### Scenario: Star Battle's deal

- **WHEN** a Star Battle board of two stars is dealt
- **THEN** its answer holds two stars in every row, column and region, none
  touching another, and a desc naming a region for every square is refused

### Requirement: A born game's dealt kind may say more than its value

`play.dealt` SHALL name a clue kind at a cell meaning `value(at) = v`, alone
or before an `and`. Where its meaning says more, the cell SHALL be drawn with
a dot on its piece, light on a dark piece and dark on a light one.

#### Scenario: Clusters' dots

- **WHEN** a Clusters board is drawn
- **THEN** each given piece carries a dot, and a piece the player placed none

### Requirement: A born game's sample may be mended

A scatter drawn a cell at a time (`each`) MAY `mend`: each cell a rule breaks
at, its clues derived from the sample, SHALL take the other value, the first
in reading order at a time, until none does.

#### Scenario: Clusters' sample

- **WHEN** a Clusters answer is sampled
- **THEN** no square of it is without one of its own piece beside it

### Requirement: A born game's deal may climb toward its tier

A scatter drawn a cell at a time MAY `climb`: a draw after one the deal
refused SHALL keep the cells the ladder decided on it and sample the rest,
one draw in a hundred sampling every cell, and a board the tier below
finishes SHALL have one cell turned. `deal.unpair` SHALL take off each two
clues of its kind side by side and alike, the answer then the ladder's or
the search's. A search tier with no hide SHALL keep a board the ladder stops
short of where the search proves one answer.

#### Scenario: Clusters' deal

- **WHEN** a Clusters board is dealt at any tier
- **THEN** no two dots side by side are alike, and the board finishes at its
  tier and not below, or at Unreasonable has one answer the ladder does not
  reach

### Requirement: A born game's deal may take options

A description's `deal.options` MAY name settings of the deal by letter: a
number in a range, or one of named choices, each with a default, and a choice
with the size bounds it alone binds, a tier's among them. The Custom dialog
SHALL offer each and the params SHALL write each after the size. A label
SHALL name one only where it is not a preset board's own (`7x7s4`), or the
default on any other board. A `tierFlag` letter MAY stand for a tier.

#### Scenario: Light Up's options

- **WHEN** Light Up's Custom dialog is opened
- **THEN** it offers the share of walls and the symmetry, and a 3×3 under
  2-way rotational symmetry at Unreasonable is refused, naming the symmetry

### Requirement: A born game's build may lay one value on a first one's cells

A built or scattered sample MAY lay a `first` value on a share of the
cells, as symmetric as an option asks. A build SHALL then lay one value
alone, each on a random cell that may still hold it, the ladder deciding the
rest on the first cells' clues, every hidden one hidden; a scatter SHALL
scatter on the cells left. A `ramp` SHALL raise the share by its step every
`every` draws, wrapping past its top. A hidden clue MAY leave another kind's
on its cell (`deal.leaves`).

#### Scenario: Light Up's walls

- **WHEN** a Light Up board is dealt at 20% walls with 2-way rotational
  symmetry
- **THEN** its walls are the same after a half turn, each number hidden
  leaves a bare wall, and its answer lights every open square with no bulb
  lighting another

### Requirement: A born game's values may wash a cell

`play.wash` MAY wash each open cell a formula holds of: it SHALL be drawn in
the wash under its piece, read as holding the secondary value by the rules
and the live errors, left open by Solve, and never a hint step's. Its
preference SHALL say whether a secondary piece is drawn on it. A technique
run on placing SHALL run on each value the board holds as well as on each
the ladder places.

#### Scenario: Light Up's light

- **WHEN** a bulb is placed
- **THEN** the squares it lights are washed, a cross there is drawn or not as
  the preference says, and a hint never crosses them

### Requirement: A born game's clue may be written once in a group

`deal.oneIn` MAY derive a kind's clue on one random cell of each group a
formula names: the clue SHALL be the one its meaning reads there as the only
one of its kind, so a meaning that reads other clues is written once.

#### Scenario: One number on each stick

- **WHEN** a Sticks board is dealt
- **THEN** each line of its answer carries one length number, on a random
  square of it, before any is hidden

### Requirement: A born game may hide several kinds of clue

`deal.hide` MAY name several kinds, whose clues SHALL be hidden in one random
order across them, each kept hidden while the ladder finishes the board.
`deal.stripFrom: everyClue` SHALL start every draw of a search tier from
every clue, not from a board of the lowest tier.

#### Scenario: Sticks hides lengths and block numbers together

- **WHEN** a Sticks board is dealt at Easy
- **THEN** both its line numbers and its block numbers are among those hidden

### Requirement: A born game's run code may write a clue after a letter

A digits segment's `after` MAY write, straight after a letter's cell, one
digit for a clue of a named kind on it, absent where it has none, and the
reading SHALL refuse a digit past the kind's largest.

#### Scenario: Sticks' numbered block

- **WHEN** `4x1:B2_1_3a` is read
- **THEN** the first square is a block numbered 2, and the next two hold the
  numbers 1 and 3

### Requirement: A born game's values may be lines along an axis

A value painted as a bar MAY name an axis, `row` or `column`. A drag SHALL
then set, from where it began along its row or column, the value of that
axis, or clear them if the first cell holds it; an arrow with Ctrl SHALL set
the value along the move in the two cells, with Shift the one across it, and
with both clear them, leaving out fixed cells and cells already so.

#### Scenario: Sticks' drag and arrows

- **WHEN** a drag runs along a row of empty squares, and Ctrl and Right is
  pressed with the cursor before a block
- **THEN** the drag draws a line across in each, and the block is left out

### Requirement: A born game's hint names a number by what it shows

A step's `{each}` SHALL be the number written on the square it names, of the
first kind in `numbers` with a clue there.

#### Scenario: This 3 must be horizontal

- **WHEN** a Sticks step forces a square holding the number 3 to be
  horizontal
- **THEN** it says that this 3 must be horizontal

### Requirement: A born game's grid may be a hexagon

`space.grid.hexagon` MAY hold a w by h hexagon in a store ⌈h/2⌉ − 1 wider,
each row drawn half a tile right of the one above. Its corners SHALL hold
the named outside kind, which forces them clear, and SHALL be neither drawn,
targeted nor written in an ID, where a run of letters ends at one. An
outline SHALL join cells along a row alone, and the board SHALL have no
turned form.

#### Scenario: Bricks' 4×4

- **WHEN** `4x4:2b1c0c2_2b1` is opened
- **THEN** its store is five cells wide, its four corners are holes, and a
  press a tile left of a row's first cell takes no cell

### Requirement: A born game's hexagon cursor steps to six neighbors

On a hexagon the cursor SHALL start on the board and stay on it, and SHALL
step by `shearedHexStep`: the arrows, Up and Down zigzagging down the column
it is drawn in, and the number pad's eight directions, which a digit key on
the pad never reaches as a digit.

#### Scenario: The pad's 7 and 3

- **WHEN** the pad's 3 and then its 7 are pressed on a Bricks board
- **THEN** the cursor steps to the cell below and right, and back

### Requirement: A born game's build may lay its value in order, at a share

A build MAY take its cells in `order: upward`, rows from the bottom, each
from the left, and lay its value at the chance `share` where the marks allow
it and another value otherwise. A build whose value holds fewer than `least`
of the cells no clue fixes SHALL be drawn again.

#### Scenario: Bricks' wall

- **WHEN** a Bricks board is dealt
- **THEN** at least two in five of its cells are bricks

### Requirement: A born game's run code may write another kind as a number

A digits segment's `also` MAY name a number, past the segment kind's
largest, that SHALL be read as a clue of another kind at its cell, and
written for one there.

#### Scenario: Bricks' 7

- **WHEN** `4x4:2b1c7c2_2b1` is read
- **THEN** the cell the 7 stands on is a hole, clear and fixed, and holds no
  number

### Requirement: A born game may read a retired tier letter

`tierAliases` MAY name a letter that SHALL be read after `d` as the tier it
names, and never written.

#### Scenario: Bricks' Tricky

- **WHEN** `7x6dt` is read
- **THEN** it is the 7×6 Unreasonable board, written `7x6dn`

### Requirement: A born game's line clue may be a list

A line kind whose meaning is `T = v` for a list `T` SHALL be a list clue:
derived whole from the answer, written by an ID's `lists` segment, a line
to a `/` and its numbers joined by `.`, and drawn in margins sized to the
longest list, a column's stacked above it and a row's beside it, red where
its line breaks it. With a list clue each fifth grid line SHALL be doubled.

#### Scenario: Pattern's 5×5

- **WHEN** `5x5:4/2.2/2/1/2/2/2/1/3.1/4` is read and written
- **THEN** the second column's list is 2 and 2, and the ID it writes is the
  one read

### Requirement: A born game's sample may be a picture

`deal.sample: picture` SHALL draw upstream's picture: random noise smoothed
over each cell's neighbors and cut at its median, and drawn again where a
line longer than two holds one value alone.

#### Scenario: A Pattern deal

- **WHEN** a 10×10 Pattern board is dealt
- **THEN** it opens at its tier and holds shaded squares

### Requirement: A born game's kind may be read and never dealt

A kind named in `deal.never` SHALL never be dealt, and SHALL be read from an
ID that holds it. A `dots` segment with `before` SHALL be read only after
that text, and SHALL write nothing where no cell holds its kind.

#### Scenario: Pattern's given squares

- **WHEN** `2x2:1/1/1/1,aBb` is opened
- **THEN** its first cell is fixed clear and its third fixed shaded

### Requirement: A born game's search tier may hide no clue

Where no clue is hidden, the search tier's deal SHALL draw until the ladder
stops short of the answer and the search proves the answer the only one.

#### Scenario: Pattern Unreasonable

- **WHEN** a 6×6 Unreasonable Pattern board is dealt
- **THEN** it opens as `6x6du`

### Requirement: A born game's technique may read where a run can start

`least_start(L, R, k, v)` and `greatest_start` SHALL be the first and last
place run `k` of list `R` can start on line `L`, its runs of value `v`
packed toward one end and then the other around the line's decided cells.

#### Scenario: A run with no room to slide

- **WHEN** Pattern's hint is read on a 10×10 board whose third column is 4
- **THEN** a step shades that column's top four squares, saying its run of
  4 has nowhere to slide

### Requirement: A born game's cell kind may be written a character a cell

An ID's `cells` segment SHALL write its cell kind on every cell in scan
order, one desc-alphabet character each, and SHALL refuse a desc of another
length or a number outside the kind's range.

#### Scenario: Singles' 3×3

- **WHEN** `3x3:111321331` is read and written
- **THEN** its fourth cell holds 3, and the ID it writes is the one read

### Requirement: A born game's numbers may be a Latin square's

`deal.latin` SHALL lay a Latin square's numbers on the build board, and SHALL
then number each cell holding its `under` value to repeat a number of its
row or column, one single in both where there is one.

#### Scenario: A Singles deal

- **WHEN** a Singles board is dealt and solved
- **THEN** each shaded square's number is another square's in its row or
  column

### Requirement: A born game's piece may hide its number

A value named by `play.hides` SHALL hide its cell's number, and its
preference SHALL show it smaller; a press in the half tile round the grid
SHALL flip the preference and make no move. `play.wrap` SHALL carry the
cursor over the grid's edge.

#### Scenario: A press off Singles' grid

- **WHEN** the player presses outside the grid with the preference off
- **THEN** it is on, and `interpretMove` returns `UI_UPDATE`

## MODIFIED Requirements

### Requirement: A fill game is born from its description

A game whose player fills a grid toward one hidden answer MAY be born from its
description: `fillGame` of its compiled module SHALL be the whole game, its
catalog entry, boards and hint legend read from `catalog:` and `play:`, and its
directory SHALL hold no TypeScript but its tests.

#### Scenario: Tents is its description

- **WHEN** the catalog and the registry are read
- **THEN** Tents, Kakurasu, Unruly, Mosaic and Norinori are in all of them, and no one
  of their directories holds a TypeScript file that is not a test

#### Scenario: The plain-cell family is its descriptions

- **WHEN** the catalog and the registry are read
- **THEN** Range, Star Battle, Clusters, Light Up, Sticks, Bricks, Pattern,
  Singles and Boats are in all of them, and no one of their directories
  holds a TypeScript file that is not a test
