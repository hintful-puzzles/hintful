## ADDED Requirements

### Requirement: A Sticks description spells a block `B` and parts two written cells with `_`

A letter `a` to `z` SHALL stand for 1 to 26 plain blank cells. A block SHALL
be `B`, with its number, 0 to 4, straight after it where it has one. A blank
cell's number, 1 to the longer side of the grid, SHALL be written as decimal
digits, with `_` before it exactly when the cell before it was written as a
cell and not within a run. `newState` SHALL refuse a number outside its range
and a `_` anywhere else.

#### Scenario: A dealt 5×5 board is read

- **WHEN** `3bB1b5c2aB3c2a2_2aB2b1` is read as a 5×5 board
- **THEN** the top row is a blank cell holding 3, two plain blank cells, a
  block holding 1 and a plain blank cell
- **AND** the `2_2` in it is two blank cells side by side that each hold a 2,
  in the fourth row, and the board ends on a blank cell holding 1

#### Scenario: A block's number past 4, and a missing `_`

- **WHEN** the `B1` of that description is changed to `B5`, or the `_` of its
  `2_2` is taken out
- **THEN** each is refused as holding a number out of range for its board, the
  second because `22` reads as one number

### Requirement: Sticks writes its block percentage after `b` and its symmetry's number after `s`

In the full form of the params the size SHALL be followed by `b` and the block
percentage, then `s` and the symmetry as a number: 0 for none, 1 for 2-way
mirror, 2 for 2-way rotational, 3 for 4-way mirror and 4 for 4-way rotational.
The difficulty letter SHALL come last. A string with no `b` SHALL decode as 20
percent, and one with no `s` as 2-way rotational.

#### Scenario: An asymmetric board

- **WHEN** `2x5b20s0du` is decoded
- **THEN** the params are 2 wide and 5 high, 20 percent blocks, no symmetry,
  and Unreasonable

#### Scenario: A string from before the game had tiers

- **WHEN** `7x7b20s2` is decoded and encoded in full
- **THEN** the result is `7x7b20s2de`, the Easy 7×7 preset

### Requirement: Sticks' line keys set a line outright

The key `1` SHALL place a vertical line in the cursor's square and `0` or `2`
a horizontal one, whatever line the square holds, and Backspace SHALL clear
it. A key that would leave the square as it is SHALL make no move.

#### Scenario: A key does not cycle

- **WHEN** the cursor is on a square holding a vertical line and `1` is
  pressed, and then `2`
- **THEN** the first press makes no move and the second turns the line
  horizontal, where two left-clicks would have cleared the square

### Requirement: Shift or Ctrl with an arrow draws through the squares the Sticks cursor joins

An arrow held with Shift or Ctrl SHALL move the cursor and, as one move, draw
a line in the square it leaves and the square it enters: with Ctrl a line
along the way the cursor moves, with Shift a line across it, and with both no
line, clearing them. A block, and a square that already holds what the key
would draw, SHALL be left out of the move, and where both are the press SHALL
only move the cursor.

#### Scenario: Ctrl and Right, then Shift and Right

- **WHEN** the cursor is on an empty square with two empty squares to its
  right, and Right is pressed with Ctrl and then with Shift
- **THEN** the first press draws a horizontal line in the first two squares
- **AND** the second turns the second square's line vertical and draws a
  vertical line in the third, as one step of Undo

#### Scenario: The cursor is against the edge

- **WHEN** the cursor is on an empty square in the rightmost column and Right
  is pressed with Ctrl
- **THEN** the cursor stays and that one square takes a horizontal line

### Requirement: The Sticks hint takes the first forced square in reading order

`hint` SHALL decide the first blank square in reading order in which a line
one way would break a clue, trying a horizontal line before a vertical one,
and SHALL carry on in the same journey with every later square the same clue
and rule force on that board. Where the tentative line breaks several clues, the step SHALL
give the first of: a block with more lines than its number, a line longer than
its number, a line over two numbers, a block left too few open sides, a line
with too little room.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 5×5 board `3bB1b5c2aB3c2a2_2aB2b1` with
  no line placed
- **THEN** the first step makes the top-left square, the 3, horizontal, since a
  vertical line there would leave it only 2 squares
- **AND** the next journey makes the second and third squares of the top row
  horizontal, both by that 3, which rules out neither until its own line is
  placed, and the journey after it reasons from the 1 block

#### Scenario: A line that would break a block's number and a line's length

- **WHEN** a horizontal line in a square would give a 1 block its second line
  and also run a 2's line to 3 squares
- **THEN** the step speaks of the block

### Requirement: A Sticks title says its blocks and its symmetry where they are not the default

The label of a set of params SHALL end with `N% blocks` where the block
percentage is not 20, and with the symmetry's name as the Custom dialog lists
it, or `no symmetry` for none, where the symmetry is not 2-way rotational.

#### Scenario: Two boards off the default

- **WHEN** the labels of `2x5b20s0du` and `2x2b50s2du` are composed
- **THEN** they read "2x5 Unreasonable, no symmetry" and "2x2 Unreasonable,
  50% blocks"
