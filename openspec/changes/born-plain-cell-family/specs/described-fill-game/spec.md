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
