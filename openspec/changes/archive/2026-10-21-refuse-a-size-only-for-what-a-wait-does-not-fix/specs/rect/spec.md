## REMOVED Requirements

### Requirement: Params: Rectangles refuses Unreasonable where no board needs it

**Reason**: It also refused the two-wide boards nine to eleven long as too
rare to deal, and a size is no longer refused for being rare
(`engine-difficulty`, "A rare tier is dealt under the deadline"). The
refusal of the shapes no board needs is kept, in "Params: Rectangles
refuses Unreasonable only where no board needs it".

**Migration**: None. A 2×9 to 2×11 board is dealt at Unreasonable, and the
deadline answers one the generator draws none of in time.

## ADDED Requirements

### Requirement: Params: Rectangles refuses Unreasonable only where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, one two wide and up to eight long, a 3×3 one and a 3×4
one. The hint finishes every board of those shapes that has one answer. A
board two wide and nine long or more SHALL be dealt, though the generator
seldom draws one ("A rare tier is dealt under the deadline").

#### Scenario: The small boards are not dealt at Unreasonable

- **WHEN** a 1×30, a 2×8, a 3×3 and a 4×3 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×8 board is still dealt at Easy, and a 2×12, a 3×5 and a 4×4
  board are admitted at Unreasonable

#### Scenario: Every board of a refused shape is tried

- **WHEN** every division into rectangles of a 1×2, 1×5 and 1×8 board, of a
  2×2 to a 2×8 board, and of a 3×3 and a 3×4 board, with each rectangle's
  number on each of its squares, is given to the solver, and those it leaves
  unfinished that have one answer are given to the hint's steps
- **THEN** the steps finish every one
- **AND** the same walk over a 3×5 board finds 48 they do not

#### Scenario: The short two-wide boards are dealt

- **WHEN** a 2×9 and an 11×2 board are asked for at Unreasonable
- **THEN** neither is refused
