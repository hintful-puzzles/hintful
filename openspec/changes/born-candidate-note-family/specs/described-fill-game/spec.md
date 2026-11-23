## ADDED Requirements

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
- **THEN** the cell shows `A`, and the keypad offers the keys 1 to 9 and
  `A` to `C`

### Requirement: A born game's clue may sit at an edge, a slot or a part

A born game's clue kind MAY sit at an edge between two cells, at a slot at
either end of a line, at a corner where cells meet, or at a part of a
dealt partition, besides a cell and a line; the board SHALL draw it there,
its ID SHALL write it, and its hint SHALL mark it there.

#### Scenario: A sign between two cells

- **WHEN** a born game deals a clue kind at an edge
- **THEN** the board draws it in the gap between the edge's two cells, and
  a broken one is drawn as broken
