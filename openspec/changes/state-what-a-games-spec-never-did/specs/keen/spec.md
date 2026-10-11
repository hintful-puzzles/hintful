## ADDED Requirements

### Requirement: A multiplication-only 9×9 Keen is not dealt above Tricky

When a board is to be generated, `validateParams` SHALL refuse a 9×9
multiplication-only puzzle at Hard or Unreasonable, in the collection's
sentence for boards too rare to deal, because such a board exists and takes
too long to find. Every other size SHALL be dealt with multiplication only at
every tier its size has, and a 9×9 with every operation SHALL be dealt at
every tier.

#### Scenario: A multiplication-only 9×9 Hard is asked for

- **WHEN** `9dxm` is decoded and `validateParams` is called with `full = true`
- **THEN** it returns "Hard 9x9 puzzles with multiplication only are too rare
  to deal."
- **AND** called with `full = false` it returns null

#### Scenario: The tier below, and the size below

- **WHEN** `9dhm`, a multiplication-only 9×9 Tricky, or `8dxm`, a
  multiplication-only 8×8 Hard, is validated with `full = true`
- **THEN** it is not refused

### Requirement: A Keen clue's value is one its cage could make

A desc SHALL be refused, as holding a number out of range for its board, when
a clue's value is outside what its operation could make of the cage: `1` to
the cage's area times `w` for an addition clue, `1` to `w` raised to the
cage's area for a multiplication clue, `1` to `w − 1` for a subtraction clue,
and `2` to `w` for a division clue. A value inside the range SHALL load
whether or not any digits make it.

#### Scenario: A dealt 4×4 board

- **WHEN** `__a__a_ba_a__a_b,m3d2s2a5m12s1a7` is loaded on `4de`
- **THEN** the board has seven cages, and the first, the two cells at the top
  of the left column, must multiply to 3
- **AND** the three-cell cage down the right column must multiply to 12

#### Scenario: A ratio of one

- **WHEN** that desc is loaded with its `d2` changed to `d1`
- **THEN** it is refused: "This game ID has a number out of range for its
  board."

#### Scenario: A product no two digits make

- **WHEN** that desc is loaded with its `m3` changed to `m5`
- **THEN** it loads, since 5 is no more than 16

### Requirement: A Keen repeat count below three is refused

A decimal repeat count in the block structure SHALL be at least 3 and at most
the number of internal grid lines plus one. A count outside that SHALL refuse
the desc as holding a number out of range for its board, so two of the same
letter are only ever the letter written twice.

#### Scenario: A letter followed by 2

- **WHEN** `__a__a_ba_a__a_b,m3d2s2a5m12s1a7` is loaded on `4de` with its
  leading `__` changed to `_2`
- **THEN** it is refused: "This game ID has a number out of range for its
  board."

### Requirement: A Keen label ends in multiplication only for a product-only puzzle

The label of a multiplication-only params set SHALL be its size and tier
followed by ", multiplication only". The label of any other params set SHALL
be its size and tier alone.

#### Scenario: The multiplication-only preset

- **WHEN** the label of `6dnm` is asked for
- **THEN** it is "6x6 Normal, multiplication only"
- **AND** the label of `6dn` is "6x6 Normal"

### Requirement: Keen's hint deduces at the tier of the board's params

The hint's recording solve SHALL run at the tier of the board's own params,
capped at Hard, so a hint step on a board never rests on a deduction above
the tier the board was dealt at.

#### Scenario: A hint on a Normal board

- **WHEN** a hint is asked for on a board of `6dn`
- **THEN** the recording solver runs with its cap at Normal
- **AND** no step it records is a set deduction or a forcing chain

## MODIFIED Requirements

### Requirement: Keen interprets digit, pencil, and mark-all input

With a cell highlighted, a digit key `1..w` SHALL enter that digit, or in
pencil mode toggle that pencil mark, and backspace or space, which is the
cursor-select2 key, SHALL clear the cell. The `0` key SHALL clear the cell as
they do, and a digit key above `w` SHALL do nothing. In pencil mode no key
SHALL change a cell that holds a digit.

#### Scenario: Placing and penciling digits

- **WHEN** a cell is highlighted and a digit key is pressed
- **THEN** that digit is placed in the cell, or in pencil mode its pencil mark
  is toggled

#### Scenario: A digit the grid does not hold

- **WHEN** a cell of a 4×4 board is highlighted and `5` is pressed
- **THEN** nothing changes
- **AND** with pencil mode off, `0` pressed on a cell holding a digit empties
  it

#### Scenario: A clear key in pencil mode on a filled cell

- **WHEN** pencil mode is on, the cursor is on a cell holding a digit, and
  Backspace is pressed
- **THEN** no move is made and the digit stays
