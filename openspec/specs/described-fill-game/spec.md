# described-fill-game Specification

## Purpose
A fill game, whose player sets each cell toward one hidden answer, born from
its description: the engine's board, input, render, deal, game ID and hint
built from the compiled module, so the game writes no TypeScript.

## Requirements

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

### Requirement: A born game's ID is its description's grammar

A born game's description SHALL state its game ID's grammar (`id:`), and the
engine SHALL read and write a desc by it alone, refusing what the grammar does
not write.

#### Scenario: Upstream's Tents descs are read and written byte for byte

- **WHEN** a Tents desc upstream's generator writes is read and written again
- **THEN** the desc written is the desc read

### Requirement: A born game deals a sampled answer at its tier

A born game SHALL deal by sampling an answer as `deal.sample` states, deriving
the clues from it, and keeping it only where its board is finished at the tier
asked for and not at the tier below. Where `noBareLine` is stated, an answer
with a line holding only the rest value SHALL be drawn again.

#### Scenario: A Tents answer with a column of grass alone

- **WHEN** a Tents answer is sampled with a column holding neither a tent nor
  a tree
- **THEN** it is drawn again, and no board is dealt from it

### Requirement: A born game's hint begins at the tier its board needs

A born game's hint SHALL walk its ladder from the player's own values and
marks, beginning at the lowest tier that finishes the board as dealt and going
up a tier only where that one finds nothing, and each step SHALL be worded by
its technique's `says`.

#### Scenario: An Easy board's hint uses no Normal technique while an Easy one fires

- **WHEN** the hint is followed on an Easy Tents board from nothing placed
- **THEN** no step is a Normal technique's while an Easy technique has a
  firing

### Requirement: A born game's step may ask for a mark

A firing's `MARK` facts SHALL be a step's targets beside its `PLACE` facts.
Where the game's mark is a link, the step SHALL ring it, and play it by the
link's drag after its clicks, the clicks on squares the secondary value rules
out first.

#### Scenario: A tree's one open square is placed joined

- **WHEN** a Tents step places a tree's tent on its one open square
- **THEN** the step sets the tent and marks the link, and playing it leaves
  them joined

### Requirement: Links read at a glance are not asked for

Where a description states `play.glance`, the walk SHALL read those
techniques once on the drawn marks before each firing, and SHALL ask for a
mark beyond them only where `play.askBefore` offers one after which a stalled
technique fires, or where nothing else is left.

#### Scenario: A link is asked for only when a step needs it

- **WHEN** a Tents step only draws a link and the next step places a square
- **THEN** that next firing could not have fired before the link

### Requirement: What a placement rules out is the description's techniques

A description's `rulesOut` SHALL name techniques, or one arm of a technique as
`<id>.<arm>`, and a placement SHALL bring the conclusions of those firings
whose premise holds a square it placed, never on a square the move itself
changed, and nothing on a board the techniques find contradictory.

#### Scenario: A tent on a small board

- **WHEN** the rule-out preference is on and a tent is placed at the fourth
  row's second square of the 4×4 Tents board `cdcc,1,1,1,0,1,1,0,1`
- **THEN** the squares round it and the open squares of the lines it completes
  become grass in the same move

### Requirement: Painters naming one color share its slot

A born game's renderer SHALL give each named color one palette slot, however
many of its painters draw in it.

#### Scenario: Tents' ground is one slot

- **WHEN** Tents' palette is built
- **THEN** the ground under a tent, under a tree and under grass is one slot

### Requirement: A born game may build its answer and hide its clues

Where `deal.sample` is `build`, the answer SHALL be built a random value on a
random undecided cell at a time, each followed by what the whole ladder then
decides. Where `deal.hide` names a clue kind, its clues SHALL be taken away a
tier at a time from the lowest: first those no firing's bindings read, then
the others in a random order while the board still finishes at that tier;
with `deal.thorough` off, none at the lowest and at most the board's shorter
side at each above.

#### Scenario: An Unruly board keeps only the givens it needs

- **WHEN** an Unruly board is dealt and any one of its givens is taken away
- **THEN** the board no longer finishes at its tier

### Requirement: A born game's deal setting is a param by its letter

`deal.thorough` SHALL be a setting in the params by its letter, written only
where it is off and read as on where it is absent, so an upstream ID reads
as upstream reads it. A menu board SHALL have it on where it is narrower
than `offFrom`.

#### Scenario: Mosaic's largest board is dealt quickly

- **WHEN** Mosaic's menu boards are encoded in full
- **THEN** the 50×50 board carries `h0` and no other board an `h`

### Requirement: A born game's last tier may be the answer search's

Where the last tier is named Unreasonable, a board SHALL be of it where the
ladder does not finish it and a search, assuming each value in an open cell
of the number with fewest open cells, proves it one answer. Its deal SHALL
strip a board of the lowest tier, or on one try in eight every clue, while
the search proves one answer; and Solve and Check SHALL read the searched
answer.

#### Scenario: An Unreasonable Mosaic board

- **WHEN** an 8×10 Mosaic board is dealt at Unreasonable and its hint is
  followed
- **THEN** the hint stops short of the answer, and Solve finishes it

### Requirement: A born game draws its numbers on their cells

A cell clue kind the player does not fill and the deal does not place SHALL
be drawn as a number on its cell, light on a dark piece, faint once every
cell its meaning ranges over is decided, and a badge where broken. A step's outlined number SHALL have those
cells outlined as one block and the number circled. The status bar SHALL
count the numbers not yet faint. The `digits` ID segment SHALL write the
kind as upstream does, a digit a number and a letter a run without one.

#### Scenario: Mosaic's numbers

- **WHEN** the 3×3 Mosaic board `d7a2a4` is opened, and its hint followed
- **THEN** the status bar reads "Clues left: 3", each step circles the number
  it names and outlines its block, and the status bar is empty at the end

### Requirement: A born game's dealt cells and modifiers are its description's

A clue kind `play.dealt` names, meaning `value(at) = v`, SHALL be dealt as
fixed values in its cells, which no button changes. A modifier in
`play.modifiers` SHALL put its variation in the params by its letter, and
the params SHALL refuse a board its `most` bounds or one off `sizes.step`.

#### Scenario: Unruly's unique boards are bounded

- **WHEN** the params of a 6×16 Unruly board with unique rows and columns are
  checked
- **THEN** they are refused, and the same board without the rule, and a 6×14
  one with it, are not

### Requirement: A born game draws a broken rule by the shape of its cells

A live violation SHALL be drawn by the shape of the cells it names, never by
the rule's name: three or more in a row along part of a line as a bar along
them, two or more whole parallel lines as a bar across each, and any other
cells as their pieces in error. A rule over a dealt partition's parts SHALL
be drawn as its cells' pieces in error however they lie.

#### Scenario: A run of three and two lines alike

- **WHEN** an Unruly row holds three blocks side by side, and on a unique
  board two full rows are alike
- **THEN** a bar is drawn along the three, and one across each of the two
  rows, and no piece of them carries a badge for it

### Requirement: A born game's growing piece animates its placement

Where the painter of a value placed or taken away on a single cell draws it
growing, the move SHALL animate it growing from, or shrinking to, the
middle of its cell. A move that changes more than one cell, or one whose
pieces are drawn whole, SHALL be instant.

#### Scenario: A disc placed grows, and a tent appears whole

- **WHEN** a disc is placed on an Unruly cell, and a tent on a Tents one
- **THEN** the disc's move animates and the tent's is instant

### Requirement: A born game may deal a partition

A region `space.regions` names `dealt` SHALL be a partition of the board.
The `walls` ID segment SHALL write it as upstream's wall runs, refusing a
part smaller than `deal.grow.holds`. The board SHALL draw it as heavy walls
and a fill a part, and the text format as walls between parts. The search
SHALL assume in the part or number with fewest open cells.

#### Scenario: A part of one square

- **WHEN** a Norinori ID walls off one square alone
- **THEN** it is refused

### Requirement: A born game's partition may be grown round its answer

Where `deal.grow` names the partition, the deal SHALL grow it round the
answer: the answer's pieces of its value sized `holds`, some closed as
parts of their own by `closed.oneIn` a tier, each other grown from and
joined while a part holds at most `holds` of them, no other part under
`smallest`, and mended until the ladder alone finishes the board at its
tier.

#### Scenario: A Norinori board's regions

- **WHEN** a Norinori board is dealt and its ID read back
- **THEN** the regions are those dealt, each connected, and the board's
  hint finishes it

### Requirement: A born game's right button rules out unless it places a pair piece

The secondary button SHALL be a ruling out, its value a mark of what the
answer leaves out, unless that value's painter draws one of a pair of alike
pieces, which is a placement.

#### Scenario: Mosaic's and Unruly's right buttons

- **WHEN** the target verbs of Mosaic and Unruly are read
- **THEN** Mosaic's right button rules out and Unruly's does not

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

### Requirement: A born game's params may give a tally of pieces

`play.tally` SHALL name a clue at the board of two fields, a length and its
count, that the params give: a size by its letter after the grid's and the
counts after a comma at the end, one of the longest and one more of each
shorter by default. Params SHALL be refused where the size is not smaller
than a side, no piece is counted, or the pieces cannot be laid.

#### Scenario: Boats' fleet

- **WHEN** `6x6f3dhS,3,2,1` is decoded and encoded without the tier
- **THEN** it is `6x6f3,3,2,1`, and `4x4f3de,9,9,9` is refused as not fitting

### Requirement: A born game's sample may be the tally's pieces

`sample: pieces` SHALL lay the tally's pieces as straight runs of a value, the
longest first, each at a random place in a random stretch of a row or column
holding no piece, none touching another even at a corner. A tally SHALL be
drawn beneath the board, a piece struck through once that many are whole,
and red where more are.

#### Scenario: A dealt fleet is whole

- **WHEN** a Boats board is dealt and solved
- **THEN** its boats of each length are as many as the fleet counts

### Requirement: A born game's hide may be the player's setting

`deal.hideFlag` SHALL be a setting written after the tier by its letter,
under which the deal hides its `kind` in one random order with `deal.hide`'s,
and refuses a board that hides none of it. `deal.withhold` SHALL name values
a deal never derives.

#### Scenario: Remove numbers

- **WHEN** a Boats board is dealt with Remove numbers on
- **THEN** at least one row's or column's number is hidden, and no given
  square is a segment of unknown shape

### Requirement: A born game's ID may close and hide numbers and name values by letters

`numbers` SHALL write `hidden`'s character for a clue not shown and, where
`closed`, a comma after each. A `glyphs` segment SHALL write a cell kind's
values by letters, runs of empty cells `a` to `z` between them and the last
run dropped.

#### Scenario: An upstream Boats ID

- **WHEN** `6x6f3deS,3,2,1:2,2,1,1,0,4,1,-,3,1,-,1,WaWWgTLqWaW` is opened
- **THEN** its desc is written back the same

### Requirement: A born game's piece may run as one hull

A painter that `runs` SHALL be told the sides a piece joins along its line: a
given one's from the answer, any other's from the squares round it, the
edge, a decided other value and, once the tally's pieces are all placed, an
open square shutting it; and told where its way is still open. `play.shape`
SHALL draw a cell kind as its cell's piece, never as a number.

#### Scenario: A boat between water and a segment

- **WHEN** a placed segment has water left, above and below and a segment on
  its right
- **THEN** it is drawn as its boat's left end
