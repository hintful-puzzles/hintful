# kakurasu Specification

## Purpose
Kakurasu, the puzzle of shading squares so that each row's shaded squares'
column numbers, and each column's shaded squares' row numbers, add up to its
number. Born from its description: its rules, deal, controls and hint.

## Requirements

### Requirement: Rules: A line's shaded squares add up to its number

A Kakurasu board SHALL be solved exactly when, for every row, the column
numbers of its shaded squares add up to the row's number, and for every
column, the row numbers of its shaded squares add up to the column's
number. The columns SHALL be numbered from 1 at the left and the rows from
1 at the top. A cross SHALL be the player's note that a square is clear and
SHALL count toward nothing, so a blank square counts as clear.

#### Scenario: A row one short of its number

- **WHEN** every column adds up to its number and one row's shaded squares
  add up to one less than its number
- **THEN** the board is not solved

### Requirement: Rules: Check & Save compares shaded squares and crosses with the answer

Kakurasu's mistake check SHALL report every shaded square where the board's
one answer is clear and every cross where it is shaded, and SHALL never
report a blank square.

#### Scenario: A cross on a square the answer shades

- **WHEN** the player crosses out a square the answer shades
- **THEN** that square is reported, and a blank square beside it is not

### Requirement: Params: A params string is the size and the tier

A Kakurasu params string SHALL be the width, `x` and the height, and in the
full form `d` and the tier's letter (`e` for Easy, `n` for Normal). Each side
SHALL be from 4 to 9.

#### Scenario: A board's own string

- **WHEN** a 6x6 board at Normal is encoded in full, and again in the form a
  board's ID carries
- **THEN** the strings are `6x6dn` and `6x6`

### Requirement: Description: The game is its description alone

Kakurasu SHALL be written as its description and nothing else: its rules,
techniques, words, input, drawing and deal SHALL come from
`kakurasu.description.yaml` through the engine's fill board, and its
directory SHALL hold no TypeScript but its tests.

#### Scenario: The game's directory

- **WHEN** the files under `src/games/kakurasu/` are listed
- **THEN** none is TypeScript but a test

### Requirement: Description: A board's ID is each row's number, then each column's

A Kakurasu desc SHALL be the rows' numbers from the top, then the columns'
numbers from the left, separated by commas. A number SHALL lie between 0 and
the sum of 1 to its line's length, and a desc with a number outside that, or
with too many or too few, SHALL be refused.

#### Scenario: A number past its line's most

- **WHEN** a 4x4 desc gives a row the number 11
- **THEN** the desc is refused, since a row of four adds up to at most 10

### Requirement: Generation: A dealt board is finished at its tier and not below

A dealt Kakurasu board SHALL have one answer, which its tier's deductions
reach from the numbers alone, and a Normal board SHALL be one that Easy's do
not finish.

#### Scenario: A Normal board

- **WHEN** a board is dealt at Normal
- **THEN** Easy's deductions leave it unfinished, and Normal's finish it

### Requirement: Generation: Each tier's deductions read one line at a time

Easy's deductions SHALL be these: a line already at its number has its open
squares clear, a line that needs every open square has them shaded, and an
open square worth more than its line still needs is clear. Normal SHALL add
reading every way to make what a line still needs from its open squares: a
square every way shades is shaded, and one no way shades is clear.

#### Scenario: A row whose number is 1

- **WHEN** a row of four with nothing marked has the number 1
- **THEN** Easy's deductions clear the squares worth 2, 3 and 4

### Requirement: Controls: The left button shades and the right crosses out

Kakurasu's input SHALL be the fill board's, from its description's `play:`:
the left button SHALL shade a square and the right cross it out, either
SHALL clear a square already holding what it makes, and a right-button drag
SHALL cross out the open squares along the one row or column it keeps to.
The keys S, X and B SHALL shade, cross out and clear the cursor's square.

#### Scenario: A right drag along a row

- **WHEN** the player drags with the right button across a row holding a
  shaded square and open ones
- **THEN** the open squares are crossed out and the shaded one is kept

### Requirement: Hint: A step names its line and the squares it decides

Each hint step SHALL decide the squares one deduction decides, ring them,
stripe the line it reads, and say what that line still needs.

#### Scenario: A row whose number is 1

- **WHEN** a row of four with nothing marked has the number 1
- **THEN** the step rings its squares worth 2, 3 and 4, stripes the row,
  and says the row still needs only 1, so they must be clear
