## ADDED Requirements

### Requirement: A clue named with its area is marked on its own square

Where a hint step's words name a clue and the mark drawn for that reference
covers more than the clue's own square, the reference SHALL also draw a mark
on the clue's own square. That mark SHALL lie inside the square's border, so
that it shows where the step rings the square too, and SHALL be legible on
every surface the clue can be drawn on. A value names a square only where one
square is marked for it.

#### Scenario: The named number's square is one the step decides

- **WHEN** a Mosaic step names a number, outlines its block and rings the
  number's own square
- **THEN** the number is circled inside the ring

### Requirement: Two squares of one name are told apart by where they sit

Where one sentence names two or more squares by the same words, each SHALL be
named with its position among them, through `apartByPosition`: upper and
lower, left and right where they are level, and an order from the top or the
left for three or more. A square whose name no other in the sentence shares
SHALL keep it bare.

#### Scenario: Two numbers of one value in one row

- **WHEN** a step reasons from two 7s in the same row and a 4
- **THEN** its words name "the left 7", "the right 7" and the 4 by its value
  alone
