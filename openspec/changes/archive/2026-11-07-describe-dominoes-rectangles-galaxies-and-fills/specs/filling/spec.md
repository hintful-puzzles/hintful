## MODIFIED Requirements

### Requirement: Rules: A Filling grid is solved when every cell equals its region's size

Filling is Fillomino on a `w × h` grid: every cell is filled with a number `n`
such that each maximal orthogonally-connected region of equal numbers contains
exactly `n` cells. A state SHALL report `solved` when its description's rules,
compiled, hold of the board, every given number standing, and not before.

#### Scenario: A full grid with an oversized region is not a solution

- **WHEN** every cell is filled and one connected region of 3s holds four cells
- **THEN** the board is not solved

### Requirement: Generation: Filling generates uniquely solvable boards

`newDesc` SHALL deal a board whose regions are no larger than
`min(max(max(w,h),3), 9)` cells. At Easy it SHALL publish only a clue set from
which the ladder still solves the board.

#### Scenario: Every generated board is solvable

- **WHEN** an Easy board is generated for any preset
- **THEN** the ladder fills every cell
- **AND** each resulting region's size equals its number

### Requirement: Solver: Filling solver deduces the unique solution

The solver SHALL run the ladder Filling's description states, compiled, to a
fixpoint: a region grows into every square it cannot reach its size without,
or into its one square to grow into; a number is ruled out of a square where
it would make a region past its size, where too few squares around could hold
a region of it, or where it is too far from every square of it with too
little room for a new region; and a square with one number left takes it.
Each technique SHALL be checked sound, and SHALL read only the numbers on the
board.

#### Scenario: Solver completes a generated board

- **WHEN** the solver runs on a freshly generated puzzle's clues
- **THEN** it reports solved
- **AND** the produced board has every region sized to its number

#### Scenario: Upstream's boards are solved

- **WHEN** the solver runs on each board upstream's generator dealt
- **THEN** it reports solved

### Requirement: Solver: Filling's search assumes each number an empty square can still take

Filling's search for a clue set's answers SHALL run over the ladder, assuming
each number an empty square can still take where the ladder stops. Its budget
SHALL be 2,000 positions, and SHALL NOT be lowered: a board already dealt,
which a saved game holds, loads only within it.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the ladder finishes, on a 5×5 with one
  answer that it does not reach, on an empty 3×1 and on a 3×1 of three 2s
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by writing numbers into the
  empty squares one at a time
- **THEN** the search reports one answer exactly where one filling fits,
  several where more do and none where none does

### Requirement: Solver: Filling's solver run says when a position is impossible

A position SHALL be reported contradictory where the ladder finds a region
past its number's size, a region walled in short of it, or a square no number
fits, and where every square is filled and the rules do not hold; and solved
only where every square is filled and they do.

#### Scenario: A region past its size, and one shut in short

- **WHEN** the search is given one position to try on `3x1:222`, `3x1:121`
  and `4x1:13a1`
- **THEN** it reports no answer for each
- **AND** on an empty 3×1 it reports that it stopped

### Requirement: Hint: A cell no growth group covers is forced on its own

Cells no region-growth group covers SHALL be forced individually: a region's
one square to grow into, or a square with one number left once the others are
ruled out, narrated as a lonely 1 where every neighbor is filled and the number
is 1, and otherwise as every other number breaking the rule.

#### Scenario: A lonely cell is one step

- **WHEN** the next forced cell is one no neighboring region can grow into
- **THEN** the step fills that single cell with a 1, and its narration says it
  can only be a 1

## REMOVED Requirements

### Requirement: Hint: Filling's hint keeps what the solver deduces from the clues alone

**Reason**: Upstream's candidate elimination stalled on positions with more of
the answer filled in, and the hint fell back on the solver's run from the
clues. The compiled ladder finishes from every correct position of a board it
finishes from its clues, so there is nothing to fall back on.

**Migration**: "Hint: Filling's hint finishes every mistake-free position of a
board the ladder finishes".

## ADDED Requirements

### Requirement: Hint: Filling's hint finishes every mistake-free position of a board the ladder finishes

The plan SHALL be the ladder's firings from the player's numbers, and on a
board the ladder finishes from its clues it SHALL fill every empty square of
any mistake-free position, whatever order its squares were filled in.

#### Scenario: A position the player filled in their own order

- **WHEN** any share of the answer of
  `7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b` is filled in and `hint` is
  asked
- **THEN** the plan fills every empty square with the answer's number
