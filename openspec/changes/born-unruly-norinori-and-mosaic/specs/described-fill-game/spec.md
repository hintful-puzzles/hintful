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

## ADDED Requirements

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
