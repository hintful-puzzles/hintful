## ADDED Requirements

### Requirement: Ascent's hint reads the arrows' lines in Edges mode

In Edges mode the hint SHALL offer two techniques no other mode offers, each
listed ahead of the run techniques of its tier. `lines` SHALL place a number when
exactly one empty square is on its arrow's line and within `k` steps of an empty
square on the line of each missing number `k` places from it, and of each
placed number as far as it is in the sequence; the sentence SHALL name the
number's line and each premise it needs, at least one of them a line, SHALL
outline the arrows and placed numbers named and SHALL stripe the lines of the
other numbers named. It is a Normal technique. `pointers` SHALL place a number in
a square when every other missing number whose arrow points at the square, or
that has none, fails such a premise there; the sentence SHALL name those numbers
and, when it fits in 120 characters, each one's reason. It SHALL outline every
such arrow and stripe the lines that rule the others out. It is Tricky when the
number has a placed neighbor in the sequence and Hard otherwise. Neither
technique SHALL change a hint on a board of any other mode.

#### Scenario: Three arrows single out a square

- **WHEN** 12's arrow points along a column, 11's along a row and 13's along
  another row two rows below it, and one empty square of 12's column is within a
  step of both rows
- **THEN** the step places 12 there, names its column and the two rows, and
  stripes the two rows

#### Scenario: Only one arrow pointing at a square still fits

- **WHEN** of the missing numbers whose arrows point at a square, all but one
  are too far from a line or number they must be near
- **THEN** the step places that one, names the others, and outlines every arrow
  pointing at the square

#### Scenario: The other modes keep their hints

- **WHEN** a hint is asked on a Rectangle, Hexagon or Honeycomb board
- **THEN** neither Edges technique is tried

### Requirement: Ascent's presets are grouped by kind of board

The Type menu SHALL list the rectangle presets at the top level, the Honeycomb
and Hexagon presets under one heading "Hex", and the Edges presets under their
own heading "Edges". It SHALL offer one size of each hexagonal shape, Normal to
Hard; other sizes are Custom's.

#### Scenario: Edges has its own heading

- **WHEN** the player opens Ascent's Type menu
- **THEN** the Edges presets are under an "Edges" heading after "Hex", not
  among the rectangle presets

## MODIFIED Requirements

### Requirement: Ascent's square grids turn and its hexagonal grids do not

Ascent's square-grid presets SHALL be upstream's turned to draw taller than wide (6×7 and 8×10), and its Honeycomb preset, which cannot be turned, SHALL be 6×8: the nearest size to upstream's 7×6 that draws taller than wide. `transposeParams` SHALL turn the square-grid modes and return `null` for Hexagon and Honeycomb, because a hexagonal grid on its side is another grid. Hexagon mode's board is a regular hexagon, wider across its corners than across its flats at every size, and SHALL be recorded as wide by nature in the portrait guard's ledger.

#### Scenario: A hexagonal board is never turned

- **WHEN** `transposeParams` is asked to turn Honeycomb or Hexagon params
- **THEN** it returns `null`
