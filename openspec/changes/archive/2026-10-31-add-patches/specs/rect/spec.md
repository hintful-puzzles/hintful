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

### Requirement: Rules: Rectangles flags a drawn edge the solution lacks

`findMistakes` SHALL return every line the player has drawn that the board's
one answer does not contain, a line being every drawn edge but the sides of
a rectangle the player drew round one clue short of its number
(`Hint: A rectangle the player drew round one clue is a lower bound`). Such a
rectangle's sides the answer lacks SHALL be returned only where it takes a
square its clue's rectangle in the answer does not. A missing edge SHALL NOT
be a mistake.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

#### Scenario: A rectangle smaller than its clue's is no mistake

- **WHEN** on `3x2p:SaTc` the player draws a 1×1 or a 1×2 round the square
  clue, inside its 2×2
- **THEN** `findMistakes` returns nothing

#### Scenario: A rectangle taking another clue's square is a mistake

- **WHEN** on `3x2p:SaTc` the player draws the 2×1 at (1,0) round the tall
  clue, whose rectangle is the right column
- **THEN** its left side is returned as a mistake

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
from the clues and the player's marks. A clue's fits are the rectangles it
allows that contain it, stay on the board, take in no other clue, cross no
line and take no square of another clue's drawn rectangle, and contain its
own (`Hint: A rectangle the player drew round one clue is a lower bound`).

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

### Requirement: Look: Rectangles draws its squares on the collection's quiet surface

`redraw` SHALL draw every square on the collection's cell surface, with the
surface's thin grid line between squares, but for the squares a clue's fill
takes. The clue itself SHALL stay in ink. The edges of the player's
rectangles, and the board's outer edge, which bounds every rectangle that
reaches it, are content and SHALL stay in ink at their full width.

#### Scenario: A number is told by the cell under it

- **WHEN** an untouched board is drawn
- **THEN** every square holding a clue is in that clue's fill
- **AND** every other square is the plain cell surface

## REMOVED Requirements

### Requirement: Look: A finished rectangle fills whole with the finished-region role

**Reason**: A finished rectangle now takes its clue's own fill, one of the
region fills, as LinkedIn's Patches colors its patches (the owner,
2026-10-31, for both rulesets).

**Migration**: "Look: A clue's fill marks its square, and its rectangle once
the clue allows it".

## ADDED Requirements

### Requirement: Controls: A drag from a drawn rectangle resizes it

A left-drag, or the cursor's Enter, that starts anywhere on a square of a
rectangle the player drew round one clue SHALL resize it. With the pointer
out of it, it SHALL grow to take in the pointer's square; within it, the
side nearer the square pressed SHALL follow the pointer. The move SHALL take
up the old sides but those another drawn rectangle shares, and draw the new
outline. The rectangle SHALL stop short of another drawn rectangle.

#### Scenario: A rectangle grows from its corner

- **WHEN** a 2×2 rectangle drawn at (2,2) on a blank 7×7 board is dragged from
  its top-left square to the square above and left of it
- **THEN** the move resizes it to the 3×3 at (1,1)

#### Scenario: A shrink keeps a neighbor's side

- **WHEN** that 2×2 has a 1×2 drawn beside it at (4,2), and is dragged from
  its right column a square left
- **THEN** it becomes the 1×2 at (2,2), and the neighbor is still drawn whole

#### Scenario: Growth stops at another rectangle

- **WHEN** a 1×1 at (2,2) is dragged right past a 1×1 drawn at (4,2)
- **THEN** it grows to the 2×1 at (2,2) and no further

#### Scenario: The board before any line is not a rectangle to resize

- **WHEN** on `7x7:2_2c3f2_2a2b3c2_4b3c3_6_3b2_4i6b`, with no line drawn, a
  drag runs from the top-left square to the one below it
- **THEN** it draws the 1×2 rectangle those squares span

#### Scenario: A rectangle grows toward the pointer, pressed near a corner

- **WHEN** a 2×1 drawn at (2,2) is pressed on its left square near that
  square's bottom-left corner and dragged to the square below its right one
- **THEN** the move resizes it to the 2×2 at (2,2)

#### Scenario: The hint's drag draws round a rectangle the player drew

- **WHEN** the hint's rectangle holds the one the player drew round its
  clue, at its top-left square, and the hint's drag is played
- **THEN** the board's lines are the hint's rectangle's

### Requirement: Hint: A rectangle the player drew round one clue is a lower bound

A rectangle the player drew, by a drag or a resize, that is still closed
round one clue SHALL be read as saying its squares are that clue's. Short
of the clue's number its sides SHALL NOT be lines, but for one with another
such rectangle across it. Where the hint proves one the whole of its
clue's, it SHALL go on without a step.

#### Scenario: The hint carries on from a rectangle too small

- **WHEN** on `3x2p:SaTc` the player draws a 1×1 round the square clue and
  asks for a hint
- **THEN** the hint finishes the board

#### Scenario: A rectangle drawn whole is no step

- **WHEN** a dealt 7×7 Patches board has one clue without a number drawn
  as its rectangle in the answer, and the hint is followed
- **THEN** no step draws that rectangle, and the board is finished

#### Scenario: A box the lines close by chance is not drawn

- **WHEN** on `3x2p:SaTc` the player draws a 1×2 down the left column, which
  leaves the tall clue a 2×2 box
- **THEN** that box is no rectangle of the tall clue's, and no mistake

### Requirement: Look: A clue's fill marks its square, and its rectangle once the clue allows it

Each clue SHALL take one of the region fills, so that clues whose nearest
squares meet differ; the fills SHALL NOT be chosen from the answer. A clue's
square SHALL be drawn in its fill, a rectangle the player drew round it
SHALL fill whole with it from the start, and any other rectangle the game
counts as correct SHALL fill whole with its clue's.

#### Scenario: A drawn rectangle shows whether it is settled

- **WHEN** the player draws a rectangle round one clue
- **THEN** it is filled with its clue's fill at once, and its sides are in
  the clue's line color while it may still grow, the side it shares with
  another such rectangle included, in ink once it has the clue's number of
  squares, and red where no rectangle the clue allows on the board contains
  it

#### Scenario: A finished rectangle takes its clue's fill

- **WHEN** a board is solved
- **THEN** every square is drawn in the fill of its rectangle's clue

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
