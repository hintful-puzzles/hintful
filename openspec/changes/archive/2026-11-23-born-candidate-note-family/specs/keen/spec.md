## MODIFIED Requirements

### Requirement: Params: Keen's parameters

Keen's params SHALL be a grid size `w`, one of the tiers Easy, Normal,
Tricky, Hard or Unreasonable, and whether every cage's clue is a product
(multiplication only), as its description states them. The default board
SHALL be 6×6 at Normal, upstream's.

#### Scenario: The Tricky preset

- **WHEN** `6dh` is decoded
- **THEN** it is a 6×6 board at Tricky, labeled "6x6 Tricky"

### Requirement: Params: Keen's params encoding

Params SHALL be encoded `{w}` without `full` and `{w}d{c}{m?}` with `full`,
where `c` is `e`, `n`, `h`, `x` or `u` for the five tiers in order and a
trailing `m` marks a multiplication-only puzzle. A string with no `d` SHALL
decode as Normal, and one with no `m` as a puzzle with every operation. An
`m` before the tier SHALL make the string unreadable.

#### Scenario: A string with no tier

- **WHEN** `6` is decoded
- **THEN** it is a 6×6 board at Normal with every operation, whose full form
  is `6dn`

#### Scenario: Params round-trip

- **WHEN** a 6×6 board at Tricky with every operation is encoded with
  `full = true`
- **THEN** the result is `6dh`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`
- **AND** a multiplication-only puzzle's full encoding ends with `m`

### Requirement: Params: A 3×3 Keen is not dealt above Normal

When a board is to be dealt, a 3×3 puzzle at any tier above Normal SHALL be
refused, in the collection's sentence for a size that has no board of the
tier, because no 3×3 board needs more than Normal.

#### Scenario: A 3×3 Tricky is asked for

- **WHEN** a board of `3dh` is to be dealt
- **THEN** it is refused: "No 3x3 puzzle is Tricky."

### Requirement: Description: A malformed Keen description is refused

A desc SHALL be refused when its block structure is malformed, when it gives
the wrong number of clues, when a clue tag is unrecognized, and when its clues
have no answer, as a subtraction or division clue on a cage that is not two
cells has none.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with a malformed block structure, too few or too many clues,
  or an unknown clue tag is loaded
- **THEN** it is refused with a non-null error string

#### Scenario: A subtraction clue on a cage of three cells

- **WHEN** `aa_a_aa_ba_5a,d2s1s2m4d2m6s2` is loaded on `4de`, a difference on
  its cage of three cells
- **THEN** it is refused: "The clues in this game ID contradict each other."

### Requirement: Description: A Keen clue's value is one its cage could make

A desc SHALL be refused, as holding a number out of range for its board, when
a clue's value is outside what its operation could make of the cage: `1` to
the cage's area times `w` for an addition clue, `1` to `w` raised to the
cage's area for a multiplication clue, `1` to `w − 1` for a subtraction clue,
and `2` to `w` for a division clue. A desc whose clues, each in range, have
no answer or more than one SHALL be refused too, as every born game's is.

#### Scenario: A dealt 4×4 board

- **WHEN** `__a__a_ba_a__a_b,m3d2s2a5m12s1a7` is loaded on `4de`
- **THEN** the board has seven cages, and the first, the two cells at the top
  of the left column, must multiply to 3
- **AND** the desc is written back byte for byte

#### Scenario: A ratio of one

- **WHEN** that desc is loaded with its `d2` changed to `d1`
- **THEN** it is refused: "This game ID has a number out of range for its
  board."

#### Scenario: A product no two digits make

- **WHEN** that desc is loaded with its `m3` changed to `m5`
- **THEN** it is refused, since its clues have no answer: "The clues in this
  game ID contradict each other."

### Requirement: Generation: A Keen cage has at most six cells and a balanced mix of clues

Every cage SHALL have area two to six, laid at random as dominoes and the
cells left over joined to a neighbor (upstream's), and the deal SHALL give
each cage one clue, dealing ratios, differences, products and sums in turn
so each is about as common as the cages allow. A clue that leaves its cage
little choice SHALL be dealt only where no other kind suits, and every
value a cage makes SHALL be dealable, however large.

#### Scenario: A poor clue

- **WHEN** a cage of two cells could take a sum too small or too large to
  leave a choice, or above Normal a product with as few ways to make it
- **THEN** that clue is dealt only where no other kind suits it, and a
  difference of `w − 1` or a ratio above half the size is never dealt

#### Scenario: The cages of a dealt board

- **WHEN** a board is dealt for given params
- **THEN** every cage has two to six cells, and every subtraction or division
  cage has area 2

#### Scenario: A large product

- **WHEN** a multiplication-only 5×5 board is dealt
- **THEN** a cage of three cells may carry a product above 31

### Requirement: Hint: Keen's hint is the shared candidate plan over rows and columns

Keen's hint SHALL be the fill board's candidate walk, built from its
description (`described-fill-game`), with no departure: the Latin library's
rungs and its own three cage techniques, each worded by the description, a
cage firing split into a leg a cell. The reading a fresh game starts on SHALL
be the one that pencils every candidate in first.

#### Scenario: A single on a Keen board

- **WHEN** a step places a digit because it fits one cell of its row
- **THEN** its sentence is the shared narrator's and names no cage

### Requirement: Look: The hint's ring and its outline are drawn in the gutter

The hint's ring SHALL circle the ringed cell's number or notes, as every born
game's does, and its outline SHALL follow the cells it names.

#### Scenario: A hint rings a cell inside a cage

- **WHEN** a hint rings a cell whose neighbor is in the same cage
- **THEN** a circle is drawn round the cell's notes

## REMOVED Requirements

### Requirement: Look: A cage's clue is drawn at its minimal cell

**Reason**: A born Keen draws a sign on every clue, a multiplication-only
puzzle's too, as every born game with clues at parts does.
**Migration**: "Look: A cage's clue is drawn with its sign at its first cell".

## ADDED Requirements

### Requirement: Look: A cage's clue is drawn with its sign at its first cell

Each cage's clue, its target value and its operation symbol, SHALL be drawn
at the top left of the cage's first cell in reading order, on every clue,
a multiplication-only puzzle's included. A clue SHALL be set at the largest
size, up to a quarter of the tile, that a hint's ring on its cell still
steps round: a five-character clue (`1440×`) always smaller, a
four-character one on a small tile.

#### Scenario: Cage clue is drawn

- **WHEN** a board is drawn
- **THEN** the cage clue text appears at each cage's first cell

#### Scenario: A multiplication-only puzzle shows its symbol

- **WHEN** a multiplication-only board is drawn
- **THEN** each clue is its target value followed by `×`

### Requirement: Look: A Keen cell's digit and notes sit below its clue

Every cell's notes and its digit SHALL be drawn below the line a cage's clue
takes, whether or not the cell holds a clue, so a clue never sits under a
digit and a row's digits stay level.

#### Scenario: A digit beside its cage's clue

- **WHEN** the player types a digit into a cage's first cell
- **THEN** the digit is drawn below the clue, and level with the digits
  beside it in its row

### Requirement: Controls: A Keen cage clue is marked done

A press on a cage's clue text, with a little slack, SHALL mark the clue done
(drawn gray) and a second press unmark it; a press elsewhere in the square
SHALL select it as before. Shift or Ctrl with an arrow key SHALL mark the
clue of the next cage that way from the cursor, so the key decides which,
as it does a sign's in Unequal. A clue marked done that breaks SHALL be
drawn red over the gray.

#### Scenario: Shift and an arrow

- **WHEN** the cursor is on a cell of a cage, another cage lies to its
  right, and Shift with the right arrow is pressed twice
- **THEN** that other cage's clue is marked done, and then unmarked, and
  the cursor's own cage's clue is unchanged

### Requirement: Description: Keen's text format prints each cage's clue

The text format SHALL draw the cages' walls and each cell's number, and
print each cage's clue, its value and its sign, after the row of the cage's
first cell, in the order of those cells, since a clue is wider than a cell.

#### Scenario: A 4×4 board as text

- **WHEN** `aa_a_aa_ba_5a,d2s1a9m4d2m6s2` on `4de` is copied as text
- **THEN** its first row of cells is followed by `2÷ 1−`
