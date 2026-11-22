## MODIFIED Requirements

### Requirement: Params: A Sticks params string may leave out its blocks, its symmetry and its difficulty

Sticks' params (a size, a percentage of blocks, their symmetry and a tier),
their bounds, encoding and label words SHALL be those its description
declares (`described-fill-game`), and its menu its description's boards.
A string with no `b` SHALL decode as 20 percent, one with no `s` as 2-way
rotational, and one with no difficulty letter as Easy.

#### Scenario: A string that leaves a field out

- **WHEN** `7x7`, the short form of every 7×7 board, is decoded
- **THEN** the board has 20 percent blocks in 2-way rotational symmetry, at
  Easy
- **AND** `7x7b20s2`, written before the game had tiers, decodes as Easy

#### Scenario: An asymmetric board

- **WHEN** `2x5b20s0du` is decoded
- **THEN** the params are 2 wide and 5 high, 20 percent blocks, no symmetry,
  and Unreasonable

### Requirement: Generation: The Sticks generator keeps only what the solver completes

A board SHALL be dealt by the fill engine from the description
(`described-fill-game`): blocks first at the share and symmetry asked for,
then on each other square a line across or down, at even odds; one number
on a random square of each line, and one on each block. The numbers SHALL be hidden in one random
order, each kept hidden only while the ladder still finishes the board.

#### Scenario: A clue the solver needs is put back

- **WHEN** an Easy board is stripped, and taking a clue out leaves a board the
  solver does not complete
- **THEN** that clue is put back, and the strip goes on to the next

### Requirement: Generation: An Unreasonable Sticks board has one answer that the solver does not reach

At Unreasonable every draw SHALL strip from every number, each kept hidden
only while the search still proves one fill, and the board SHALL be kept
only where the ladder does not finish it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 2×3 to 7×7
- **THEN** each opens, entered with no difficulty letter, as Unreasonable
- **AND** Solve finishes each

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 2×3 board, a 3×3 board and a 7×7 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

## ADDED Requirements

### Requirement: Params: Sticks refuses a block share outside 5 to 100, and, for a deal only, a quarter-turn symmetry off a square

Sticks SHALL refuse a block percentage outside 5 to 100 wherever it is
written, and, on a full parameter check only, 4-way rotational symmetry on a
grid that is not square. No game ID upstream writes carries a percentage.

#### Scenario: A short check admits a quarter turn off a square

- **WHEN** `5x6b20s4` is checked without the full flag, and then with it
- **THEN** the first is accepted and the second refused, as the grid must be
  square

#### Scenario: Too few blocks

- **WHEN** `7x7b4s0de` is checked
- **THEN** it is refused: the percentage must be at least 5

### Requirement: Params: Sticks deals Unreasonable only on a board of five squares or more

The description SHALL bound Unreasonable to an area of at least 5, so a 2×2
is refused at Unreasonable when a board is to be dealt and a 2×3 is not; a
2×2 board with one fill is one the ladder finishes.

#### Scenario: A 2×2 board is not dealt at Unreasonable

- **WHEN** a 2×2 board is asked for at Unreasonable
- **THEN** it is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×2 board is still dealt at Easy, and a 2×3 board is dealt at
  Unreasonable

### Requirement: Controls: A Sticks drag draws along the row or column it moves in

A drag SHALL draw, from the square it began on along the row or column it
moves in, a line that way in each square it reaches; a drag started on a
line that way SHALL clear them instead. A hand-written Sticks' save is not
read (the owner's decision, 2026-11-22).

#### Scenario: Dragging draws a line, and clears it

- **WHEN** the pointer is dragged across two empty squares of a row, and then
  the same drag is made again
- **THEN** the first draws a horizontal line in both, and the second clears
  them

### Requirement: Hint: Sticks draws a hint's evidence with the fill engine's marks

A step SHALL ring the square it decides and draw its evidence with the fill
engine's hint marks (`described-fill-game`): the number or block the step is
about outlined apart, in the color of the words that name it, and the
squares its reason rests on outlined, as many as the words count.

#### Scenario: The 0 block

- **WHEN** a step makes the square beside a 0 block vertical
- **THEN** the 0 block is ringed apart, and the square is ringed as the one
  the step decides

### Requirement: Hint: The Sticks hint carries on from its last step, then column by column

The hint SHALL take, of the firings the ladder could make, the one that
carries on from the squares its last step read and decided, and otherwise
the first in the ladder's order: the squares column by column from the left,
each column from the top.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 5×5 board `3bB1b5c2aB3c2a2_2aB2b1` with
  no line placed
- **THEN** the first step makes the top-left square, the 3, horizontal, since
  a vertical line there would leave it too little room
- **AND** the next two make the second and third squares of the top row
  horizontal, both by that 3, and the step after them reasons from the 1
  block

### Requirement: Status bar: The Sticks status bar counts the block numbers left

The status bar SHALL read `Clues left: {n}`, counting the shown block
numbers not yet met with every side decided, and SHALL be empty once none is
left. A line's number is never counted.

#### Scenario: A board as dealt, and solved

- **WHEN** the 7×7 board `c5b2a2aB1a6a2_4dBB_3B2aB1aBB0e2cB2d2_3c4`, with
  five numbered blocks, is opened, and then solved
- **THEN** the status bar reads "Clues left: 5", and then is empty

## REMOVED Requirements

### Requirement: Params: Sticks refuses, for a deal only, a block percentage outside 5 to 100 and a quarter-turn symmetry off a square

**Reason**: The block percentage is a description option, whose range is
held wherever it is written; stated in "Params: Sticks refuses a block share
outside 5 to 100, and, for a deal only, a quarter-turn symmetry off a
square".

**Migration**: None: no game ID upstream writes carries a percentage.

### Requirement: Params: Sticks refuses Unreasonable where no board needs it

**Reason**: The bound is the description's; stated in "Params: Sticks deals
Unreasonable only on a board of five squares or more". The walk over every
2×2 board ran the hand-written solver.

**Migration**: None.

### Requirement: Generation: Uniqueness is held by a count, and not by the solver's verdict alone

**Reason**: Uniqueness is the fill engine's search (`described-fill-game`),
tested there for every born game.

**Migration**: None.

### Requirement: Solver: Sticks' search assumes the first blank square's line across, then up and down

**Reason**: The search is the fill engine's, the same for every born game.

**Migration**: None.

### Requirement: Controls: A Sticks drag draws along its dominant axis

**Reason**: The drag is the fill engine's for values along an axis; stated
in "Controls: A Sticks drag draws along the row or column it moves in". A
drag keeps to one row or column, where the hand-written one could turn.

**Migration**: None.

### Requirement: Hint: A Sticks hint's marks count out against the words

**Reason**: A step's marks are the fill engine's; stated in "Hint: Sticks
draws a hint's evidence with the fill engine's marks". The forced square is
ringed, not drawn as a line in the hint color.

**Migration**: None.

### Requirement: Hint: The Sticks hint carries on from its last step, by the rules in order

**Reason**: The order is the fill engine's, column by column; stated in
"Hint: The Sticks hint carries on from its last step, then column by
column".

**Migration**: None.
