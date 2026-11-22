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
