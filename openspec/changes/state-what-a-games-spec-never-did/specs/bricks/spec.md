## ADDED Requirements

### Requirement: A Bricks description parts two numbers with _ and counts blank cells from a

Between two numbers with no blank cell between them a description SHALL hold
`_`. A letter SHALL count from `a` for one blank cell to `z` for twenty-six,
and `newState` SHALL read a run however it is split into letters. A number
SHALL be from 0 to 7, and a 7 SHALL be a cell that cannot be shaded and
counts nothing, drawn as `?`.

#### Scenario: A dealt 6×7 board

- **WHEN** `a1b2ad2a0a4b3fa3b4ab5a5a1e` is opened as a 6×7 board
- **THEN** its forty-two cells are covered, and the top row of six reads a
  blank cell, 1, two blank cells, 2 and a blank cell
- **AND** with its first number written 8 it is refused as out of range

### Requirement: Bricks writes its difficulty after d, in the full encoding only

The full encoding SHALL be `WxH` then `d` and the difficulty letter, and the
shared encoding `WxH` alone. `decodeParams` SHALL read a string with no `d` as
Easy, and one whose letter after `d` is none of the three as a difficulty the
engine refuses whether or not a description comes with it.

#### Scenario: The Unreasonable preset

- **WHEN** `6x7dn` is decoded
- **THEN** it is the 6×7 `Unreasonable` board
- **AND** its shared encoding is `6x7`, which decodes as Easy

### Requirement: Bricks' keys paint the cell under the cursor

The `1` key SHALL shade the cell under the cursor, `0` or `2` mark it clear,
and Backspace or Delete empty it. The number pad's 8, 2, 4 and 6 SHALL move
the cursor as the arrows do, and its 7, 9, 1 and 3 up-left, up-right,
down-left and down-right, so of the number pad's digits only 0 paints. Ctrl
with a move SHALL shade the cell the cursor leaves and the one it enters,
Shift mark them clear, and both together empty them; a numbered cell among
them is left as it is.

#### Scenario: Ctrl with an arrow shades two cells

- **WHEN** the cursor is on an empty cell with an empty cell to its right, and
  the player presses Ctrl with Right
- **THEN** one move shades both cells

### Requirement: A Bricks hint takes the first empty cell one color breaks a rule in

The hint SHALL take the empty cells in reading order and give the first that
one color breaks a rule in. In each it SHALL try clear first: where that
strands a shaded brick above, or leaves a number unable to reach its count,
the cell must be shaded. It SHALL then try shaded: where that makes three in
a row, leaves the cell nothing to rest on, or gives a number too many, the
cell must stay clear. Where several rules break, the first in that order
SHALL be the reason given.

#### Scenario: Two rules break at once

- **WHEN** shading the first such cell would both make three in a row and
  give a number beside it too many shaded neighbors
- **THEN** the step's sentence gives the three in a row
