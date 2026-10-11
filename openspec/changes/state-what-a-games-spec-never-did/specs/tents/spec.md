## ADDED Requirements

### Requirement: A Tents number is at most the length of its line

`newState` SHALL refuse a description in which a column's number is above the
height of the grid or a row's number above its width. It SHALL also refuse a
`z` that brings the count of squares up to or past the grid's area, since `z`
is written only with blank squares still to follow it.

#### Scenario: A column of an 8×8 board is given 9 tents

- **WHEN** the first number of
  `ebachbngeca_a,2,1,2,1,1,1,1,3,3,0,1,2,1,1,2,2`, the first column's 2, is
  changed to 9 and the result is read as an 8×8 board
- **THEN** it is refused as holding a number out of range for its board
- **AND** an 8 in that place is in range, so `newState` reads it, and the
  board is then refused for another reason: its clues contradict each other

### Requirement: Tents params that name no difficulty are Easy

A params string with no `d`, or whose `d` is followed by a letter that names
no tier, SHALL decode as Easy.

#### Scenario: A bare size

- **WHEN** `10` is decoded
- **THEN** the params are a 10×10 board at Easy

### Requirement: Tents refuses a grid whose area cannot be counted

`validateParams` SHALL refuse, at every check, a width and a height whose
product is past the largest whole number the program counts exactly, in the
engine's sentence that the width times the height must not be unreasonably
large.

#### Scenario: A width in the thousands of millions of millions

- **WHEN** the width of `8x8de` is changed to 1200000000000000 and the params
  are checked, for a deal or for a board that arrives written
- **THEN** they are refused: "Width times height must not be unreasonably
  large."

### Requirement: A Tents line's remaining tents grass the squares beside it that each placement touches

Where every way of placing a row's or column's remaining tents in its open
squares, no two side by side, puts a tent next to one open square of a line
alongside, even diagonally, a step SHALL mark that square grass ("Wherever
this column's 2 remaining tents go, one touches each of these squares beside
it"). The step SHALL decide no square of the line it counts.

#### Scenario: A column's two tents on a dealt Normal board

- **WHEN** the hint is followed on the 8×8 Normal board
  `hcabb_naambbc,1,2,1,2,2,1,1,2,1,2,1,2,2,0,2,2` from nothing placed
- **THEN** its third step, after the squares beside no tree and the row whose
  number is 0, counts the second column, which needs 2 tents, and marks grass
  the squares to its left and its right in the third row

### Requirement: The Tents hint tries the squares beside a tree before it counts a line

`hint` SHALL take the first of these that decides something, and begin again
after each: grass beside no tree, or beside trees that all have their tents;
grass round a tent; a tree's one open square; the square between a tree's two
diagonal candidates; a link after which one of those four decides something;
a line's count over its own squares; its count over the lines beside it; a
link after which any of them does, or failing that the first link pending. It
SHALL NOT stop at the board's tier.

#### Scenario: A line is counted when no square beside a tree is decided

- **WHEN** a hint is asked for on the 8×8 Easy board
  `ebachbngeca_a,2,1,2,1,1,1,1,3,3,0,1,2,1,1,2,2` with nothing placed
- **THEN** the first step marks as grass the squares beside no tree
- **AND** the second marks as grass the open squares of the row whose number is
  0, and a step about the squares round a tent comes only once a later count
  has placed one
