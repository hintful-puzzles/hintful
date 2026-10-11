## ADDED Requirements

### Requirement: Boats params are written as the size, f with the largest boat, the tier, S and the fleet's counts

`encodeParams` SHALL write `WxH`, `f` and the fleet size, then in the full
encoding `d` with `e`, `n`, `t` or `h` and `S` when numbers are removed, then
in every encoding a comma and the count of boats of each size from one square
up, parted by commas. `decodeParams` SHALL read a missing `f` as 4, a missing
tier as Normal, a missing list as the pyramid (one boat of the largest size,
two of the next, and so on down), and a count the list lacks as none.

#### Scenario: A Hard board with numbers removed

- **WHEN** `6x6f3dhS,3,2,1` is decoded
- **THEN** it is a 6×6 Hard board with numbers removed, whose fleet is three
  one-square boats, two of two squares and one of three
- **AND** its shared encoding is `6x6f3,3,2,1`

### Requirement: A Boats description gives the column numbers first and names each given by a letter

The border tokens SHALL be the column numbers from the left and then the row
numbers from the top, with `-` for a hidden one; `newState` SHALL refuse a
column number above the height or a row number above the width. In the grid
`a` to `z` SHALL be one to twenty-six squares with no given, `W` given water,
and `S`, `V`, `T`, `B`, `L`, `R` and `C` a given single, shapeless, top,
bottom, left, right and middle segment.

#### Scenario: A dealt 6×6 board

- **WHEN** `0,5,0,3,0,2,1,3,2,1,2,1,qWgTcW` is opened as a 6×6 board
- **THEN** the second column's number is 5 and the second row's is 3
- **AND** the third row ends in given water, the fifth row holds a boat's top
  end in its second square and given water in its last, and the sixth row,
  which the description stops short of, holds no given

### Requirement: A Boats drag fills its line as its first square changed

A drag SHALL keep to the row or column it has moved further along, and on
release SHALL make one fill from the pressed square to the last: each square
holding what the pressed one held takes what the press makes of it, and a
left drag from a boat segment, which makes water, SHALL water every square of
the line that is no given. A release off the board SHALL change nothing. A
press on the number at the right or the bottom edge SHALL act on the square
beside it.

#### Scenario: A drag from a boat segment waters the line

- **WHEN** the player left-presses a placed boat segment and drags along a row
  that holds an empty square and another placed segment
- **THEN** on release each of those squares is water

### Requirement: Boats' modifier arrows fill as the cursor moves, and Backspace empties

Ctrl with an arrow SHALL move the keyboard cursor and place boat segments on
the empty squares among the one it leaves and the one it enters, Shift with
an arrow water on the empty ones, and both together SHALL empty each of the
two that is no given. Backspace or Delete SHALL empty the square under the
cursor.

#### Scenario: Ctrl fills only what is empty

- **WHEN** the cursor is on an empty square with a water square to its right,
  and the player presses Ctrl with Right
- **THEN** the first square holds a boat segment and the water is left as it
  was

### Requirement: The Boats hint reads a segment for the squares round it

From one segment the hint SHALL conclude: that the square a given end points
into is a boat segment and the square behind it water; that the four squares
beside a given one-square boat are water; that the squares diagonally beside
any segment are water; and that a given middle segment with water or the
board's edge on one side has boat segments on the two squares along its other
axis. Each such step SHALL outline the segment and ring the squares it
decides.

#### Scenario: A given top end

- **WHEN** a given top end has an empty square above it and one below
- **THEN** the step says the segment is a boat's top end, and asks for water
  above it and a boat segment below

### Requirement: The Boats hint finishes a line by its number

For a row or column whose free squares are exactly as many as the boat
squares it still needs, the hint SHALL make them all boat segments, and for
one that already has its number, all its free squares water. While a number
is still hidden, when the water marked and the fleet's squares together
account for the whole grid, it SHALL make every free square a boat segment.
A line step SHALL stripe its line, and SHALL say of a number the puzzle
hides what that "hidden number can only be".

#### Scenario: A line numbered 0

- **WHEN** a row's number is 0 and it has free squares
- **THEN** the step says the row's number is 0, stripes the row and rings
  every free square in it as water

### Requirement: With every one-square boat placed, the Boats hint settles a hemmed-in square

Once the fleet's one-square boats are all on the board, the hint SHALL make
water of a free square that has water or the board's edge on all four sides,
and SHALL continue a segment whose shape is not yet settled, with them on
three sides, into the free square on the fourth.

#### Scenario: A segment closed on three sides

- **WHEN** every one-square boat is placed, and a segment has water above,
  below and to its left and a free square to its right
- **THEN** the step places a boat segment to its right

### Requirement: At Normal the Boats hint reads the fleet list

From Normal the hint SHALL also conclude: that a run the length of the
largest missing boat is all boat segments when one such boat is missing and
no other run can hold it; that the square after a given middle segment in a
line with room for under two more boat squares is water; that a free square
is water when filling it would join segments into a boat longer than the
largest still missing; and that the one free square of a run is water when
every boat of that run's length is placed.

#### Scenario: A square that would join two segments

- **WHEN** the largest boat still missing is two squares long, and a free
  square lies between two placed segments in its row
- **THEN** the step says filling the square joins the outlined segments into
  a boat of 3 where the largest still missing is 2, and makes it water

### Requirement: At Tricky the Boats hint counts runs and shared diagonals

From Tricky the hint SHALL also conclude: that when the runs that can hold the
largest missing boat are as many as such boats, the squares every placement
in a run covers are boat segments; and that where a line has room for only
one or two more water squares, and more free squares than that among three
in a row of it (the middle one counted only if its crossing line needs
exactly one more boat square), the squares either side of the line at the
middle one are water.

#### Scenario: A run one square longer than its boat

- **WHEN** two four-square boats are missing and only two runs can hold one,
  one of them five squares long
- **THEN** the step makes the middle three squares of that run boat segments

### Requirement: A hidden Boats number is recovered from a decided line, or as the last one hidden

Before its Tricky techniques the hint SHALL recover a hidden number whose
line has every square decided, as the boat squares in it, and one that is the
only number hidden among the columns, or among the rows, as what the fleet's
squares leave. Recovering one is no step: the number is used by the step that
needs it.

#### Scenario: The one hidden column number

- **WHEN** every column but one shows its number, on a board whose replay
  reaches Tricky with nothing cheaper to say
- **THEN** that column's number is taken as the fleet's squares less the
  numbers showing, and a line step that reads it says what the hidden number
  can only be

### Requirement: At Hard the Boats hint tries the one square a line is short of

At Hard the hint SHALL take a line that needs exactly one more boat square,
try each free square as that one with the rest of the line water, and make it
water where that breaks a rule at once; and for a line with room for exactly
one more water square, the same with boat and water exchanged. It SHALL also
try a given middle segment's boat each way, and where one way breaks a rule
make water of the square below it, or to its right, that way.

#### Scenario: The square that cannot be the last boat square

- **WHEN** a row needs one more boat square, and with that segment on one of
  its free squares and water on the rest a column could no longer reach its
  number
- **THEN** the step makes that square water, and says that if it held a boat
  segment the striped column could no longer reach its number

### Requirement: The Boats hint asks its techniques in a fixed order

The hint SHALL take the first that fires: at Easy a given segment's squares,
the diagonals, a line's free squares all boat, the fleet filling what is
left, a middle segment's direction, the segment closed on three sides, a
line that has its number, the hemmed-in square; at Normal the boat that must
grow, the one run, the middle segment's line, the boat too long, the run too
short; at Tricky the runs, the shared diagonals. A tier SHALL be asked only
when every tier below it has nothing.

#### Scenario: A boat segment is offered before the water

- **WHEN** no segment has a square round it left to settle, one row has
  exactly as many free squares as it still needs, and another already has
  its number with squares still free
- **THEN** the step is the first row's boat segments

### Requirement: A Boats label gives the largest boat as its size

A board's label SHALL say "size N" for a fleet whose largest boat is N
squares, then "fleet" and the counts when the fleet is not the pyramid of
that size, then "hidden clues" when numbers are removed.

#### Scenario: A Hard board with numbers removed

- **WHEN** `6x6f3dhS,3,2,1` is labeled
- **THEN** the label is "6x6 Hard, size 3, hidden clues"
