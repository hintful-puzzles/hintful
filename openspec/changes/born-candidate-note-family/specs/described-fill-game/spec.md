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

#### Scenario: The candidate-note family is its descriptions

- **WHEN** the catalog and the registry are read
- **THEN** Unequal and Adjacent are in all of them, and neither directory
  holds a TypeScript file

### Requirement: A born game may hide several kinds of clue

`deal.hide` MAY name several kinds, whose clues SHALL be hidden in one random
order across them, each kept hidden while the ladder finishes the board.
With `deal.hideFirst`, every clue of the kinds it names SHALL instead be
tried at each tier before any clue of the rest, each side in a random
order. `deal.stripFrom: everyClue` SHALL start every draw of a search tier from
every clue, not from a board hidden at the lowest tier that finishes it.

#### Scenario: Sticks hides lengths and block numbers together

- **WHEN** a Sticks board is dealt at Easy
- **THEN** both its line numbers and its block numbers are among those hidden

#### Scenario: Squares go before sums

- **WHEN** a `flanking` board is dealt at Normal, its givens hidden
  first (`hideFirst: [given]`)
- **THEN** it shows fewer givens and more sums than the same deal in one
  random order

#### Scenario: Squares go first at the lowest tier too

- **WHEN** a `flanking` board is dealt at Easy hiding its sums too, its
  givens hidden first
- **THEN** it shows fewer givens than sums, where the givens alone would
  finish it

## ADDED Requirements

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

`deal.hideFrom` MAY name a tier for a kind of `hide`: a board below that
tier SHALL show every clue of the kind.

#### Scenario: Every sum at Easy

- **WHEN** a `flanking` board is dealt at Easy, its sums hidden from Normal
- **THEN** it shows the sum at every slot

### Requirement: A born game may hide a kind whole on a small board below a tier

`deal.hideWhole` MAY name, for a kind of `hide`, a tier other than the
lowest and size bounds in `play.bounds`' measures: a board below that tier
and within those bounds SHALL show no clue of the kind, its answer drawn
again until the board finishes without them. Elsewhere the kind SHALL be
hidden as without the setting. The compiler SHALL refuse a kind the deal does
not hide, a tier the game lacks or its lowest, and a measure it does not
know.

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

A born game's `deal.firstKind` SHALL keep, at each element, the clue of the
first of its kinds the answer makes there, and no other of them. A born
game's `deal.kindLetters` SHALL give each of its kinds a check box in
Custom and a letter after the tier in a full ID, written only where some
kind is off and read in the letters' order; a board SHALL deal no clue of a
kind switched off, a board with none on SHALL be refused, and a board's
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
