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
by a search over the ladder's easiest tier, a cell's values tried in a
random order, a draw whose search runs out divided again. Where a
cell's domain is its part's numbers, the keypad SHALL run to the largest
size drawn, and a cell SHALL take no number past its part's size.

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

### Requirement: The candidate-note family is played from its descriptions

Solo, Salad, Group, ABCD, Undead, Magnets, Rome, Crossing and Map SHALL each
be dealt, drawn, played and hinted from its description on the fill board,
its directory under `src/games/` holding no TypeScript but tests, unless the
gap list sends a game to a later group of the route that builds what it
needs, naming the group.

#### Scenario: A moved game is its description

- **WHEN** a game of the nine has flipped
- **THEN** its directory holds its description and its `cases.yaml`, and no
  hand-written TypeScript

### Requirement: A born game with notes is walked over every unit it has

The candidate walk of a born game with notes SHALL read a value's places in
every unit of the board's space, rows, columns, diagonals and the blocks of
the partition among its units, beside the parts of each dealt partition a
rule holds distinct. A unit a modifier adds SHALL be a unit only of a board
the modifier is on. A partition among the units stated as `blocks(a, b)`
SHALL be cut by the engine from the board's sizes; a partition stated by
any other formula SHALL be refused.

#### Scenario: A single in a block or a diagonal

- **WHEN** a value has one place left in a block, or in a diagonal of a
  board with the diagonals' modifier on, and in no unit listed before it
- **THEN** the hint places it there, naming the block by its partition's
  name or the diagonal as a diagonal, and striping it whole

#### Scenario: A placed value's reach follows the modifier

- **WHEN** a value is placed with auto-pencil on, on a board in blocks with
  areas a rule holds distinct
- **THEN** it is struck from the notes of its row, column, block and area,
  and of its diagonal only where the diagonals' modifier is on; and the
  walk's words for that reach are the description's, chosen by the
  modifier as a flag by its name

#### Scenario: A board with no unit

- **WHEN** a born board with notes has no unit and no partition a rule
  holds distinct, and its description words the walk's steps
- **THEN** the walk strikes a placed value from the notes its placing
  techniques strike it from, finds no hidden single, and finishes a board
  the ladder finishes
- **AND** its hint lists no hidden-single rung, which no step could take

#### Scenario: A partition by another formula is refused

- **WHEN** a description states a partition by a formula other than
  `blocks(a, b)` with each side a number or a size, or states one by
  formula that is not among its units
- **THEN** the description does not compile

### Requirement: A born game is graded on each of its scales

A born game whose description names scales besides its tiers SHALL run its
ladder, for a deal, a solve, a hint and a search alike, capped at the
board's tier and at the top of each other scale. Its deal SHALL keep only a
board that needs the asked tier and, on each other scale its ladder has an
entry of, the top of that scale: the scale's tier under its top, with the
asked tier, does not finish it. A board of a search tier SHALL be held on
the tiers alone.

#### Scenario: A board needs the top of the other scale

- **WHEN** a board of a game with a second scale is dealt at any tier but
  the search's
- **THEN** its ladder finishes it at the asked tier with the other scale at
  its top, and does not with the other scale a tier under its top

#### Scenario: A hint reads the other scale

- **WHEN** a hint is asked on such a board
- **THEN** the walk may take a technique of the other scale up to its top,
  and hints the board to the end

### Requirement: A born game's blocks may be dealt in equal parts

A born game's partition among its units MAY be dealt, the board's space
then taking its blocks from the board's clues. `deal.divide` with `equal`
SHALL tile the board with connected parts of that many cells, and a desc
whose parts of that partition are not all of that size SHALL be refused.
`deal.divide` MAY list several partitions, divided in turn, and the answer
SHALL be searched under them all.

#### Scenario: Jigsaw blocks and cages

- **WHEN** a born game whose blocks are divided into parts of the board's
  width and whose cages are divided after them deals a 5×5 board
- **THEN** five connected blocks of five tile it, every row, column and
  block holds 1 to 5 once, and no cage repeats a number

#### Scenario: Blocks walled, cages inset, diagonals stroked

- **WHEN** such a board is drawn, with the diagonals' modifier on
- **THEN** its blocks are drawn as walls, its cages as dashed outlines
  inset inside the squares with each cage's sum at its first square clear
  of the dashes, and each diagonal as a line corner to corner

#### Scenario: Blocks of unequal size are refused

- **WHEN** a desc of such a game writes a 4×4 board's blocks as one of
  eight cells and two of four
- **THEN** the desc is refused as malformed

### Requirement: A born game's clues may keep a symmetry the player chooses

A born game's deal MAY hide a clue kind at cells keeping a symmetry, one
named by what it keeps or the one a deal option's choice names. A clue
SHALL be hidden with the clues of its orbit still shown, and one a square of
whose orbit holds none SHALL not be shown.

#### Scenario: Givens closed under the chosen symmetry

- **WHEN** a board is dealt with any of Solo's eight symmetries chosen
- **THEN** every square the symmetry takes a given's square to holds a
  given

### Requirement: A deal option may be written by its choices' codes

A deal option with no letter SHALL write its choice's code in a full game
ID, after the modifiers' letters, and nothing for its default; reading an
ID, the default's code or none SHALL give the default.

#### Scenario: Upstream solo.c's symmetry suffix

- **WHEN** a board with the diagonals' modifier and 4-way mirror symmetry is
  written as a full game ID
- **THEN** the ID ends `xm4` and its tier, and `r2` or no suffix reads as the
  default 2-way rotation

### Requirement: A born game may be sized by its blocks

A born game whose blocks are `blocks(a, b)` of two sizes, the grid `a * b`
on a side, MAY be sized by them (`play.blocks`). Its params SHALL give the
blocks across and down, written as upstream solo.c writes them, `{b}x{a}`,
or `{b}` and a letter where the blocks are one square wide, and a bare
number SHALL read as that many both ways. The variation that deals the
blocks SHALL be on exactly where they are one square wide; only there SHALL
the board deal them, and its desc write them.

#### Scenario: Jigsaw read as upstream writes it

- **WHEN** the params `5j` or `2x3` are read
- **THEN** the first is a 5×5 board that deals its blocks, the second a 6×6
  board of blocks 3 wide and 2 tall that deals none and writes none in its
  desc

### Requirement: The Custom dialog of a board sized by its blocks

The Custom dialog of a board sized by its blocks SHALL offer the blocks
across and down, and after them the game mode, which folds the blocks into
dealt ones and back to the squarest blocks of the order.

#### Scenario: The game mode folds the blocks

- **WHEN** the Custom dialog's game mode is set to the dealt blocks on a
  `2x3` board, and back
- **THEN** the board is a 6×6 dealing its blocks, then `2x3` again, with any
  modifier left as it was

### Requirement: A partition a modifier adds is the board's only under it

A partition a variation adds to a born game's space, and the clues at its
parts, SHALL be divided, derived, written in the desc, read from it and
drawn only on a board with the variation on. A clue kind at parts SHALL be
read at the parts of the partition it names, whichever the board deals
first. A technique the variation adds SHALL be a rung of the hint only on a
board with it on.

#### Scenario: Killer's cages

- **WHEN** a board of a game whose Killer modifier adds cages and their
  totals is dealt with Killer off, and with it on
- **THEN** the first deals, writes and draws no cage and no total, and the
  second deals both, each total its cage's sum in the answer

#### Scenario: A hint on a board without Killer

- **WHEN** a hint is asked, or the board drawn, on a Solo board with Killer
  off
- **THEN** it reads no cage technique and draws no cage, and neither fails

### Requirement: A born board's rules and text read its own space

The live errors and the answer check of a born game SHALL read the board's
own space: the units its variations have, and its blocks, cut by its sizes or
dealt. Its text format SHALL wall the partition the board draws as walls,
the blocks where it has them, and print a part's clues after the row of the
part's first cell.

#### Scenario: A repeat in a block, and one on a diagonal without X

- **WHEN** two equal numbers stand in one block of a Solo board, in neither
  one row nor one column, and on another board two stand on a long diagonal
  with X off
- **THEN** the first breaks the Latin rule and the second breaks nothing

#### Scenario: A Killer board's text

- **WHEN** a 2x2 Killer board is printed as text
- **THEN** its walls are the blocks', and each row is followed by the totals
  of the cages that start in it

### Requirement: A stated wording names a unit by the board's unit

A born game's stated wording SHALL say `{unit}` as the board's unit holding
the cells it refers to: row, column, the blocks' partition by its name, or
diagonal.

#### Scenario: A block single

- **WHEN** Solo's hint places a number with one place left in a block
- **THEN** it says "No other cell in this block can be" the number

### Requirement: A part's clue may be written as upstream Solo writes it

A born game's `digits` segment of a clue kind at parts SHALL write each
part's clue at the part's first cell in reading order, and SHALL read it at
any cell of the part, refusing a desc that gives a part none or two. A
`blocks` segment with `counts: false` SHALL write a letter's repeats out,
never as a count, and either form SHALL be read.

#### Scenario: A Killer board's sums

- **WHEN** a Killer board's desc is written and read back, and then read
  with each cage's sum at its last cell, and with a cage given two
- **THEN** the first reads back byte for byte, the second reads the same
  totals, and the third is refused

### Requirement: A modifier may hide a kind whole and bound the board

A born game's `deal.hideWhole` MAY name a variation, `with:`, under which
the deal hides every clue of the kind, drawing the answer again until the
board finishes without it. A modifier MAY state `bounds` on the board's
size, as `play.bounds` states them, which a board with it on SHALL keep. A
clue at a part with no sign in `play.signs` SHALL be drawn as its number.

#### Scenario: Killer shows no given

- **WHEN** a board is dealt with Killer on, whose `hideWhole` names it
- **THEN** it shows no given number, its cages' totals drawn as plain
  numbers, and a board past Killer's bounds is refused with Killer's name

### Requirement: A born game's size may be a number

A size beyond the grid's MAY be a number setting (`kind: number, gives:
size`), which SHALL be written in a brief ID as its letter and the number,
read as its default where absent, and refused outside its range.

#### Scenario: The number of values

- **WHEN** the `counting` fixture's params `4x5k4`, `4x5` and `4x4k5` are
  read
- **THEN** the first writes back as it was, the second has 3 values, and
  the third is refused, saying the range

### Requirement: A born game may deal a clue one a value

A born game whose deal samples an answer SHALL derive a clue kind `per:
value` at each element for each value of the answer's domain, and its
`numbers` segment SHALL write and read each element's values in turn; no
other segment writes one. An answer built by the ladder with nothing laid
first SHALL be built on no clue.

#### Scenario: A line's count of each value

- **WHEN** the `counting` fixture deals a board of `k` values, and its desc
  is read back
- **THEN** each row and column holds one clue for each value, the count of
  it the answer holds, written rows then columns, each line's values from 1
  in turn; and a desc with a clue too many or too few is refused

### Requirement: A board of numbers may play its values as letters

A born board of numbers with `play.numbers.letters` SHALL draw each value,
its notes and a hint's word for it as a letter from A, offer a key a
letter, and take a letter of either case, or a digit, as the letter at its
place. A count SHALL still be said in digits.

#### Scenario: Typing B three ways

- **WHEN** a square of a `counting` board of three letters is selected and
  `b`, `B` or `2` is pressed
- **THEN** each enters B, and `d` or `4` enters nothing

### Requirement: A line's clues one a value are drawn in a margin before it

A born board's clue kind at lines `per: value` SHALL be drawn before each
line's start, a tile a value, value 1 furthest out, headed by each value's
glyph. A clue SHALL be red where the rules break it, hatched where a step
stripes its line, and outlined where a step's term names it. The compiler
SHALL refuse such a kind beside a list or labels at lines.

#### Scenario: Reading a count from the margin

- **WHEN** a `counting` board of three letters is drawn, and the walk's
  step that a line already holds all of a letter is shown
- **THEN** each count sits in its letter's tile before its line, A, B and C
  head the tiles, and the count the step reads is outlined, its line
  hatched through the margin

### Requirement: A clue in the margin before a line is marked done and printed

A clue one a value at a line marked done (`play.done`) SHALL be drawn gray.
A press on it SHALL mark it done, and Shift or Ctrl with Left or Up the
cursor's row's or column's clue for the value its square holds. The text
format SHALL print the clues before their lines as the board draws them,
each headed by its value.

#### Scenario: Marking a count done

- **WHEN** a count in the margin is pressed, or Shift-Left is pressed with
  the cursor on a square holding B
- **THEN** the pressed count is drawn gray, and the key marks the cursor's
  row's count of B

### Requirement: A born board's modifier bounds a size and lifts a tier's bound

A number size MAY state a `least` under a variation, refused below it while
the variation is on, naming the variation. A deal flag MAY state
`offBounds`, a tier's size bounds held only while it is off, a full ID past
them refused as having no such tier. `play.cornerCrosses` SHALL draw a
small cross at each corner inside the grid while its variation is on.

#### Scenario: ABCD's bounds on the counting fixture

- **WHEN** `4x4k3D` is read, and a full `2x2k2` ID at Easy with and
  without remove-clues
- **THEN** the first is refused, values must be at least 4 with no
  diagonal touching; the 2x2 is refused as no Easy puzzle with every clue
  showing, and not with clues hidden

### Requirement: A born board's answer may hold a value more than once in a unit

Where the answer declares a value a unit repeats (`answer.value.repeat`),
the ladder's marks and the candidate walk SHALL count it as many times as
the description says a unit holds it. A Latin sample SHALL be folded to the
domain: each value past its top reads as the top. A derived clue's meaning
MAY read a size the params give.

#### Scenario: The emptying fixture

- **WHEN** a `5k3` board is sampled, and its clues derived from the answer
- **THEN** each line holds 1 to 3 once and the empty square twice, each clue
  is a number up to 3, and the ladder never proves the board impossible

### Requirement: A born board's ruleset may choose the clue kinds it is dealt

A choice of a size (a ruleset) MAY name the clue kinds dealt on its boards
alone (`deals`). Such a kind SHALL be derived, hidden, drawn and written in
the ID only on a board of a ruleset naming it; elsewhere it SHALL hold no
clue, an ID segment of such kinds alone SHALL be neither written nor read,
and a stream SHALL read no code of it. A kind no choice names SHALL be
dealt on every board. A ruleset written by a code SHALL be written at its
default too, unless the code is empty.

#### Scenario: The emptying fixture's two rulesets

- **WHEN** a `5k3B` board is dealt, a `4k3` board's params written, and a
  `4k3S` desc read whose squares hold `O`
- **THEN** the first holds balls and no clue at a line's end, and its desc
  writes no slots; the params read `4k3S`; the desc is refused

### Requirement: A born board of numbers may have an empty square

A board of numbers whose answer repeats a value in a unit MAY declare it
the empty square (`play.numbers.empty`). It SHALL be typed by `X`, `-` and
`_`, never by its glyph's key, drawn as the engine's cross, and noted as an
X. The keypad SHALL offer the other values, then `X`, `O` and clear. A
placed empty square SHALL strike itself from its unit's notes only once the
unit holds every copy of it.

#### Scenario: The emptying fixture's empty square

- **WHEN** on a `5k3B` board `X` is typed into an open square, and `4` into
  another
- **THEN** the first holds the empty square drawn as a cross, and the
  second is unchanged

#### Scenario: The empty square's reach

- **WHEN** the empty square is placed with auto-pencil in an empty row of
  five whose units hold it twice, then placed again in the same row
- **THEN** the first placement strikes nothing from the row, and the second
  strikes it from the row's other three squares

### Requirement: A ball is the empty square struck from a square's notes

On a board with an empty square, `O`, `+` and `=` SHALL strike it from an
open square's notes, from every value where the square has none, and SHALL
put it back where it is struck, a square left noted every other value then
holding no notes. A square whose notes lack it, and a square holding the
clue kind `play.numbers.empty` names, SHALL be drawn in a ball, the clue's
in ink and the player's in the entry color; a square noted every other
value SHALL show no notes inside it.

#### Scenario: A ball typed and taken back

- **WHEN** on a `5k3B` board `O` is typed twice into an open square with no
  notes
- **THEN** after the first it is noted 1 to 3 and drawn as a bare ball, and
  after the second it holds no notes and no ball

### Requirement: A born board's ruleset may draw its values as letters

A ruleset of a board of numbers MAY draw its values as letters from A
(`letters` on its choice), every other ruleset's drawing numerals. A board
SHALL draw, offer, print, say and write each value as its ruleset draws
it, its empty square as `X`; a letter key and a digit SHALL each type the
value at its place on every board of the game.

#### Scenario: The emptying fixture's two rulesets drawn

- **WHEN** a `5k3S` board and a `5k3B` board are dealt and drawn, and `A`,
  `a` and `1` typed into an open square of each
- **THEN** the first draws its clues and givens as letters and offers `A`
  to `C`, `X`, `O` and clear; the second draws numerals and offers `1` to
  `3`; each key types 1 on both

### Requirement: A clue at a slot may say a value

A clue kind at a slot whose number is one of the answer's values (`glyph`)
SHALL be drawn and printed as that value's glyph.

#### Scenario: The emptying fixture's clues drawn as letters

- **WHEN** a `5k3S` board is drawn and printed
- **THEN** its clues at the lines' ends are letters, no numeral among them

### Requirement: A born board's ID may write its values as the board draws them

An ID stream MAY write its own kind's number as the board's glyph, one
character (`glyphs`), the kind a given or a clue with `glyph`; a stream at
slots MAY write them in an order of sides of its own (`sides`), and any
stream MAY end in a mark written wherever it is written (`after`). A glyph
SHALL be read only as the board's ruleset draws it, and only up to the
largest value its sizes give.

#### Scenario: Salad's IDs

- **WHEN** an ID upstream Salad's generator writes is read by the draft of
  Salad's description, in either ruleset, from 3x3 to 9x9 and 2 to 9
  symbols
- **THEN** it holds the border clues, balls and givens the hand-written
  game reads, and is written back byte for byte

#### Scenario: The emptying fixture's slots in Salad's order

- **WHEN** the `4k3S` desc `dAk,p` is read
- **THEN** its one clue is at the left of the first row

### Requirement: A born deal's hide may be whole under a ruleset

A hidden kind's `whole` MAY name a ruleset as it names a variation: on a
board of that ruleset within the bounds, the deal SHALL hide every clue of
the kind.

#### Scenario: The emptying fixture's Sight boards below 5x5

- **WHEN** ten `4k3S` boards, ten `5k3S` boards and ten `4k3B` boards are
  dealt
- **THEN** no `4k3S` board shows a given, and some board of each of the
  others does

### Requirement: A born board's number size may be bounded by a side

A number setting MAY be less than a side of the grid (`under`): a board
whose number is not SHALL be refused, saying so.

#### Scenario: The emptying fixture's values

- **WHEN** `4k4` and `5k4` are validated
- **THEN** the first is refused with "Values must be less than the grid
  size." and the second is not

### Requirement: A born board's ruleset may bound a tier on some sizes

A ruleset's choice MAY bound the boards of a tier, as a choice of the deal's
does, on a board whose number sizes are those it names (`sizes`) alone; a
full ID's board outside them SHALL be refused as having no such tier, named
by its size, its ruleset and those sizes.

#### Scenario: The emptying fixture's Normal Balls boards of two values

- **WHEN** `4k2Bdn`, `5k2Bdn`, `4k3Bdn`, `4k2Sdn` and `4k2Bde` are
  validated as full IDs
- **THEN** only the first is refused, with "No 4x4 Balls puzzle with 2
  values is Normal."

### Requirement: A born deal may weaken a clue before it goes

A hidden kind MAY be hidden `after` another at the same places: its clue at
a place SHALL be tried straight after that kind's clue there goes, and kept
while that clue is shown.

#### Scenario: The emptying fixture's balls

- **WHEN** the hide orders a `5k3B` board's clues, and hides from it
- **THEN** every ball comes straight after the number at its square, every
  number left shown keeps its ball, and some ball is left where its number
  went

### Requirement: A born deal may refuse a board a part of its ladder finishes

The deal MAY name techniques of its ladder and a value (`refuse`): a board
on which those techniques alone, with what runs on placing, place every
square of the answer holding that value SHALL be drawn again.

#### Scenario: The emptying fixture's empty squares

- **WHEN** a `5k3B` board shows every number, or is hidden from at its tier
- **THEN** the first is refused, as its empty squares fall with no number
  placed, and a board hidden from is kept

### Requirement: The hint walks a value a unit holds more than once

On a board whose answer repeats a value in a unit, the candidate walk SHALL
count a unit as holding every value where its cells' domains, with the
repeated value's copies, are as many as its cells, so a value with one
square left in a line is a hidden single there. The repeated value SHALL
never be placed as a single, naked or hidden: the description's techniques
place it.

#### Scenario: The emptying fixture's walk

- **WHEN** six `5k3B` boards are dealt and each hint plan is followed
- **THEN** every board is solved, some step is a hidden single, and the
  empty square is placed only by the description's techniques

### Requirement: The cull of a value a unit holds more than once is said as the unit's last

A placement of a value a unit holds more than once SHALL strike it from the
unit's notes only where it is the last copy the unit needs, said in the
words of the description's `steps.last` step, which the compiler requires of
a description whose answer repeats a value. A set whose values include it
SHALL say its cells account for every copy their line still needs.

#### Scenario: The emptying fixture's last empty square

- **WHEN** a `5k3B` board's plan places a line's last empty square while
  another square of the line still notes it
- **THEN** the next step strikes it there, in the `last` step's words

### Requirement: A hint calls a value as the ruleset draws it

Where the description's `words` does not name a value, the hint SHALL call
it a letter on a board whose ruleset draws letters, and a number elsewhere.

#### Scenario: The emptying fixture's two rulesets

- **WHEN** a hint is asked on a `5k3S` board and on a `5k3B` board
- **THEN** the first's opening speaks of every candidate letter, the
  second's of every candidate number

### Requirement: A ball's notes are drawn inside its ring

A square drawn in a ball that holds notes SHALL draw them inside the ball's
ring, clear of its stroke, and a hint's ring round them SHALL go round them
where they are drawn. Squares without a ball keep their notes' size.

#### Scenario: A given ball holding notes

- **WHEN** a Number Ball board's notes are filled in
- **THEN** a square whose clue is a ball shows its notes inside the ring, and
  the other squares' notes are as large as before

### Requirement: A born board's text prints its ball and its ruleset's clues alone

The text format SHALL print an open square holding the clue kind
`play.numbers.empty` names as `O`, and SHALL print no rim for slot clue kinds
the board's ruleset does not deal.

#### Scenario: A Number Ball board

- **WHEN** `5n3Bde:d1cO32b3aXa1d2b` is printed as text
- **THEN** its ball's square reads `O`, its cross `X`, and the grid has no
  rim of border clues

### Requirement: A born game's own strikes are steps as its words speak of them

A firing of a description's own technique that strikes notes SHALL be one
step a value where its steps say `shown: value`; one step a cell where its
words name the step's cell (`{ring}`), the values it strikes (`{struck}`)
or a fact's own terms; and otherwise one step for every cell whose notes are
written, and one for each cell without, as the library's strikes are.

#### Scenario: A technique whose words name neither cell nor value

- **WHEN** a counting board is walked under the reading that pencils every
  candidate in first, and a line holding all of a letter it counts strikes
  that letter
- **THEN** one step strikes it from every open cell of the line that notes it

#### Scenario: Salad's nearest square

- **WHEN** a border clue sees B first and the square nearest it notes A, B
  and C
- **THEN** one step strikes A and C from that square, "so A and C must go"

### Requirement: A born board of numbers may select a shape by a drag

Where the description's `play.select` names a shape, a drag from the square
selected for typing SHALL select the squares of that shape from it to the
square under the pointer, each highlighted as the selected square is. A
value typed SHALL go into every square of the selection as one move, a
given holding it passed over. A press or an arrow SHALL drop the selection.
A board of buttons SHALL refuse a selection.

#### Scenario: A diagonal typed at once

- **WHEN** the player selects a square, drags along a diagonal across a
  given 3 and releases, then types 3
- **THEN** one move places 3 on every open square of the diagonal, and
  Undo takes them all off

#### Scenario: A selection refused or noted

- **WHEN** the selection crosses a given 2 and the player types 3
- **THEN** nothing is placed
- **WHEN** the player types 3 in notes mode
- **THEN** 3 is noted on each square of the selection lacking it, or struck
  from every one where all note it

### Requirement: A born square board of numbers may let the player rule dividers

Where the description's `play.dividers` is set, on a square board of numbers
with line labels, a press in the labels' margin SHALL toggle a divider at
the gap between two labels nearest it, and `|` and `-` the one after the
cursor's column or row. A divider SHALL be drawn as a wall between its two
rows and between the same two columns. It SHALL be a move a save holds,
undone as any, and a restart SHALL take every divider away. A description
setting it elsewhere SHALL be refused.

#### Scenario: A divider ruled and taken away

- **WHEN** the player presses between the labels of lines 2 and 3
- **THEN** a wall is drawn between rows 2 and 3 and between columns 2 and 3
- **WHEN** the player presses there again, or undoes
- **THEN** the wall is gone

#### Scenario: A divider keyed

- **WHEN** the cursor is in column 2 and the player types `|`
- **THEN** the divider after column 2 is toggled, and with it the one after
  row 2

### Requirement: A born square board of numbers may let the player order its lines

Where the description's `play.order` is set, on a square board of numbers
with line labels, a label dragged along its margin SHALL carry its row and
the same column to where it is let go, and Shift with an arrow SHALL move
the cursor's column or row a place. The order SHALL be a move a save holds,
which a restart undoes. A description setting it off such a board, or with
a unit beyond the lines or a clue off the cells, SHALL be refused.

#### Scenario: A line dragged by its label

- **WHEN** the player drags the label of the first column to the third
  place
- **THEN** that column and the same row are drawn third, their labels and
  values with them

#### Scenario: A line moved from the keyboard

- **WHEN** the cursor is in the second column and the player types
  Shift+Right
- **THEN** that column and the same row move to the third place, and the
  cursor is still on them

### Requirement: A born board in an order is drawn and played where its lines are shown

On a board whose lines the player orders, every value, given, note, live
error, mistake and hint mark SHALL be drawn at the place its line is shown,
a square pressed or typed into SHALL be the one drawn there, and a line
being dragged SHALL be shown as selected. Where dividers are on, a press on
the labels SHALL toggle its divider on its release, and only where it never
dragged; a divider whose two lines an order parts SHALL be taken away.

#### Scenario: A broken rule after a reorder

- **WHEN** two squares of a row hold the same number and the lines are
  reversed
- **THEN** both numerals are drawn red in the last row, at the places their
  columns are shown

#### Scenario: A press on the labels that never drags

- **WHEN** the player presses between two labels and lets go there
- **THEN** the divider there is toggled on the release

### Requirement: A born board may label a rule's breach at its squares

Where the description's `breaches` labels a rule, each binding of the
rule's leading `forall`s that a board breaks SHALL be drawn as its labels,
each written small in red above or below the square its formula names, its
numbers as the board writes those values, and its squares SHALL NOT be
drawn in error for it. A square SHALL show the first label of each place.
Where a label reads a square still open, the breach SHALL be drawn at its
squares. A label the compiler cannot place SHALL be refused.

#### Scenario: A failed product labeled

- **WHEN** a group's table holds a·b = c and b·c = a, and c·c reads c while
  a·a reads b
- **THEN** `(ab)c` is written over the c of c·c and `a(bc)` under the b of
  a·a, in red, and no letter is red

#### Scenario: A label refused

- **WHEN** a label names no statement, its formula is no square, or a term
  of its text is no number
- **THEN** the description is refused
