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
- **THEN** Unequal is in all of them, and its directory holds no TypeScript
  file

## ADDED Requirements

### Requirement: A born game's default board is dealt at the first tier its menu offers it

A born game's default params SHALL be its default board at the first tier
its menu offers that board, the lowest tier where the menu does not say.

#### Scenario: A board the menu starts above Easy

- **WHEN** a born game's default board is offered from Normal up
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
