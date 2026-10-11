## ADDED Requirements

### Requirement: One Mosaic number alone settles its block

A number whose block already holds as many shaded squares as it counts SHALL
make every empty square of the block clear. A number whose block holds only
as many squares that are not clear as it counts SHALL make every empty square
of the block shaded. The hint step SHALL outline the number's block and ring
the squares it decides, and SHALL say of a 0 that it allows no shaded squares
and of a number equal to its block's size that it needs all of them.

#### Scenario: The three sentences of a small board

- **WHEN** the hint's plan is read on the 3×3 board `d7a2a4`
- **THEN** it says "This 4 needs all 4 of its squares purple, so these squares
  must be purple.", then "This 2 already has its 2 purple squares, so these
  squares must be clear.", then "This 7 needs 7 purple squares, and only 7 of
  its squares are not clear, so these squares must be purple."

### Requirement: Mosaic's hint asks the numbers in reading order, and the nearest pair first

The plan SHALL ask every number once in reading order, and SHALL ask a number
again, after those already waiting, each time a square of its block is
decided. Where the numbers alone decide nothing, each number in turn SHALL be
compared with the numbers whose blocks overlap its own, the nearest first, a
number beside it before one two squares away, and the first comparison that
decides a square SHALL be the step.

#### Scenario: The first number that decides is not the first number

- **WHEN** the hint is asked on the 3×3 board `d7a2a4`, whose 7 and 2 come
  before its 4 in reading order and decide nothing as dealt
- **THEN** the first step is the 4's

### Requirement: The Mosaic status bar counts the numbers left

The status bar SHALL read `Clues left: {n}`, counting the shown numbers that
are not yet met with every square of their block decided, and SHALL be empty
once none is left.

#### Scenario: A board as dealt

- **WHEN** the 3×3 board `d7a2a4` is opened
- **THEN** the status bar reads "Clues left: 3"
- **AND** it is empty once the hint's three steps are played
