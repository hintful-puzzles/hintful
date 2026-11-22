## MODIFIED Requirements

### Requirement: A fill game is born from its description

A game whose player fills a grid toward one hidden answer MAY be born from its
description: `fillGame` of its compiled module SHALL be the whole game, its
catalog entry, boards and hint legend read from `catalog:` and `play:`, and its
directory SHALL hold no TypeScript but its tests.

#### Scenario: Tents is its description

- **WHEN** the catalog and the registry are read
- **THEN** Tents, Kakurasu and Unruly are in all of them, and no one of
  their directories holds a TypeScript file that is not a test

## ADDED Requirements

### Requirement: A born game may build its answer and hide its clues

Where `deal.sample` is `build`, the answer SHALL be built a random value on a
random undecided cell at a time, each followed by what the whole ladder then
decides. Where `deal.hide` names a clue kind, each of its clues SHALL be taken
away in a random order while the board still finishes at its tier.

#### Scenario: An Unruly board keeps only the givens it needs

- **WHEN** an Unruly board is dealt and any one of its givens is taken away
- **THEN** the board no longer finishes at its tier

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
cells as their pieces in error.

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
