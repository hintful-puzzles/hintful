# boats Specification

## Purpose
Boats, the battleships puzzle of placing a given fleet so that no two boats
touch, even diagonally, and each row and column holds its clued number of boat
cells. This capability specifies the game on the TS engine, with a hint that
explains one deduction at a time and never reasons from a board that cannot be
completed, and a fleet display that fits every legal fleet.

## Requirements

### Requirement: Boats parameters are a board, a fleet, a difficulty and a remove-numbers flag

Parameters SHALL be a width, a height, a maximum fleet (boat) size, a fleet
configuration (how many boats of each size), a difficulty of Easy, Normal,
Tricky or Hard, and a remove-numbers flag. The full parameter encoding of a
game ID SHALL carry the width, height, fleet size, difficulty, remove-numbers
flag and fleet configuration, and SHALL round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in full to a game ID and decoded
- **THEN** the same width, height, fleet size, difficulty, remove-numbers flag and
  fleet configuration are recovered

### Requirement: Boats refuses parameters no fleet can be dealt from

Parameters SHALL be refused unless width and height are each at least 2 and at
most 99, the fleet size is between 1 and 9 and no greater than the larger of
width and height, the fleet holds at least one boat, and the fleet fits in the
grid. When a board is to be generated, a fleet of exactly one boat SHALL be
refused at any difficulty above Easy, with a reason, since such a fleet has
only Easy boards.

#### Scenario: A fleet size larger than both dimensions is refused

- **WHEN** parameters name a fleet size greater than both the width and the
  height
- **THEN** they are refused with a reason

#### Scenario: A one-boat fleet is offered only at Easy

- **WHEN** a board is asked for with a fleet of one boat at Normal
- **THEN** the parameters are refused with a reason, and the same fleet at Easy
  is accepted

### Requirement: Boats descriptions use the border-clue and run-length grid encoding

A Boats description SHALL encode, first, the row and column occupancy clues as
`width + height` comma-terminated tokens, each a decimal count or a marker for a
hidden clue (the remove-numbers mechanic); and then the grid in row-major order as
a run-length sequence in which a lowercase letter denotes a run of that many empty
squares and an uppercase letter denotes a single given clue: water or one of the
boat-segment shapes (single, vague/unknown, top, bottom, left, right, center).

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Boats description omits a trailing run of squares with no clue

The run-length sequence SHALL be written so that a run is emitted only when a
given clue follows it or the run reaches the maximum a single letter can carry.
A description whose final squares carry no clue therefore encodes short, and a
board with no given clues at all, of fewer squares than one letter can carry,
SHALL encode as its border clues alone.

#### Scenario: A small board with no given clues encodes as its border clues

- **WHEN** a board with no given squares, smaller than the longest run one
  letter can carry, is encoded
- **THEN** the description is the border-clue tokens and nothing after them

#### Scenario: A trailing run is dropped after the last full letter

- **WHEN** a larger board with no given squares is encoded
- **THEN** the grid part holds a letter for each full-length run and nothing
  for the squares left over

### Requirement: Boats description validation rejects too many squares and never too few

Validation SHALL reject a description that carries more grid squares than the
board holds, that carries the wrong number of border-clue slots (distinguishing
too many from too few), or that uses an unknown character. It SHALL NOT reject
a description that carries fewer grid squares than the board holds, since that
is the ordinary encoding of a board whose last squares have no clue.

#### Scenario: A description with too many squares is rejected

- **WHEN** a description whose decoded grid area exceeds the board area is
  validated
- **THEN** it is rejected

#### Scenario: A description with no given clues is accepted

- **WHEN** a description carrying the right number of border clues and no grid
  clues at all is validated
- **THEN** it is accepted, and decodes to a board with no given squares

### Requirement: Boats is played by pointer and by keyboard

Boats SHALL be played by mouse or touch and by keyboard. A left-click SHALL
cycle a cell between empty, a boat segment and water; a right-click SHALL place
water on an empty cell and empty a filled one; a drag SHALL fill a run along a
single row or column; and a keyboard cursor with a place-segment key, a
place-water key and modifier-drag SHALL provide the same placements.

#### Scenario: Filling a run of cells along a row

- **WHEN** a drag begins in one cell and ends in another on the same row or column
- **THEN** every cell between them is set to the dragged content in a single move

### Requirement: A boat segment resolves its shape and a completed boat is crossed off

An unknown boat segment SHALL automatically resolve to the correct shape once
its neighbors are known, and a completed boat SHALL be crossed off the fleet
list.

#### Scenario: A segment between water and another segment becomes an end

- **WHEN** a placed segment has water on its left, above and below, and a boat
  segment on its right
- **THEN** it is drawn as the left end of its boat

### Requirement: Boats flags a broken rule as the player plays

The game SHALL flag provably wrong placements live: a row or column whose
occupancy count is exceeded, two boats touching even diagonally, a boat of a
size the fleet cannot accommodate, and a placed segment that contradicts a
given clue. A line whose count is broken SHALL have its number drawn in the
error color.

#### Scenario: A row whose count is exceeded is flagged

- **WHEN** more boat segments are placed in a row than its occupancy clue allows
- **THEN** the row's count is shown in the error color, and `findMistakes`
  reports at least one of the row's cells

### Requirement: Boats findMistakes re-solves to the unique solution

The `findMistakes` hook SHALL re-solve the puzzle to its unique solution and
report every placed cell that contradicts it, so that Check & Save also blocks
a locally legal placement that no solution permits. On a board the puzzle's
solver completes, a board the live flags mark SHALL be a board on which
`findMistakes` reports a cell.

#### Scenario: A legal placement no solution permits is reported

- **WHEN** a boat segment is placed that exceeds no count and touches no boat,
  on a square the unique solution has as water
- **THEN** `findMistakes` reports that square

### Requirement: Boats is solved when the fleet is placed, without the water

The board SHALL be solved once every row and column count is met and the fleet
is exactly accounted for, whether or not the remaining squares have been marked
as water.

#### Scenario: Completing the fleet wins, without filling in the water

- **WHEN** the last boat is placed so that every row and column count is met and
  the fleet is exactly accounted for
- **THEN** the game is reported solved, even if squares the player never marked
  as water remain undecided

### Requirement: The Boats hint replays the solver's deductions one firing at a time

The hint SHALL be derived from the same deduction engine as the solver,
replayed one firing at a time from the player's current board, and SHALL
narrate each firing by the deduction that forces it.

#### Scenario: A hint names the technique that forces the move

- **WHEN** a hint is requested on a board where a row already shows all the ships
  its number allows
- **THEN** the remaining squares in that row are offered as water, and the
  explanation states that the row's number is already met

#### Scenario: A hint resumes from the player's board

- **WHEN** a hint is requested on a board the player has partly filled
- **THEN** the plan starts from that board, and every square its first step
  asks for is one the player has left undecided

### Requirement: The Boats hint replays at the lowest cap that solves the board

The hint SHALL replay the deduction at the lowest cap at which the board
solves, so that a board generated at an easy tier is taught the easy technique
that suffices. It SHALL replay at a higher cap only when the lower one yields
no step from the player's board.

#### Scenario: A hint on an easy board teaches an easy technique

- **WHEN** a hint is requested on a board generated at the easiest difficulty
- **THEN** a plan is produced, and it is the deduction that difficulty admits
  rather than a harder refutation reaching the same square

### Requirement: A recovered border number is offered to the cheaper techniques first

A hidden border number the deduction recovers is new to every cheaper
technique, so the hint SHALL ask them again before it tries a harder one.

#### Scenario: A recovered number feeds a line count

- **WHEN** the only progress on a board with hidden border numbers is that one
  of them can now be worked out, and with it a line is one boat square short
  with one square free
- **THEN** the hint offers that square, and does not report that deduction has
  run out

### Requirement: Every Boats technique is narrated

Every named technique SHALL be narratable. Boats guesses at no tier, so the
hint SHALL NOT fall back on an unexplained "this is the only possibility" step.
A step forced only because the opposite placement contradicts the board SHALL
name the rule that placement would break. Where the board's check rejects the
placement without naming a rule, the step SHALL say that the rest of the fleet
could no longer be placed legally, and SHALL NOT be dropped.

#### Scenario: A refutation names the rule the alternative would break

- **WHEN** a square is forced only because the opposite placement immediately
  contradicts the board
- **THEN** the explanation names the specific rule that would break (a line's
  number, two boats touching, or a boat the fleet cannot hold) rather than
  asserting the square is forced without reason

#### Scenario: A refutation the check gives no rule for is still a step

- **WHEN** the opposite placement is rejected and the check flags no line, no
  touching boats, no boat and no given segment
- **THEN** the step is offered, and says the rest of the fleet could no longer
  be placed legally

### Requirement: Water forced by the never-touch rule belongs to the step that places the boat

Squares that follow from a placement by the never-touch rule SHALL be shown as
part of that step and SHALL NOT be narrated as further deductions.

#### Scenario: A placed segment brings its water with it

- **WHEN** a hint step places a boat segment whose neighbors the never-touch
  rule makes water
- **THEN** that water is shown in the same step, and no later hint narrates it
  as a deduction of its own

### Requirement: A Boats hint marks a boat and water each in its own shape

Forced squares and the evidence they are deduced from SHALL be visually
distinct, and the two kinds of placement Boats admits, a boat segment and
water, SHALL be marked in the shape of the action each represents, so that one
hint color cannot stand for two different actions.

#### Scenario: A step that places both kinds marks each differently

- **WHEN** a hint step asks for a boat segment on one square and water on
  another
- **THEN** the first is marked with a boat segment of no resolved shape and the
  second with waves, both in the hint color
- **AND** a square the step only reasons from is outlined and carries neither
  mark

### Requirement: The fleet display fits the canvas for every legal fleet

The boats drawn beneath the board SHALL lie entirely within the width the game
reports for its canvas, for every fleet configuration parameter validation
admits. Rows SHALL break between whole batches of one boat size, and also
within a batch that is too wide for a row. The canvas SHALL be as wide as the
board and its column of numbers, or as the fleet's longest boat where that is
wider, because one boat has no break to take.

#### Scenario: A fleet wider than one row wraps instead of overflowing

- **WHEN** the fleet holds more boats of one size than fit across the board
- **THEN** that batch wraps onto a further row, every boat is drawn inside the
  canvas width, and the reported canvas is tall enough for the extra row

#### Scenario: A row's last boat would end past the column of numbers

- **WHEN** three one-square boats and two two-square boats are drawn beneath a
  board five squares wide
- **THEN** the two two-square boats start a new row together, since the batch
  breaks before its first boat where the whole of it does not fit

#### Scenario: A boat longer than the board is wide

- **WHEN** a nine-square boat is drawn beneath a board two squares wide and
  nine tall
- **THEN** the reported canvas is wider than the board and its numbers, and
  the whole boat is drawn inside it

### Requirement: A fleet whose batches fit is laid out by the batch rule alone

Wherever breaking rows only between whole batches keeps every boat
inside the canvas width, the layout SHALL be identical to the one that rule
alone gives.

#### Scenario: A fleet that already fitted is laid out unchanged

- **WHEN** a fleet whose every batch fits within a row is drawn
- **THEN** each size's boats stay together on one row, positioned as the
  batch-only rule places them

### Requirement: Boats solves with a four-tier deductive solver

Boats SHALL provide a solver that finds the fleet placement by deduction, or
reports that no deduction completes it. The solver SHALL apply progressively
harder named technique tiers (Easy, Normal, Tricky, Hard) and SHALL report the
highest tier a board actually requires. The solver SHALL NOT guess or backtrack
at any tier, so that every generated board is solvable by pure deduction and
Boats satisfies the guess-free-generation policy at every named difficulty.

#### Scenario: The solver reports the required difficulty

- **WHEN** a soluble board is solved
- **THEN** the returned tier equals the hardest technique tier the deduction
  needed, and the completed grid is the unique solution

### Requirement: The Boats solver is monotone in its difficulty cap

The solver SHALL be monotone in its difficulty cap, as every capped solver is.
A consumer that solves a board of unknown difficulty, which Solve and the
mistake check are, SHALL solve once at the highest cap.

#### Scenario: A board that solves at the easiest cap solves at every cap

- **WHEN** a board whose largest boats are all placed and bounded by water
  solves at the easiest cap
- **THEN** it solves at every cap above it

### Requirement: An end-capped boat that cannot stop grows at the second tier

A boat that has an end cap on one side and an undecided square on the other
SHALL be grown into that square once every boat of its present length is
finished, at the second tier.

#### Scenario: An unfinished boat that cannot stop grows

- **WHEN** a boat of two squares has water beyond one end and an undecided
  square beyond the other, and every two-square boat of the fleet is finished
- **THEN** the solver places a boat segment in the undecided square, and the
  hint gives that as its reason

### Requirement: The Boats generator deals a unique board at exactly the requested difficulty

The generator SHALL use the solver to guarantee a unique solution at exactly
the requested difficulty: it SHALL place a random fleet, derive the border
clues, optionally hide border numbers while the board stays soluble, and reject
any board not solvable at exactly the target difficulty.

#### Scenario: A board that needs less than its tier is dealt again

- **WHEN** a stripped board solves, and the solver needed only a difficulty
  below the one asked for
- **THEN** the board is thrown away and another fleet is placed

### Requirement: Boats draws its squares on the collection's quiet surface

`redraw` SHALL draw an undecided square as the collection's cell surface, with
the collection's surface grid line between squares and round the grid. A square
the player has decided, water or segment, and a water square the puzzle gave
SHALL keep the water fill, and given water SHALL keep its waves.

#### Scenario: Undecided is surface and water is blue

- **WHEN** a board holds an undecided square beside one marked as water
- **THEN** the first is the cell surface and the second the water fill

### Requirement: A given boat segment sits on the lifted surface of a given

A boat segment the puzzle gave SHALL sit on the collection's lifted surface of
a given, so it is told from a segment the player placed by the cell under it.
The help page SHALL say that a given segment sits on a lighter square.

#### Scenario: A given segment is told by the cell under it

- **WHEN** a board with a given boat segment is drawn
- **THEN** that segment's square is the lifted surface
- **AND** a segment the player places is drawn on the water fill

### Requirement: Boats draws its waves and its collision diamond's edge in ink

The waves and the edge of a collision diamond SHALL be drawn in ink, not in the
grid's color.

#### Scenario: Given water carries ink waves

- **WHEN** a board with a given water square is drawn
- **THEN** its waves are in the ink color, on the water fill

### Requirement: A boat segment and an unfound boat in the tally share the placed-piece color

A boat segment SHALL be drawn in the collection's color for a placed piece, the
theme pair's first member, whether the player placed it or the puzzle gave it, and a boat still to be found in the fleet tally SHALL be drawn in that
same color.

#### Scenario: The tally shows the piece on the board

- **WHEN** a board is drawn with a boat placed and a boat still to be found
- **THEN** the placed segment and the unfound boat in the fleet tally are
  filled with the same color

### Requirement: The Boats keyboard cursor is a ring at the square's edge

The keyboard cursor SHALL be a ring in the collection's cursor color at the
square's edge, outside a segment's outline.

#### Scenario: The cursor rings a square that holds a segment

- **WHEN** the keyboard cursor is on a square holding a boat segment
- **THEN** the ring is drawn at the square's edge in the cursor color, and does
  not cross the segment

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

### Requirement: A Boats journey shows its whole firing on every leg

Every leg of a journey SHALL carry the sentence and the marks of the whole
firing: every square the firing decides, its never-touch water included, and
its evidence. Playing a leg SHALL NOT shrink the picture. `hintKeepTrack`
SHALL judge a leg by the squares its own move asks for, so a journey advances
one leg at a time.

#### Scenario: A journey played leg by leg

- **WHEN** a firing that decides several squares is played one leg at a time
- **THEN** each leg completes on its own move and the plan advances to the
  next
- **AND** every leg marks all the squares the firing decides
