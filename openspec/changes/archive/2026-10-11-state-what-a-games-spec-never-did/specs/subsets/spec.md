## ADDED Requirements

### Requirement: A Subsets set number adds up its letters, and an arrow is written on the bigger set's cell

A given cell's number SHALL be the sum of its set's letters, A as 1, B as 2, C
as 4 and D as 8, so that 0 is the empty set. An arrow letter SHALL be written
on the cell whose set contains its neighbor's, and SHALL name the side that
neighbor is on. A cell's arrow letters SHALL come in the order `U`, `R`, `D`,
`L`, each at most once. `newState` SHALL refuse arrow letters in another
order, and a set given to two cells.

#### Scenario: A dealt board is read

- **WHEN** `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10` is read
- **THEN** the top-left cell is given the set {A,C,D}, which contains the set
  of the cell to its right and the set of the cell below it
- **AND** the third cell is given {B,C} and the last cell {B,D}

#### Scenario: Letters out of order, and a set given twice

- **WHEN** the `13RD` of that description is changed to `13DR`, or its `6R` to
  `13R`
- **THEN** the first is refused as having an `R` where it cannot have one, and
  the second as giving the same number twice

### Requirement: Subsets params are written `4x4n4` and a difficulty letter

`encodeParams` SHALL write the width, `x`, the height, `n` and the universe
size, and in the full form `d` and the tier's letter after them: `e` for Easy
and `t` for Normal. `decodeParams` SHALL read a width with no `x` as a square,
a string with no `n` as four letters, and a string with no `d` as Easy.

#### Scenario: The Normal preset and its short form

- **WHEN** the Normal preset is encoded in full and without the difficulty
- **THEN** the results are `4x4n4dt` and `4x4n4`
- **AND** `4x4n4` decodes as the Easy board

### Requirement: A Subsets preset is titled by its board and its tier

Each preset SHALL be titled `4x4 Size 4` and then its tier's name, where Size
is the number of letters the sets are drawn from.

#### Scenario: The Type menu

- **WHEN** the presets are listed
- **THEN** they read "4x4 Size 4 Easy" and "4x4 Size 4 Normal", for the params
  `4x4n4de` and `4x4n4dt`

### Requirement: The Subsets hint carries a letter across a horseshoe

Where a letter is marked present in the cell at a horseshoe's closed end and
not in the cell at its open end, a step SHALL mark it present there ("…has C
marked, so C must be here too"). Where a letter is cleared at the open end and
not at the closed end, a step SHALL clear it there ("…which has no B, so B
can't be here either"). The step SHALL ring the letter it decides and outline
the cell across the horseshoe, and several letters from one horseshoe SHALL be
one journey.

#### Scenario: A given set clears a letter from the cell inside it

- **WHEN** a hint is asked for on
  `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10` with nothing marked
- **THEN** the first step clears B in the second cell of the top row, whose
  set lies inside the top-left cell's {A,C,D}

### Requirement: The Subsets hint reads the horseshoes before it counts sets

`hint` SHALL take the first of these that decides a letter, and begin again
after each: a horseshoe, taken by its open-end cell in reading order, a letter
to mark present there before one to clear across it; a set no cell holds that
the board lets into one cell only, lowest number first, placed there; a cell
whose remaining sets agree on a letter; a set whose remaining cells are one.
The last two SHALL be tried without the rule above the lowest tier before they
are tried with it.

#### Scenario: A horseshoe is read while a set has one cell left

- **WHEN** a board shows both a letter that a horseshoe carries across and a
  set that can go in one cell only
- **THEN** the next step is the horseshoe's

### Requirement: A Subsets hint refuses a letter the answer does not have

Where a letter the player has marked present or cleared differs from the
board's solution, or the hint's own deduction from the player's marks ends in
a contradiction, `hint` SHALL refuse with the collection's sentence that the
entries contradict each other.

#### Scenario: A letter marked where the answer has none

- **WHEN** B is marked present in the second cell of
  `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10`, where the answer has no
  B, and a hint is asked for
- **THEN** the hint is refused: "These entries contradict each other, so one
  of them must be wrong. Undo, or clear the ones you are unsure of."
