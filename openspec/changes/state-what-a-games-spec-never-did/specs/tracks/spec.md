## ADDED Requirements

### Requirement: A Tracks clue square's character adds up the sides its track leaves by

A clue square's hexadecimal character SHALL be the sum of the two sides its
track leaves by: 1 for the right, 2 for the top, 4 for the left and 8 for the
bottom. A square at the grid's rim MAY name the side on the rim, which is how
the entrance and the exit are written.

#### Scenario: A dealt 8×8 board is read

- **WHEN** `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8` is read as an 8×8
  board
- **THEN** its first clue square, at the left of the sixth row, is `5`, track
  from the left side to the right, and that row's number carries the `S` of
  the entrance
- **AND** the `C` beside it turns the track from the left side to the bottom,
  and each `A` is track from top to bottom, the second at the foot of the
  sixth column, whose number carries the `S` of the exit

### Requirement: A Tracks number is at most the length of its line

`newState` SHALL refuse a description in which a column's number is above the
height of the grid or a row's number above its width, and one whose run
letters and clue squares count past the grid's area.

#### Scenario: A column of an 8×8 board is given 9 track squares

- **WHEN** the first number of `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8`,
  the first column's 5, is changed to 9
- **THEN** it is refused as holding a number out of range for its board

#### Scenario: One square too many

- **WHEN** the last `b` of that description's grid is changed to `c`
- **THEN** it is refused as too long for its board

### Requirement: Tracks params that name no difficulty are Normal

A params string with no `d`, or whose `d` is followed by a letter that names
no tier, SHALL decode as Normal, with consecutive 1 clues disallowed unless it
carries the `o`.

#### Scenario: An Easy preset's short form

- **WHEN** the Easy 8×8 preset, `8x8de`, is encoded without its difficulty and
  the result, `8x8`, is decoded
- **THEN** the params are an 8×8 board at Normal

### Requirement: Tracks refuses a grid whose area cannot be counted

`validateParams` SHALL refuse, at every check, a width and a height whose
product is past the largest whole number the program counts exactly, in the
engine's sentence that the width times the height must not be unreasonably
large.

#### Scenario: A width in the thousands of millions of millions

- **WHEN** the width of `8x8de` is changed to 1200000000000000 and the params
  are checked, for a deal or for a board that arrives written
- **THEN** they are refused: "Width times height must not be unreasonably
  large."

### Requirement: A Tracks title says when adjacent 1 clues are allowed

The label of a set of params that does not disallow consecutive 1 clues SHALL
end with the words "allow adjacent 1’s", and the label of one that does SHALL
say nothing of them.

#### Scenario: A board with the rule off

- **WHEN** the label of `10x8dto` is composed
- **THEN** it reads "10x8 Normal, allow adjacent 1’s"

### Requirement: The Tracks hint settles a square from its blocked sides

A square with three or four sides blocked SHALL be marked empty ("Every side
of this square but one is blocked, and track needs two"). A square that holds
track and has two sides blocked SHALL have track laid across its other two
("The track here has two sides blocked, so it must run through the other
two"). The grid's rim counts as blocked except where the entrance or the exit
crosses it, and the blocked sides SHALL be the evidence the step outlines.

#### Scenario: A track square in a corner

- **WHEN** a corner square of the grid, away from the entrance and the exit,
  is marked as holding track
- **THEN** a step lays track across its two inner sides

### Requirement: The Tracks hint counts a row or column against its clue

A row or column that holds as many track squares as its clue SHALL have every
other square in it marked empty ("This column already has all 4 of the track
squares its clue allows"). One that has as many squares marked empty as its
length less its clue SHALL have every other square in it marked as track. The
step SHALL stripe the line, and outline its clue and the squares it counted.

#### Scenario: A clue as long as its line

- **WHEN** a hint is asked for on the 8×8 Normal board
  `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8` with nothing marked
- **THEN** the first step is about the second column, whose clue is 8: "This
  column's clue is 8 and it is 8 squares long, so every square in it must
  carry track."

### Requirement: The Tracks hint blocks a side that would close a loop or finish the track too soon

For two track squares side by side with nothing marked on the side between
them, a step SHALL block that side where track already joins the two, since a
segment there would close a loop. It SHALL also block it where one square is
joined to the entrance and the other to the exit, and either some track is
joined to neither, which the step outlines as stranded, or some row or column
holds fewer track squares than its clue, which the step names.

#### Scenario: The two runs meet with a clue still short

- **WHEN** the run from A and the run from B reach neighboring squares, every
  track square on the board is on one run or the other, and one row holds
  fewer track squares than its clue
- **THEN** the side between the two squares is blocked, in the words that
  joining the runs there would finish the track with that row's clue short

### Requirement: The Tracks hint runs a lone loose end straight on

On a Normal or a Tricky board, in a row or column where exactly one square
holds a single segment running along the line, where the clue less the squares
that hold two segments is 2, and where every square without two segments has a
side blocked across the line, a step SHALL lay that square's track straight on
along the line ("This row has two track squares left and no way across it, so
the loose end must run straight on").

#### Scenario: An Easy board is not given it

- **WHEN** an Easy board reaches a position where a line has one loose end,
  two track squares left and no way across it
- **THEN** no step runs the loose end on, and the hint goes on with what the
  Easy techniques decide

### Requirement: The Tracks hint decides two neighbors whose track would run on

For two undecided squares side by side in a row or column, where the first has
at most one side not blocked other than the side they share, track in the
first would run on into the second. On a Normal or a Tricky board, where the
line needs one more track square, a step SHALL mark the first empty. On a
Tricky board, where the line can take one more empty square, a step SHALL mark
the second as track, and where both hold it SHALL do both.

#### Scenario: A line with room for one more track square

- **WHEN** a column of a Normal board needs one more track square, and an
  undecided square in it has its left and right sides blocked, with an
  undecided square below it
- **THEN** a step marks the first square empty: track there would carry on
  downward and the column has room for one more track square

### Requirement: The Tracks hint counts the crossings of a closed block

On a Tricky board, for an undecided side that lies on no loop of undecided
sides, the squares reached from one of its two squares through undecided
sides, without crossing it, are a block the track enters as often as it
leaves. A step SHALL lay track on the side where an odd number of the other
sides on the block's border hold track, and SHALL block it where an even
number do ("Every entry to the striped block needs an exit"). It SHALL stripe
the block and outline those crossings.

#### Scenario: One crossing is marked

- **WHEN** a block of squares is closed off but for one undecided side, and
  one side on its border holds track
- **THEN** a step lays track on the undecided side, the block's last

### Requirement: The Tracks hint tries a square's sides, then the clues, then the loop

`hint` SHALL take the first of these that decides something the board does not
show, and begin again after each: a square's blocked sides, the columns left
to right and each from the top; a clue's count, columns before rows, a clue
that is met before one whose empty squares are all marked; a loop or an early
finish. Then, above Easy, a loose end, and the two neighbors where the line
needs one more track square. Then, at Tricky, the two neighbors both ways and
a block's crossings.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 8×8 Normal board
  `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8` with nothing marked
- **THEN** the first two steps fill the second and third columns, whose clues
  are 8, and the third empties the rest of the top row, whose clue of 2 those
  columns have met
- **AND** only then does a step lay track through a square with two sides
  blocked, since no square had two until the row was emptied
