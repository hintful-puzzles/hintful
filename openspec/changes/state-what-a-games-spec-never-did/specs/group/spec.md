## ADDED Requirements

### Requirement: Group's params are a size, a tier letter and an identity flag

The params encoding SHALL be the size in decimal, then in the full form `d`
and the tier's letter (`t` Easy, `n` Normal, `h` Tricky, `x` Hard, `u`
Unreasonable), then `i` when the identity is hidden. The short form SHALL
leave out the tier and keep the `i`. Decoding SHALL read a string with no `d`
as Normal and one with no `i` as showing the identity, SHALL pass over a
character it does not know, and SHALL give a `d` followed by no tier letter a
tier that the engine refuses.

#### Scenario: A preset that hides its identity

- **WHEN** `8dni` is decoded
- **THEN** it is an 8×8 board at Normal with the identity hidden, and its
  short form is `8i`

#### Scenario: The tier letters are not the tier's initials

- **WHEN** `8dh` is decoded
- **THEN** it is an 8×8 board at Tricky, not Hard, with the identity shown

#### Scenario: A letter that is no tier

- **WHEN** the `h` of `8dh` is changed to `q`
- **THEN** the params are refused, the refusal listing the five tiers

### Requirement: With the identity shown, number 1 is lettered e

With the identity shown, the number 1 of a description SHALL be lettered `e`,
the numbers 2 to 5 `a` to `d`, and each number above 5 by its place in the
alphabet. With the identity hidden every number SHALL be lettered by its place
in the alphabet. A letter the player types SHALL be read back the same way.

#### Scenario: The top row of a dealt board

- **WHEN** `1_2_3_4_5_6_2a6a3a3d5_4a1b2_5_3b1a6e` is opened under `6dt`
- **THEN** its top row, the numbers 1 to 6, reads `e a b c d f`
- **AND** the same six numbers on a board that hides its identity read
  `a b c d e f`

#### Scenario: A 3×3 board has no c

- **WHEN** a 3×3 board that shows its identity is opened
- **THEN** its three elements are lettered `e`, `a` and `b`

### Requirement: A letter key enters its element, and only a capital M marks all

A letter key, capital or small, SHALL enter the element it letters in the
selected cells, or toggle that element's pencil mark in pencil mode; a letter
no element of the board has SHALL be declined. Capital `M` SHALL be Mark-all
and never an element, and small `m` SHALL never be Mark-all, since it is the
thirteenth element on a board large enough. The keypad SHALL offer a key for
each element, in the order of their numbers, then Clear.

#### Scenario: The keypad of a board that shows its identity

- **WHEN** the keypad is asked for under `6dt`
- **THEN** its keys are `e`, `a`, `b`, `c`, `d`, `f` and Clear

#### Scenario: A small m on a small board

- **WHEN** `m` is pressed with a cell selected on a 6×6 board
- **THEN** no move is made, and no pencil marks are filled in

### Requirement: Backspace, Space and Clear empty the selected Group cells

Backspace, Space and the keypad's Clear SHALL empty the selected cells of
their letter and of their pencil marks, as one move. In pencil mode they SHALL
leave a cell that holds a letter as it is, and in either mode a given.

#### Scenario: Space on a cell that holds only marks

- **WHEN** an empty cell with pencil marks is selected and Space is pressed
- **THEN** the cell's marks are gone, and one undo brings them back
