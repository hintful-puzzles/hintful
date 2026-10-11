## ADDED Requirements

### Requirement: A bar is read against a neighbor that is still undecided

In Adjacent mode the hint SHALL rule out of a cell each number that fits none
of the numbers still open in a neighbor: across a bar, a number with nothing
open one away from it there, and across a gap with no bar, a number that every
open number there equals or is one away from. It SHALL say "A bar joins this
cell to a neighbor with nothing open one away from" those numbers, or "No bar
joins this cell to a neighbor whose every open number clashes with" them.

#### Scenario: A bar beside a neighbor down to two numbers

- **WHEN** a bar joins a cell that can still be 1 to 5 to a neighbor whose
  open numbers are 1 and 2
- **THEN** 4 and 5 are ruled out of the cell and 3 is kept, the neighbor's 2
  being one away from it
- **AND** the sentence says the neighbor has nothing open one away from 4 or 5

#### Scenario: A cell with no pencil marks

- **WHEN** the step's cell has no pencil marks and the hint reads an unmarked
  cell as holding every number its row and column do not
- **THEN** the step pencils in the numbers left, and its sentence ends "so
  pencil in only" those numbers after the same premise

### Requirement: Unequal's hint reasons no harder than the board's tier

The hint's recording solver SHALL be capped at the board's own tier, and at
Hard on an Unreasonable board, trying a lower tier's technique before a
higher one's. So a sign's bound and a bar beside a placed number SHALL be
offered from Normal up, a bar read against an undecided neighbor and a set
within one row or column from Tricky up, and one number's places across
several rows and columns, and the chain, at Hard.

#### Scenario: A Normal board in Adjacent mode

- **WHEN** a hint is asked on a board dealt from the params `5ade`, Adjacent
  5×5 at Normal
- **THEN** no step reads a bar against an undecided neighbor, and none is a
  set or a chain

#### Scenario: An Easy board has no clue strikes

- **WHEN** a hint is asked on a board dealt from the params `4dt`, 4×4 at Easy
- **THEN** no step reasons from a sign: each one places a number, as the last
  its row and column leave the cell or in the last cell of a row or column
  left for it
