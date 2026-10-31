# rect Specification Delta — add-patches

## MODIFIED Requirements

### Requirement: Rules: Rectangles reports completion and mistakes

A cell SHALL be correct if and only if it belongs to a valid rectangle: all of
its boundary edges present, none interior, and exactly one contained clue,
which allows the rectangle. A clue with a number SHALL allow the rectangles of
that area, and one with a shape only rectangles of that shape: a square with
equal sides, a tall one higher than wide, a wide one wider than high. The
board SHALL be completed when every cell is correct.

#### Scenario: The last rectangle completes the board

- **WHEN** the player's edges divide the whole grid into rectangles that each
  hold exactly one number, equal to its area
- **THEN** every cell is correct and the game is reported solved

#### Scenario: A rectangle holding two numbers is not correct

- **WHEN** the player's edges enclose a rectangle that holds two numbers
- **THEN** none of its cells is correct

#### Scenario: A Patches rectangle of the wrong shape is not correct

- **WHEN** on the Patches board `3x2p:SaTc` the player draws the left 2×2 and
  the right column, and then instead the left column and the right 2×2
- **THEN** the first is solved, and in the second the tall clue's square
  rectangle is not correct

### Requirement: Params: Rectangles' parameters and their encoding

Params SHALL be `w`, `h`, the ruleset, `expandfactor`, a non-negative float
that defaults to 0, and the difficulty. They SHALL encode as `{w}x{h}`, a
`p` for Patches and nothing for Rectangles, then in the full form only an
`e{%g}` suffix for a non-zero expansion factor and the difficulty, `de` or
`du`. A bare `{n}` SHALL decode as a square of that side, and an ID with no
difficulty letter as Easy. A grid of area less than 2 SHALL be refused.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, expandfactor: 0.5 }` at Unreasonable are
  encoded in full
- **THEN** the result is `10x10e0.5du` and decoding it round-trips the params

#### Scenario: A string from before the tiers

- **WHEN** `9x7`, written before the game had tiers, is decoded
- **THEN** the params are Easy, and their full encoding is `9x7de`

#### Scenario: The short form drops the expansion factor

- **WHEN** params `{ w: 7, h: 7, expandfactor: 0.5 }` are encoded in the short
  form
- **THEN** the result is `7x7`

#### Scenario: A grid of one square is refused

- **WHEN** params of a 1×1 grid are validated
- **THEN** they are refused with an error string

#### Scenario: The Patches ruleset round-trips

- **WHEN** `6x6pdu` is decoded and encoded in full
- **THEN** the result is `6x6pdu`, and `6x6du` decodes to Rectangles

### Requirement: Description: Rectangles descriptions use the upstream encoding

The desc SHALL encode the grid row-major as a run-length string: a letter
`a`–`z` for a run of 1–26 squares with no clue, and a clue for each other
square, with a `_` between two numbers side by side. A clue SHALL be a
decimal number; under Patches it MAY be `S`, `T` or `W` for a shape, then a
number or nothing, or `A` alone for a plain clue with no number. A desc with
an unknown character, or that does not exactly fill the grid, SHALL be
refused.

#### Scenario: A description round-trips

- **WHEN** a generated desc of either ruleset is parsed by `newState` and
  re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc with too much or too little data to fill the grid is
  validated
- **THEN** the result is a non-null error string

#### Scenario: A shape letter is Patches' alone

- **WHEN** `SaTc` is read as a 3×2 board under each ruleset
- **THEN** under Patches it is a square clue and a tall clue, neither with a
  number, and under Rectangles it is refused

### Requirement: Hint: A Rectangles hint step draws one rectangle or one line, and reads only the board

Every step of the hint SHALL draw one rectangle or one line, reasoning only
from the clues and the lines drawn. A clue's fits are the rectangles it
allows that contain it, stay on the board, take in no other clue and cross
no drawn line.

#### Scenario: The player draws the rectangle a side at a time

- **WHEN** the displayed step draws a rectangle and the player draws one of its
  sides
- **THEN** the step stays displayed, and it completes when the last side is
  drawn

#### Scenario: Upstream's 10x10 board is hinted to the end

- **WHEN** the hint is followed on `10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c`
- **THEN** it finishes the board, one of its steps a line, and the generator
  returns that board for upstream's seed

#### Scenario: The hint goes on from a rectangle drawn rightly

- **WHEN** the hint is followed on an Unreasonable board, and the solution's
  rectangle is drawn wherever the hint stops
- **THEN** the hint finishes the board

#### Scenario: A Patches clue is named by what it shows

- **WHEN** the hint is asked on `3x2p:SaTc`
- **THEN** its words name the square clue or the tall clue, and following it
  finishes the board

## ADDED Requirements

### Requirement: Generation: A Patches board hides what its clues need not say

Under Patches each clue SHALL first name its rectangle's shape and size. The
generator SHALL then hide each clue's size, and then widen each clue's shape
to plain, in a random order, keeping each change only where an Easy board's
hint still finishes it, or an Unreasonable board's search still proves one
answer.

#### Scenario: A dealt Patches board hides some sizes

- **WHEN** Patches boards are dealt at 6×6, 7×7 and 8×8, Easy and
  Unreasonable
- **THEN** each has exactly one answer, its tier is the one asked for, and
  some clue on it shows no number

### Requirement: Look: A Patches clue is drawn in its shape's frame

A clue that names a shape SHALL be drawn as its number, or `?` where it has
none, inside an outlined frame of that shape: square, tall or wide. A plain
clue SHALL be its number alone, or `?`.

#### Scenario: A shaped clue's frame

- **WHEN** `3x2p:SaTc` is drawn
- **THEN** a square frame and a tall frame are outlined, each around a `?`
