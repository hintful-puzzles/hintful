## ADDED Requirements

### Requirement: Clusters writes its difficulty as `de` or `dt`

The full params form SHALL follow the width and height with `d` and the
tier's letter, `e` for Easy and `t` for Normal. The short form SHALL leave the
difficulty out.

#### Scenario: The Normal preset's two forms

- **WHEN** `7x7dt` is decoded
- **THEN** it is a 7×7 board at Normal, whose short form is `7x7`
- **AND** `7x7` decoded and encoded in full is `7x7de`

### Requirement: A Clusters description closes in lowercase and keeps a skip in its dot's case

The letter that closes a description, standing for the blank cells after the
last dot, SHALL be lowercase. A `z` or `Z` skip SHALL be in the case of the
dot that ends its run of blanks. A description that closes in uppercase, or
that changes case between a skip and its dot, SHALL be refused: `newDesc`
writes neither.

#### Scenario: The board the first preset deals

- **WHEN** `DceclHbAacAg` is read for `7x7`
- **THEN** its `D` puts a blue dot on the fourth cell, after three blanks, and
  its closing `g` leaves the last six cells blank
- **AND** `DceclHbAacAG`, the same with its closing letter in uppercase, is
  refused for the `G`

### Requirement: Clusters' number keys set the cursor's square outright

With the cursor shown, `1` SHALL color its square blue, `0` or `2` SHALL color
it red, and Backspace or Delete SHALL clear it. Each SHALL set the square to
that state whatever it held, where a click cycles it, and SHALL make no move
on a given dot or on a square already so. With the cursor hidden, the key
SHALL only show it.

#### Scenario: A key does not cycle

- **WHEN** the cursor is on a blue square and `1` is pressed twice
- **THEN** no move is made and the square stays blue, where two left clicks
  would have cleared it

### Requirement: An arrow with Shift or Ctrl paints the squares the cursor leaves and enters

An arrow pressed with Shift SHALL move the cursor and color red both the
square it left and the square it entered; with Ctrl, blue; with both, it SHALL
clear them. A given dot and a square already in that state SHALL be skipped,
and what is painted SHALL be one move. Where the grid's edge stops the cursor,
the square it stays on SHALL still be painted. A hidden cursor SHALL be shown
and SHALL paint on that same press, from where it was parked.

#### Scenario: A row painted from the keyboard

- **WHEN** the cursor is on the first of three empty squares in a row and
  Ctrl with the Right arrow is pressed twice
- **THEN** all three squares are blue, the first press having painted two of
  them and the second one more

#### Scenario: The first press on a hidden cursor

- **WHEN** `DceclHbAacAg` is opened for `7x7`, whose first three squares are
  empty, and Shift with the Right arrow is pressed before any other key
- **THEN** the cursor shows on the second square of the top row, and the first
  two squares are red

#### Scenario: The run passes over a dot

- **WHEN** Shift with an arrow moves the cursor from an empty square onto a
  given dot
- **THEN** the square left is red, the dot is unchanged, and the cursor is on
  the dot
