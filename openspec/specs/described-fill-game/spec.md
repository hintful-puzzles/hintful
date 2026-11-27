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

#### Scenario: The candidate-note family is its descriptions

- **WHEN** the catalog and the registry are read
- **THEN** Unequal and Adjacent are in all of them, and neither directory
  holds a TypeScript file

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
random undecided cell at a time, each followed by what the ladder then
decides, from its lowest tier and a tier higher after each build that meets
a dead end or breaks a rule. Where `deal.hide` names a clue kind, its clues
SHALL be taken away at the lowest tier, then at the asked one, while the
board finishes; a draw the lowest does not finish is drawn again, short of
a long run of them.

#### Scenario: An Unruly board keeps only the givens it needs

- **WHEN** an Unruly board is dealt and any one of its givens is taken away
- **THEN** the board no longer finishes at its tier

#### Scenario: A Mosaic board the lowest tier does not finish is drawn again

- **WHEN** a Mosaic 12x15 board is drawn at Normal whose every number Easy
  does not finish and Normal does, after draws Easy finished
- **THEN** it is thrown away and another drawn, since hiding its numbers at
  Normal costs more than drawing again

#### Scenario: A narrow Mosaic board still deals

- **WHEN** a Mosaic 3x50 board is asked at Normal, whose draws Easy seldom
  finishes with every number
- **THEN** a board is dealt at Normal, hidden from at Normal once a run of
  draws Easy did not finish has passed

### Requirement: A born game's deal setting is a param by its letter

A `flag` setting with `written: off` SHALL be written as its letter and
`0` only where it is off and read as on where it is absent, so an upstream
ID reads as upstream reads it. A menu board SHALL have it on where it is
narrower than the setting's `onBelow`. `deal.thorough` MAY name such a flag.

#### Scenario: Mosaic's largest board is dealt quickly

- **WHEN** Mosaic's menu boards are encoded in full
- **THEN** the 50×50 board carries `h0` and no other board an `h`

### Requirement: A born game's last tier may be the answer search's

Where the last tier is named Unreasonable, a board SHALL be of it where the
ladder does not finish it and a search, assuming each value in an open cell
of the number with fewest open cells, proves it one answer. Its deal SHALL
strip a board hidden at the lowest tier below the search's that finishes
it, or on one try in eight every clue, while the search, assuming the dealt
value last, meets the dealt answer first; and Solve and Check SHALL read
the searched answer.

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
fixed values in its cells, which no button changes. A `flag` setting with
`gives: variation` SHALL put the variation of its name in the params by its
letter, and the params SHALL refuse a board its `most` or `bounds` bound or
one off `sizes.step`.

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
the params, as a `choice` setting with `gives: size` declares it: its
letter, and a ruleset for each choice, which the Custom dialog offers as
the game mode and the help's `{{rulesets}}` lists. A choice's `least` SHALL
refuse a narrower board, naming the ruleset. A preset board SHALL give the
size after its `WxH` by its letter. Every technique and rule that reads the
size SHALL get it.

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

A setting with no `gives` is the deal's alone: a `number` in a range, or a
`choice` of named choices, each with a default, and a choice with the size
bounds it alone binds, a tier's among them. The Custom dialog SHALL offer
each and the params SHALL write each after the size. A label SHALL name one
only where it is not a preset board's own (`7x7s4`), or the default on any
other board. A `tierFlag` letter MAY stand for a tier.

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
`every` draws, wrapping past its top.

#### Scenario: Light Up's walls

- **WHEN** a Light Up board is dealt at 20% walls with 2-way rotational
  symmetry
- **THEN** its walls are the same after a half turn, and its answer lights
  every open square with no bulb lighting another

#### Scenario: A hidden number leaves its bare wall

- **WHEN** a board whose walls carry numbers is dealt, and a number is hidden
- **THEN** its game ID writes that wall as a bare wall, and a wall whose
  number is shown as its number, with no word of the description's

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
`deal.hide` SHALL be one kind, a list of them, or by kind how it is hidden,
in the deal's order. A kind hidden `first` SHALL have every clue tried at
each tier before any clue of a kind without, each side in a random order.
`deal.stripFrom: everyClue` SHALL start every search-tier draw from every
clue.

#### Scenario: Sticks hides lengths and block numbers together

- **WHEN** a Sticks board is dealt at Easy
- **THEN** both its line numbers and its block numbers are among those hidden

#### Scenario: Squares go before sums

- **WHEN** a `flanking` board is dealt at Normal, its givens hidden
  first (`hide: { given: { first: true }, flank: … }`)
- **THEN** it shows fewer givens and more sums than the same deal in one
  random order

#### Scenario: Squares go first at the lowest tier too

- **WHEN** a `flanking` board is dealt at Easy hiding its sums too, its
  givens hidden first
- **THEN** it shows fewer givens than sums, where the givens alone would
  finish it

### Requirement: A born game may order a kind's hide by a formula

With a hidden kind's `by`, its clues SHALL take the places the shuffle gave
that kind in the order of the stated formula of `at`, the higher first,
those alike in a random order; the kinds stay mixed as the shuffle put them.

#### Scenario: Larger givens go first

- **WHEN** `ordering` boards are dealt at Normal, its givens ranked by
  their numbers (`hide: { given: { by: "clue(given, at)" }, greater }`)
- **THEN** the givens they keep are smaller than the same deals hiding at
  random keep

### Requirement: A born game's run code may write a clue after a letter

A run-letter stream's code MAY name a kind whose digit follows it, written
straight after the code for a clue of that kind on its cell, absent where
it has none, and the reading SHALL refuse a digit past the kind's largest.

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

A run-letter stream's code MAY be a number, past the segment's own kind's
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

A kind `deal.never` names whole SHALL never be dealt, and SHALL be read from
an ID that holds it; values it names of a kind at cells SHALL never be
derived, and SHALL be read from an ID. A `dots` segment with `before` SHALL
be read only after that text, and SHALL write nothing where no cell holds
its kind.

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

A value named by `play.covers` SHALL hide its cell's number, and its
preference SHALL show it smaller; a press in the half tile round the grid
SHALL flip the preference and make no move. `play.wrap` SHALL carry the
cursor over the grid's edge.

#### Scenario: A press off Singles' grid

- **WHEN** the player presses outside the grid with the preference off
- **THEN** it is on, and `interpretMove` returns `UI_UPDATE`

### Requirement: A born game's params may give a tally of pieces

A `tally` setting SHALL name a clue at the board of two fields, a length
and its count, that the params give: a size by its letter after the grid's
and the counts after a comma at the end, one of the longest and one more of
each shorter by default. Params SHALL be refused where the size is not
smaller than a side, no piece is counted, or the pieces cannot be laid.

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

A hidden kind's `when` SHALL name a flag setting, written after the tier by
its letter, under which alone the deal hides the kind, in one random order
with the others, and refuses a board that hides none of it.

#### Scenario: Remove numbers

- **WHEN** a Boats board is dealt with Remove numbers on
- **THEN** at least one row's or column's number is hidden, and no given
  square is a segment of unknown shape

### Requirement: A born game's ID may close and hide numbers and name values by letters

`numbers` SHALL write `hidden`'s character for a clue not shown and, where
`closed`, a comma after each. A run-letter stream SHALL write a cell kind's
values by codes, runs of empty cells `a` to `z` between them, and with
`lastRun: false` the last run dropped but for its whole runs of 26.

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

### Requirement: A born game deals no slower than the game it replaced

A fill game born from its description SHALL deal each board of its menu, as the app runs it, in no more than 100 ms of CPU time on average, unless the hand-written game it replaced took more on the same params; and then in no more than the hand-written game took, beyond the spread of repeated runs. A born deal slower than the hand-written one but under 100 ms is allowed, and the change that leaves it so SHALL record where its cost lies.

#### Scenario: A born deal against the hand-written one

- **WHEN** a born game's menu boards are dealt from a bundle of its tree and from one of the commit before it was born, alternately, the same number of times
- **THEN** each born board's mean is under 100 ms, or no more than the hand-written mean beyond the spread of the rounds

### Requirement: A hide takes clues away in the cheapest order first

At each tier a hide SHALL first take away the clues no firing's bindings read, then all but the shortest run of a random order of the rest that the board still finishes with, then the others one at a time in a random order. With `deal.thorough` off, none SHALL be taken at the first tier and no shortest run, and at most the board's shorter side at the asked tier.

#### Scenario: A thorough hide keeps no clue it can do without

- **WHEN** a board is dealt with `deal.thorough` on and any one of its shown clues is taken away
- **THEN** the board no longer finishes at its tier

### Requirement: A born game's drag makes what its first square became

A drag with either button SHALL give every square it passes that held what the pressed square held what the pressed square became, and SHALL leave a fixed square as it was. Where the description's `play` names the drag `straight`, the drag SHALL keep to the row or column it starts along; otherwise it SHALL follow the pointer. Where `play.sweepWith` names one button, the other's drag SHALL act where it began alone. The whole drag SHALL be one move, made on its release.

#### Scenario: A straight left drag along a row

- **WHEN** in a game whose drag is straight, the player presses the left button on an open square, which the press fills, and drags along its row over two open squares and one ruled out
- **THEN** the two open squares are filled as the first was, and the ruled-out one is kept

#### Scenario: A pointer that wanders off the line

- **WHEN** a straight drag's pointer moves one square off the row it started along
- **THEN** the drag stays on that row, at the column nearest the pointer

### Requirement: A born game's values may be drawn raised

With `play.numbers.raised`, each value SHALL be drawn as a block as tall as
it, its numeral on a top up and right of its square, repainted with the
squares and margins it reaches into, and a press on its top SHALL be its
square's. The appearance preference SHALL draw the values flat.

#### Scenario: A tower over the square above

- **WHEN** the player presses inside a square, on the top of the raised
  value below it
- **THEN** the square below is selected, and in 2D the square pressed

#### Scenario: A tower taken away

- **WHEN** a raised value is cleared
- **THEN** the squares up, right and up-right of it are drawn again, and a
  clue above the top row or a square right of it too

### Requirement: A born game may hide a kind only from a tier up

A hidden kind's `from` MAY name a tier: a board below that tier SHALL show
every clue of the kind.

#### Scenario: Every sum at Easy

- **WHEN** a `flanking` board is dealt at Easy, its sums hidden from Normal
- **THEN** it shows the sum at every slot

### Requirement: A born game may hide a kind whole on a small board below a tier

A hidden kind's `whole` MAY name a tier other than the lowest, a variation,
and size bounds in `play.bounds`' measures: a board below that tier, with
that variation on and within those bounds, each where named, SHALL show no
clue of the kind, its answer drawn again until the board finishes without
them. Elsewhere the kind SHALL be hidden as without it. The compiler SHALL
refuse a tier the game lacks or its lowest, a variation it lacks, and a
measure it does not know.

#### Scenario: Towers' small Easy boards

- **WHEN** a Towers board of 4×4 or 5×5 is dealt at Easy
- **THEN** no square holds a given
- **AND** a 6×6 Easy board may keep some

### Requirement: A born game's hint may call its values by a noun of its own

`words.value` MAY name what a value is called; the hint SHALL say it where
it says `{valueNoun}`, and the candidate walk's own sentences SHALL use it in
place of "number".

#### Scenario: A height

- **WHEN** a Towers hint places a value as the only one left in its cell
- **THEN** its sentence calls the value a height

### Requirement: A technique's id is no name the module exports

The compiler SHALL refuse a description one of whose technique ids is a name
the compiled module exports for itself, such as `bounds`, `deal` or `tiers`,
since the technique is compiled to a function of that name beside them.

#### Scenario: A technique named bounds

- **WHEN** a description whose `play` has `bounds` names a technique `bounds`
- **THEN** it is refused, saying to rename the technique

### Requirement: A slot beside the board keeps the grid's frame

A slot right of the board or below it SHALL draw its piece of the grid's
frame again after it is cleared, so the frame stays whole through every
repaint of the slot.

#### Scenario: A clue right of the board

- **WHEN** a board with clues right of it and below it is drawn, and a slot
  beside it is repainted for a hint's stripes or a done mark
- **THEN** the frame's line runs unbroken along the board's right and bottom
  edges

### Requirement: A born game's default board is dealt at the first tier its menu offers it

A born game's default params SHALL be its default board at the first tier
its menu offers that board, the lowest tier where the menu does not say,
unless its description names a tier the menu offers it at
(`play.defaultTier`).

#### Scenario: A board the menu starts above Easy

- **WHEN** a born game's default board is offered from Normal up
- **THEN** its default params are that board at Normal

#### Scenario: A default tier named

- **WHEN** a born game offers its default board from Easy and names Normal
  as its default tier
- **THEN** its default params are that board at Normal

### Requirement: A born game's cells may take candidate notes

A born game whose description's `marks:` declares candidate notes SHALL
carry them on its board, beside each cell's value: the player sets and
strikes a note on a cell, marks every cell's candidates at once, and a
placement may strike its value from the notes of every cell it rules out.
The ladder that grades and solves SHALL read the values alone. A game whose
description declares no notes SHALL play as before.

#### Scenario: A note is kept beside an empty cell

- **WHEN** a player of a born game with notes notes two values on an empty
  cell and then places a value on another cell that rules out neither
- **THEN** the first cell still holds both notes and no value

#### Scenario: A game without notes is unchanged

- **WHEN** a born game whose description gives no notes is played
- **THEN** no note can be set on its cells, and its keypad and its hint are
  those it had before this change

### Requirement: A born game with notes hints through the candidate walk

A born game with notes SHALL be hinted by the shared candidate walk, built
from its compiled module: the regions a value is unique in from the rules
that hold a unit or a part distinct, each ladder technique a rung, and each
step worded by the description's wording for its firing. The game SHALL
write no hint code.

#### Scenario: A note struck by the hint is struck on the board

- **WHEN** a born game with notes is hinted on a board whose notes the
  mistake check vouches for, and the step rules out a value from a cell
- **THEN** the step strikes that value's note from the cell, and the cell
  keeps its other notes

#### Scenario: A technique that places without reading notes leads

- **WHEN** a technique of the description's own places, strikes nothing and
  reads no note, and a board with no notes supports it
- **THEN** the hint's first step is its placement, before the notes are set
  up, under either reading; and a firing placing several cells is one
  journey, its later legs saying how they add to the first

#### Scenario: A step named by the arm that held

- **WHEN** a technique's steps are split by arms named for its rungs, and
  its steps say `shown: value`
- **THEN** each step strikes one value, and is recorded under the rung its
  arm names, which Check & save names a move by

#### Scenario: A board in areas is walked in its areas

- **WHEN** a born game with notes has no units, and a rule holds each part
  of a dealt partition distinct, and a value has one place left in a part
- **THEN** the hint places it there, naming the part by the partition's name
  and striping it, and a placed value's cull, auto-pencil and Mark-all's
  clean strike it from what the description's techniques run on placing
  strike, in the words the description states for that reach

#### Scenario: A board in areas whose walk is unworded is refused

- **WHEN** a born game with notes reads its values' places in a partition's
  parts, and its description words not every one of the walk's `clean`,
  `note`, `cull` and `regionsFull`
- **THEN** the description does not compile

### Requirement: A born game's values may be a number line

A born game MAY declare its values a number line, and the board SHALL then
draw each value as its numeral, going on as letters past 9, draw a blank
cell's notes in a grid within it, and offer one key a value of the domain.

#### Scenario: A value past 9 is a letter

- **WHEN** a born game's values run to 12 and a cell holds 10
- **THEN** the cell shows `a`, and the keypad offers the keys 1 to 9 and
  `a` to `c`

### Requirement: A born game's clue may sit at an edge, a slot or a part

A born game's clue kind MAY sit at an edge between two cells, at a slot at
either end of a line, at a corner where cells meet, or at a part of a
dealt partition, besides a cell and a line; the board SHALL draw it there,
its ID SHALL write it, and its hint SHALL mark it there.

#### Scenario: A sign between two cells

- **WHEN** a born game deals a clue kind at an edge
- **THEN** the board draws it in the gap between the edge's two cells, and
  a broken one is drawn as broken

#### Scenario: A clue beyond each end of a line

- **WHEN** a born game deals a clue kind at slots
- **THEN** the board keeps a margin a tile wide round the grid, draws each
  clue in the margin square beyond its line's end, at both ends of every
  line, red where it breaks and hatched where a hint step stripes its line,
  prints the clues in a rim round the text format's grid, and a hint step
  that reasons from one outlines it in its margin square

#### Scenario: Clues at slots in a game ID

- **WHEN** a born game's ID writes its slots' clues between slashes and its
  givens after a comma (upstream Towers')
- **THEN** the ID is read and written back byte for byte, and the comma and
  the givens are written only where a square is given

#### Scenario: A clue where four cells meet

- **WHEN** a born game deals a clue kind at corners
- **THEN** the board draws each clue on a disc where the corner's four cells
  meet, its number and its sign (a word a value where the sign is a list,
  the sign alone for a kind of one value), over the hint's marks on those
  cells, red where it breaks, and prints each after the wall line of the
  text format its corner lies on

#### Scenario: Clues at corners in a game ID

- **WHEN** a born game's ID writes a code a corner, a kind's code and its
  number or a code that is a kind and a value whole, between runs of corners
  without one (upstream Mathrax's)
- **THEN** the ID is read with the longest code that matches first, and
  written back byte for byte

### Requirement: A born game may deal one kind of clue an element, of the kinds switched on

`deal.oneKind` with `pick: first` SHALL keep, at each element, the clue
of the first of its kinds the answer makes there, and no other. A `set` setting SHALL give each of its members a check box
in Custom and a letter after the tier in a full ID, written only where some
member is off and read in the letters' order; a board SHALL deal no clue of
a kind switched off, a board with none on SHALL be refused, and a board's
name SHALL say the shorter of the kinds on and the kinds off.

#### Scenario: A parity where a sum holds

- **WHEN** the answer's four squares round a corner are all odd and their
  pairs are the same, and the precedence puts the same before parity
- **THEN** the corner is dealt the same, and not a parity

#### Scenario: Kinds switched off

- **WHEN** a board is read from `5dnAO`
- **THEN** it deals sums and parities alone, its name says "only sum/parity"
  where it says the kinds, and it is written back as `5dnAO`, and as `5dn`
  with every kind on

### Requirement: A born game's clue at every edge may be 0 or 1

A born game's complete clue kind valued 0 or 1 at every edge (a bar) SHALL
be dealt at every edge and never hidden, drawn where it is 1 and not where
it is 0, and written in a record a cell from both ends of each edge whose
clue is 1, an edge written from one end alone refused. Where a 0 breaks its
meaning, the board SHALL draw its outline as broken. A press SHALL mark done
only a clue that is drawn.

#### Scenario: A bar written from one of its cells alone

- **WHEN** a desc flags a bar from one of its two cells
- **THEN** the desc is refused as contradictory

#### Scenario: A missing bar breaks

- **WHEN** two neighbors no bar joins hold numbers one apart
- **THEN** the bar's outline is drawn as broken in their gap

### Requirement: A born game reads a letter older IDs write and writes none

A born game's description MAY name bare letters older game IDs write after
the size or after the tier; such a letter SHALL be read, change nothing, and
never be written.

#### Scenario: Upstream's Adjacent letter

- **WHEN** Adjacent's params `5adk` are read
- **THEN** they are those of `5dk`, written without the `a`

### Requirement: A born game's givens are its description's `given:`

A born game whose description says `given: [value]` SHALL deal a clue kind
`given` at a cell, any value of the answer's domain, meaning the cell holds
it: first among its kinds, so a hide takes givens first, and dealt holding
its value, fixed. A description that states the kind or `play.dealt` itself
SHALL keep its own.

#### Scenario: A given is fixed

- **WHEN** a born game with `given: [value]` deals a board
- **THEN** each cell its ID gives holds that value and no input changes it

### Requirement: A born game's sample may be a Latin square

`deal.sample: { latin: true }` SHALL draw a Latin square on the square
board, its values 1 to the board's side, as upstream's `latin_generate`
draws one.

#### Scenario: Every line holds each value once

- **WHEN** a born game whose sample is a Latin square deals a 6×6 board
- **THEN** its answer holds each of 1 to 6 once in every row and column

### Requirement: A born game's answer may be searched under a partition dealt first

`deal.divide` with `sizes` SHALL deal a partition before the answer, one
part at a time grown to a size drawn from a list (one list a ruleset, with
`by`), and `deal.sample: { search: true }` SHALL find the answer under it
by the search over the ladder, a cell's values tried in a random order, a
draw whose search runs out of budget divided again. Where a cell's domain is
its part's numbers, the keypad SHALL run to the largest size drawn, and a
cell SHALL take no number past its part's size.

#### Scenario: Areas of drawn sizes, each holding 1 to its size

- **WHEN** a born game whose areas are divided to sizes drawn from 2, 3 and
  4 deals a 6×7 board
- **THEN** no area is larger than 4, the board has one answer, and each
  area holds 1 to its size once

#### Scenario: A ruleset written as its bare letter

- **WHEN** a born game's ruleset setting names `letters: ["", T]` and a
  board of the second ruleset is written
- **THEN** its params are `6x6T`, the first ruleset's `6x6`, each read back
  to its ruleset, and the Custom dialog offers both as its game mode

#### Scenario: A number past the cell's area is not typed

- **WHEN** a player selects a cell of an area of three and types 4
- **THEN** nothing is entered, and the keypad offers 1 to 4

### Requirement: A born game's values may be typed into a selected cell

A born game whose values are a number line (`play.numbers`) SHALL be played
by selecting a cell with a press or the arrow keys, as every game whose
player types numbers is, and typing a value's key into it, Backspace
emptying it; a given SHALL not be selected. Each value SHALL be drawn as its
numeral, a given's in ink and the player's in the entry color, and the
selected cell washed.

#### Scenario: A number typed into a selected cell

- **WHEN** a player presses an open cell of such a board and types 3
- **THEN** the cell holds 3, drawn in the entry color, and a press on a
  given selects nothing

### Requirement: A born game's clue may be marked done

A born game MAY name clue kinds the player marks done. A press on such a
clue, with either button, SHALL mark it done and a second SHALL unmark it; a
drag on from it SHALL do the same to each clue it passes that looked the
same; and Shift or Ctrl with an arrow SHALL mark the clue between the
selected cell and its neighbor that way. A clue marked done SHALL be drawn
gray, and red where it breaks a rule. The mark SHALL change no value or
note.

#### Scenario: A sign grayed and restored

- **WHEN** a player presses a sign between two cells, then presses it again
- **THEN** the sign is drawn gray after the first press and in ink after the
  second, and no cell has changed

#### Scenario: A clue beyond a line's end marked from the keyboard

- **WHEN** the board's clues sit at slots, and the player presses Shift or
  Ctrl with an arrow
- **THEN** the clue at that end of the selected cell's row or column is
  marked done

### Requirement: A born game's menu may offer a board with a deal's setting on

A variant board in a born game's preset menu MAY turn on a setting of its
deal (the setting that deals some kinds alone, or the one that hides a
kind), named by its Custom field, as it may a variation of the rules; the
board SHALL then be dealt with that setting on.

#### Scenario: Keen's multiplication-only board

- **WHEN** Keen's preset menu is listed
- **THEN** after its grid it offers "6x6 Normal, multiplication only"

### Requirement: A born game's clue at a part is printed in its text format

A born game's text format SHALL print each clue at a part of a dealt
partition after the row of the part's first cell, its value and its sign,
in the order of those cells.

#### Scenario: A cage's clue as text

- **WHEN** a board whose cages each carry a clue is copied as text
- **THEN** each row of cells is followed by the clues of the cages that start
  in it

### Requirement: A clue's value is any its domain holds

A born game SHALL deal, read and judge a clue's value anywhere in the range
its description gives it, however large: `x in range(lo, hi)` compares `x`
with the range's ends.

#### Scenario: A product past 31

- **WHEN** a multiplication-only board of `caging` is dealt at 5×5
- **THEN** some cage may carry a product above 31

### Requirement: A selected cell stands apart from a region fill

On a board of typed numbers whose parts take the region fills, the selected
cell's wash SHALL stand apart from every fill and from the grid line in both
schemes, so the cursor shows in a cage of any color.

#### Scenario: The cursor in a yellow cage in the dark scheme

- **WHEN** the player selects a cell of a yellow cage in the dark scheme
- **THEN** the cell is drawn in a wash the yellow fill and the grid line
  around it can be told from

### Requirement: A concept of the fill board is one module

Each concept the fill board offers a description (a clue location, a
painter layer, an ID segment kind, a deal step) SHALL be implemented in a
module of its own that registers with the code that runs it, so that adding
a concept adds a module and does not add a branch to a shared function.

#### Scenario: A new ID segment kind

- **WHEN** a description needs an ID segment kind the engine does not have
- **THEN** it is added as one new module, its line in the engine's registry
  and the compiler's check keyed beside it, which the typecheck demands, and
  no existing segment kind's module changes

### Requirement: A setting the params give is stated one way

A description SHALL state every setting its params give (a flag, a number or a choice, with its letter, its Custom field and what it gates) through one settings concept, and the description language SHALL NOT offer a second key for a setting of the same kind.

#### Scenario: A variation and a deal option

- **WHEN** one description has a modifier that adds a rule and an option that changes only the deal
- **THEN** both are stated as settings, differing in what they gate

### Requirement: A game ID is read and written by one codec

The params and description of a born game SHALL be encoded and decoded by one codec whose segment kinds are named for what they encode, and a byte layout upstream's IDs need SHALL be a property of a segment kind, never a segment kind of its own.

#### Scenario: An upstream ID with a quirk

- **WHEN** an upstream game ID with a layout only one game uses is loaded
- **THEN** it reads through a segment kind other games also use, with the quirk stated as that kind's property

### Requirement: Two spellings of one rule compile to one analysis

The description compiler SHALL analyze a rule by its structure, so that a rule written with a named set and the same rule written inline yield the same checks, bounds and refusals.

#### Scenario: A named set and its inline form

- **WHEN** two descriptions differ only in whether a rule's set is named or written inline
- **THEN** their rule-violation checks report the same violations on every partial board

### Requirement: A rule that cannot hold is refused, never a hang

A fill deal whose rules have refused a hundred answers in a row, none having held, SHALL be refused with a message naming the rule that broke most often, and SHALL NOT draw on to its retry bound.

#### Scenario: A rule false everywhere

- **WHEN** a description states a rule no board satisfies
- **THEN** dealing it fails, once the rules have refused a hundred answers, with a message naming the rule

### Requirement: A hidden clue kind is read by a technique

The description compiler SHALL refuse a fill description whose deal hides a clue kind that no technique reads, by `clue(kind, …)` or `clues(kind)` in itself or a definition it names, and that the answer's domain does not read, unless the kind means the answer's value at its cell (a given). The deal SHALL count a clue read where a firing binds the element it sits at, an element of the kind's own sort, or names it by its index in its kind.

#### Scenario: A kind only a removed technique read

- **WHEN** a description's deal hides a kind whose only reader is a technique the description no longer states
- **THEN** the compiler refuses it, naming the kind

#### Scenario: A corner's clue read through a corner binding

- **WHEN** a firing binds a cell and a corner, and reads the clue at the corner
- **THEN** the deal counts the corner's clue read, and no clue at the corner whose index is the cell's

### Requirement: The description's shape has one source

The shape of a game's description SHALL be stated once, in `description.schema.json`, and the TypeScript the compiler reads a description as SHALL be generated from it by every command that reads it, never committed, so that code reading a field the schema lacks fails the typecheck.

#### Scenario: Code reads a field the schema lacks

- **WHEN** the compiler reads a description field that the schema does not state
- **THEN** the typecheck fails, naming the field

#### Scenario: The schema changes

- **WHEN** a field's statement in the schema changes
- **THEN** the next command that reads a description regenerates the types, with no step to remember

### Requirement: A fill board's answer lives in slots of a sort

A described fill game SHALL state the sort its answer lives in (the cells or the edges), and the board, the deal, the codec, the drawing, the input and the hint SHALL read the answer through that sort, so that a game whose answer is on the edges, or is a partition of the cells stated as walls on the edges, is described without a second engine.

#### Scenario: A game whose answer is on edges

- **WHEN** a description states an answer on edges
- **THEN** it is dealt, drawn, played and hinted by the fill engine, as a cell game is
