## ADDED Requirements

### Requirement: Unruly's difficulty letters are t, e and n

The difficulty char SHALL be `t` for Easy, `e` for Normal and `n` for Tricky.
A params string with no `d` SHALL decode as Easy. One whose `d` is followed by
any other character, or by nothing, SHALL decode to a difficulty that names no
tier, which the engine's params check refuses.

#### Scenario: The unique board of the Type menu

- **WHEN** `8x8ude` is decoded
- **THEN** the board is 8×8 with unique rows and columns, at Normal
- **AND** encoding it without `full` gives `8x8u`

#### Scenario: A letter that names no tier

- **WHEN** `8x8dn`, an 8×8 board at Tricky, has its last letter changed to
  `z` and goes through the engine's params check
- **THEN** it is refused with "Difficulty must be one of Easy, Normal,
  Tricky."

### Requirement: Unruly's hint tries the simplest technique first

The hint SHALL try its techniques in this order: three in a row, a line with
one empty cell, a completed count, on a `unique` board the unique-rows
conflict, and the near-complete line. It SHALL take every cell the first of
them that fires forces in one pass over the board, and then start again from
the first. It SHALL try all of them whatever tier the board was dealt at. A
line with one empty cell SHALL be told as a completed count.

#### Scenario: A pair and a full quota on one board

- **WHEN** one row holds two like pieces side by side with an empty cell
  beyond them, and another row already holds all its pieces of one kind with
  several cells empty
- **THEN** the step for the cell beside the pair comes before any step that
  fills the other row

#### Scenario: A row with one cell left

- **WHEN** a row holds all its pieces of one kind and all but one of the
  other, and no three in a row is pending
- **THEN** the step fills the last cell with the other kind, and its sentence
  says the row already holds all its cells of the first

### Requirement: An Unruly title says unique when rows and columns must differ

A board's label SHALL be its size and its tier, followed by `unique` when the
`unique` variant is on.

#### Scenario: The unique board of the Type menu

- **WHEN** the params `8x8ude` and `8x8dn` are labeled
- **THEN** they read "8x8 Normal, unique" and "8x8 Tricky"
