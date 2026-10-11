## ADDED Requirements

### Requirement: A Mathrax description spells a run in lowercase and a clue in uppercase

Each part SHALL list its entries row by row: the squares, a `,`, then the
interior intersections. A letter `a` to `z` SHALL stand for a run of 1 to 26
empty entries, and a longer run SHALL be written as `z` and then the rest. A
given SHALL be its digit. A clue SHALL be `A`, `S`, `M` or `D` (add, subtract,
multiply, divide) followed by its number in decimal, or `E` or `O` (even, odd)
alone. The equality clue SHALL be written `S0`.

#### Scenario: A dealt size-5 board

- **WHEN** `e4p3a5,A6iA5bS1b` is read at size 5
- **THEN** the givens are a 4 at the start of the second row and a 3 and a 5
  in the third and fifth squares of the last row
- **AND** the clues are `6+` at the first intersection, `5+` at the third of
  the third row, and `1−` at the second of the last row

#### Scenario: The equality clue

- **WHEN** `m1g1c,aS2cS1S3dS0d` is read at size 5
- **THEN** the clue at the last intersection of the third row is drawn `=`

#### Scenario: A run longer than the alphabet

- **WHEN** a size-6 board with no given and no clue is written
- **THEN** the description is `zj,y`: 26 and 10 empty squares, then 25 empty
  intersections

### Requirement: A Mathrax clue number is one that two digits of the board can make

On a board of size `o`, the reading SHALL accept a sum from 2 to 2`o`, a
difference from 0 to `o`−1, a product from 1 to `o`², and a quotient from 2 to
`o`, and SHALL refuse any other. It SHALL refuse an arithmetic clue with no
number, an `E` or `O` followed by one, a description with no `,` after the
last square, and anything after the last intersection.

#### Scenario: The largest number of each kind on a size-3 board

- **WHEN** `i,A6S2M9D3` is read at size 3
- **THEN** it loads, with the clues `6+`, `2−`, `9×` and `3÷`

#### Scenario: A difference the digits cannot reach

- **WHEN** `i,S3c` is read at size 3
- **THEN** it is refused as a number out of range for the board

#### Scenario: A parity clue with a number

- **WHEN** `i,E5c` is read at size 3
- **THEN** it is refused at the `5`

### Requirement: Mathrax's params are the size, a tier letter and the clue-type letters

The params string SHALL be the size in decimal, then `d` and one of `e`, `n`,
`t`, `r` for the four tiers in order, then a letter for each enabled clue
type in the order `A` (addition), `S` (subtraction), `M` (multiplication),
`D` (division), `E` (equality), `O` (even/odd), and no letter when all six
are enabled. The short form SHALL be the size alone and SHALL decode to Easy
with every clue type. `decodeParams` SHALL read each clue letter once, in
that order.

#### Scenario: A restricted clue set

- **WHEN** `7dtAM` is decoded
- **THEN** it is a size-7 Tricky board with only addition and multiplication
  clues, and its short form is `7`

#### Scenario: Clue letters out of order

- **WHEN** `6dnDS` is decoded
- **THEN** only division is enabled, because `S` is looked for before `D`,
  and the params encode as `6dnD`

#### Scenario: The short form

- **WHEN** `5` is decoded and encoded in full
- **THEN** the result is `5de`

### Requirement: A Mathrax label names a restricted clue set by the shorter list

A params label SHALL say nothing of clue types when all six are enabled.
Otherwise it SHALL end, after a comma, with `only` and the enabled types when
they are no more than the disabled ones, and with `no` and the disabled types
when those are fewer, joined by `/` in the order of the Custom dialog. The
words SHALL be `addition`, `subtraction`, `multiplication`, `division`,
`equality` and `even-odd`.

#### Scenario: Two types enabled

- **WHEN** the params `7dtAM` are labeled
- **THEN** the label is "7x7 Tricky, only addition/multiplication"

#### Scenario: One type disabled

- **WHEN** `7dtASMDE`, size-7 Tricky params with every type but even/odd, are
  labeled
- **THEN** the label is "7x7 Tricky, no even-odd"

### Requirement: Mathrax's hint deduces at the tier of the board's params

The recording solve SHALL run at the tier the board's params name, and at
Tricky where they name `Unreasonable`, so a hint uses no deduction its board's
tier does not.

#### Scenario: A board whose params say Easy

- **WHEN** a hint is requested on a board whose params name Easy
- **THEN** the recording solve runs at Easy, so no step is a set elimination
  or a chain, and an arithmetic clue is read only where one digit is left
  across it

## MODIFIED Requirements

### Requirement: Mathrax input and keypad

Mathrax SHALL be played with the Solo-style control scheme: a cell is selected
by left-click or cursor, for ink outside pencil mode and for pencil marks in
it; digit keys enter a value or toggle a pencil mark; and backspace, space or
zero clear. In pencil mode no key SHALL change a cell that holds a digit.
Immutable given cells SHALL NOT be editable. The on-screen keypad SHALL offer
the digits 1 to the grid size and a clear key.

#### Scenario: A digit is entered into a selected cell

- **WHEN** an empty mutable cell is selected and a digit within range is typed
- **THEN** that digit is placed in the cell

#### Scenario: A given takes no entry

- **WHEN** the cursor is on a given cell and a different digit is typed
- **THEN** no move is made

#### Scenario: A clear key in pencil mode on a filled cell

- **WHEN** pencil mode is on, the cursor is on a cell holding a digit, and
  Backspace is pressed
- **THEN** no move is made and the digit stays
