## ADDED Requirements

### Requirement: Facing Towers clues that sum to one more than the grid size place the tallest tower

Where the clues at the two ends of a row or column sum to one more than the
grid size, the line climbs to its tallest tower from both ends, so a step SHALL
place the tallest height in the cell that is as many cells from a clue as that
clue's number. It SHALL outline both clues, stripe their line and say "These
facing clues sum to one more than the grid size, so their line's tallest is
pinned".

#### Scenario: A 2 facing a 3 on a 4×4 board

- **WHEN** a row of a 4×4 board has 2 at its left end and 3 at its right, as
  the top row of `2/1/2/4/2/4/2/1/2/3/1/3/3/2/2/1` has
- **THEN** the facing pair puts height 4 in that row's second cell from the
  left

### Requirement: A Towers clue one short of its count keeps the short heights from the cell beside it

Where the towers a clue already sees, taking the placed heights from the
tallest down until one is missing and counting each that stands nearer the clue
than the last, number one fewer than the clue, the cell beside the clue holds
the last tower it sees. A step SHALL strike from that cell as many of the
shortest heights as there are cells between it and the nearest tower counted,
leaving out a height that stands at or behind that tower ("Clue 2 already sees
all but one of its towers").

#### Scenario: The tallest tower stands fourth from a clue of 2

- **WHEN** a clue of 2 on a 5×5 board has height 5 in the fourth cell of its
  line and no other tower in it
- **THEN** heights 1 and 2 are struck from the cell beside the clue, one for
  each of the two cells between

### Requirement: A Towers height is struck from the cells too near a clue to hide it

For a clue of `c`, taking the heights from the tallest down, a step SHALL
strike the first from the `c − 1` cells nearest the clue, the next from the
nearest `c − 2`, and so on, one leg a height ("Clue 3 sees exactly 3 towers
along its line; height 5 so near it would hide too many"). A placed height
SHALL be passed over, taking no place in that count, exactly when a placed
height at least two taller stands nearer the clue; one hidden only by the
height next above it SHALL take its place.

#### Scenario: A clue of 3 on an empty 5×5 line

- **WHEN** a clue of 3 looks along a line of a 5×5 board with no tower in it
- **THEN** height 5 is struck from the two cells nearest the clue and height 4
  from the nearest one

#### Scenario: A 3 behind the 5 is passed over

- **WHEN** a clue of 4 looks along a line of a 5×5 board whose fourth cell
  holds 5 and whose fifth holds 3
- **THEN** height 4 is struck from the two cells nearest the clue and height 2
  from the nearest one, the 3 having taken no place

### Requirement: A Towers height that no arrangement of a clue's line allows is struck

For a clue, the hint SHALL consider every order of heights along its line that
the cells' remaining heights allow and that shows exactly the clue's count of
towers, and a step SHALL strike a height from a cell where none of them puts
it ("No way for clue 2 to show exactly 2 towers along its line puts height 4
here"). The step SHALL count every cell of the line as read, since each one's
remaining heights decide which orders are allowed.

#### Scenario: A clue of 2 on a 3×3 line

- **WHEN** a clue of 2 looks along a line of a 3×3 Normal board whose cells
  hold every height in their notes, but for 3 struck from the cell beside the
  clue as too near it
- **THEN** height 2 is struck from the middle cell, since with 2 there the
  line reads 1, 2, 3 and shows three towers, or 3, 2, 1 and shows one
- **AND** on an Easy board no arrangement strikes it

### Requirement: Towers' clue eliminations are tried a facing pair first and arrangements last

The deductions `hint` narrates SHALL be found in this order, beginning again
after each: first every facing pair; then, for each clue in turn, those above
the grid, below it, to its left and to its right, the clue one short of its
count and then the heights too near it; the row and column singles; and only
then, on a board above Easy, a clue's arrangements, ahead of the sets. `hint`
SHALL use no deduction above the board's own tier, and never a search.

#### Scenario: An Easy board never hears of arrangements

- **WHEN** the hint is followed on the Easy 4×4 board
  `2/1/2/4/2/4/2/1/2/3/1/3/3/2/2/1` with nothing entered
- **THEN** once the notes are set up its first strike is a too-near one
  ("Clue 3 sees exactly 3 towers along its line; height 3 so near it would
  hide too many")
- **AND** no step of the plan speaks of an arrangement, a set or a chain
