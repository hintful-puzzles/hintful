## ADDED Requirements

### Requirement: Galaxies descriptions run-length encode the dots

A Galaxies description SHALL list the dots over the places a dot can be: the
centers, edges and corners of the squares, inside the border, `2w−1` to a row
and `2h−1` rows, in reading order. `a` to `y` SHALL be a white dot after 0 to
24 empty places, `A` to `Y` a black dot likewise, and `z` 25 empty places. The
empty places after the last dot are not written. `newState` SHALL refuse any
other character, an empty description, a place past the last, and a final `z`.

#### Scenario: A dealt 7×7 board

- **WHEN** `kebizmfzgbfvfu` is opened under `7x7dn`
- **THEN** the board has twelve dots, all white
- **AND** `k` puts the first after ten empty places, in the center of the
  sixth square of the top row, and `e` puts the second after four more empty
  places, in the next row of places, on the edge between the second square of
  the top row and the square below it

#### Scenario: A capital letter

- **WHEN** the first letter of that description is changed from `k` to `K`
- **THEN** the board loads with its dots in the same places, the first of them
  black

#### Scenario: A description that ends in a run

- **WHEN** a `z` is added to the end of that description
- **THEN** it is refused as too long for its board

### Requirement: Galaxies' short params form is the size alone

The full form of the params SHALL end in `d` and the tier's letter, `n` for
Easy and `u` for Unreasonable. The short form SHALL leave that segment out and
be the size alone, `WxH` even for a square board, so a string with no `d`
segment decodes as Easy.

#### Scenario: An Unreasonable preset in the short form

- **WHEN** `7x7du` is decoded and encoded in the short form
- **THEN** the result is `7x7`, which decodes as a 7×7 board at Easy

### Requirement: Galaxies refuses a size it cannot deal

Galaxies SHALL declare a width and a height of 3 to 100 each, so that the
engine refuses a value outside them. When a board is to be dealt,
`validateParams` SHALL refuse a 3×3 at Unreasonable, saying `No 3x3 puzzle is
Unreasonable.`, because no 3×3 board needs that tier. It SHALL NOT refuse
those params for a game ID that brings its own description.

#### Scenario: A 3×4 has Unreasonable boards

- **WHEN** a 3×4 at Unreasonable is to be dealt
- **THEN** `validateParams` does not refuse it

#### Scenario: A width of 2

- **WHEN** the width of `7x7dn` is changed to 2
- **THEN** the engine refuses it, saying `Width must be at least 3.`

### Requirement: A line cannot be drawn through a dot

An edge SHALL take no line where the line would cross a dot: an edge a dot
sits on, and an edge with a dot on the corner at either end. A click on such
an edge SHALL make no move, as SHALL Enter or Space on an edge that ends at a
dotted corner, and a wall drag SHALL pass such an edge by.

#### Scenario: A dot on a corner

- **WHEN** the player clicks one of the four edges that meet at a corner a dot
  sits on, or presses Enter with the cursor on one
- **THEN** no line is drawn and no history entry is added

### Requirement: The keyboard cursor steps by half a square

The keyboard cursor SHALL move over the same places a dot can be, one place
an arrow press, so that it stands in turn on a square, an edge and a corner,
and SHALL stop at the last place inside the border. Enter or Space on an edge
that holds no dot SHALL toggle its line as a click does; on a corner with no
dot they SHALL do nothing.

#### Scenario: From a square to its edge

- **WHEN** the cursor is on a square and the player presses Right once
- **THEN** the cursor is on the edge between that square and the next, and
  Enter there toggles that edge's line where no dot is on it or at its ends

### Requirement: The hint gives a dot the squares it sits on and the squares walled in with it

The hint SHALL give a dot every square it sits on that shows no arrow, saying
a galaxy covers the cells its dot sits on and naming the dot by the squares
given: between two, at the shared corner of four, else one they touch. It
SHALL give a free square to a galaxy when every way out of the square leads
into that galaxy, outlining the ways out, striping the galaxy, and saying "the
only way out" when there is one. A dot in the middle of one square needs no
arrow, and no step is shown for it.

#### Scenario: A dot on an edge

- **WHEN** a white dot sits on the edge between two squares and neither shows
  an arrow
- **THEN** the step reads that both these cells must belong to the white dot
  between them, and its one move puts an arrow in each

### Requirement: The hint settles a square only one dot can own

The hint SHALL settle a square when exactly one dot passes the test a
cell-to-dot drag rings its candidates by, marking none of the dots that fail
it. It SHALL settle a square only one galaxy can still stretch to, saying no
other galaxy reaches it and striping that galaxy's reach. Each step SHALL ring
the square, its partner and the dot.

#### Scenario: Every other dot mirrors the square off the board or onto a dot

- **WHEN** a drag from an empty square would ring exactly one dot, every other
  dot's mirror of the square lying off the board or on a dot, and no earlier
  deduction applies
- **THEN** the step says any other dot mirrors this cell off the board or onto
  a dot, so it and its partner must belong to the ringed dot

#### Scenario: Only one galaxy reaches a square

- **WHEN** one galaxy alone can still stretch to an empty square, and no
  earlier deduction applies, a square only one dot can own among them
- **THEN** the step says no other galaxy reaches this cell, so it and its
  partner must join the ringed dot, whose reach the stripes show

### Requirement: The hint takes a cut-off piece back to its dot through its one free square

Where squares pointing at a dot form a piece that does not hold the dot and
has exactly one free square beside it, the hint SHALL give that square to the
dot, striping the piece, ringing the square, its partner and the dot, and
saying the striped cells can reach their ringed dot only through this cell.

#### Scenario: One arrow with one way on

- **WHEN** a single square points at a dot it does not touch, and the board's
  edge and squares already settled leave one free square beside it
- **THEN** the step says the striped cell can reach its ringed dot only
  through this cell, so it and its partner must be that dot's too

### Requirement: The hint draws a wall between two galaxies and mirrors a wall through a dot

The hint SHALL ask for the wall between two neighboring squares settled on
different dots, saying they point at different dots, or "go with" them when
one of the two holds its dot and so shows no arrow. It SHALL ask for the wall
that mirrors, through a square's dot, a wall or a stretch of the board's edge
beside that square, outlining the two partner squares and the wall mirrored
and ringing the wall to draw. A square its dot is in the middle of is its own
partner.

#### Scenario: The wall to match is the board's edge

- **WHEN** a square settled on a dot lies against the board's edge and its
  partner's matching side has no wall
- **THEN** the step says the outlined cells are partners across the dot, one
  meets the board's edge, and this wall must match it

### Requirement: The Galaxies hint tries its deductions in one order

At each step the hint SHALL take the first of these that applies: a dot's own
squares; a wall between two squares of different dots; a square walled in
with one galaxy; a square only one dot can own; a square only one galaxy
reaches; a square a cut-off piece must pass through; a wall mirrored through a
dot. The mirrored wall is last, so that it is shown only where no plainer
deduction moves the board on. The order SHALL decide which explanation is
offered and nothing about what can be deduced.

#### Scenario: A wall is asked for before a further arrow

- **WHEN** two neighboring squares already point at different dots with no
  wall between them, and elsewhere a square can be given to its only dot
- **THEN** the next step asks for the wall
