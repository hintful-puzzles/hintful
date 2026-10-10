## MODIFIED Requirements

### Requirement: An Unreasonable Rectangles board has one answer that the hint does not reach

At Unreasonable the generator SHALL put each number on a square of its
rectangle at random and, while the search finds an answer other than the
division as dealt, move a number whose rectangle differs in it to a square of
its dealt rectangle that the other leaves out. It SHALL keep the board only
where the dealt division is then the only answer and neither the solver nor
the hint's steps finish it. Each search SHALL have a budget well under a
pasted board's.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 5×5, 7×7 and 3×10, and at
  11×11 with an expansion factor of 0.5
- **THEN** neither the solver nor the hint's steps finish any of them
- **AND** exactly one division fits each board of up to 49 squares, by a count
  that has no search in it
- **AND** Solve's answer is the division the board was drawn as

#### Scenario: The smallest boards and the largest carry the tier

- **WHEN** an Unreasonable 4×4 board, a 4×5 board, a 5×5 board, a 2×12 board,
  a 15×15 board, a 19×19 board and a 30×30 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Rectangles refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, one two wide and up to eight long, a 3×3 one and a 3×4
one. The hint finishes every board of those shapes that has one answer. It
SHALL refuse an Unreasonable board two wide and nine to eleven long with the
sentence for a tier too rare to deal: such boards exist, and the generator
draws none.

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

#### Scenario: The short two-wide boards are too rare to deal

- **WHEN** a 2×9 and an 11×2 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that Unreasonable puzzles of that
  size are too rare to deal
- **AND** a 2×11 board is still asked for at Easy
- **AND** a 2×9 board that arrives with its description is not refused

## ADDED Requirements

### Requirement: Rectangles refuses no board for the time its deal takes

`validateParams` SHALL refuse no size, at either difficulty, for the time its
deal takes: a player can stop a deal.

#### Scenario: A large board is asked for at both difficulties

- **WHEN** a 21×21, an 8×50 and a 100×100 board are checked for dealing at
  Unreasonable, and a 100×100 board at Easy
- **THEN** none is refused

#### Scenario: A board past the menu is dealt and opens

- **WHEN** an Easy 60×60 board is dealt and its ID is pasted back
- **THEN** it opens as Easy

### Requirement: Rectangles deals a strip with an expansion factor

The generator SHALL make the base grid of a board one square wide one square
wide, whatever the expansion factor.

#### Scenario: A strip is stretched along its length alone

- **WHEN** a 1×7 and a 9×1 board are dealt with an expansion factor of 0.5 and
  of 2
- **THEN** each is dealt, and the hint's steps finish it

### Requirement: A Rectangles hint plan is the firings its boards give

The hint MAY carry what it read of a board from one step of a plan to the
next. Every step of a plan SHALL be the step the hint gives when asked of that
step's board alone.

#### Scenario: A plan is replayed a board at a time

- **WHEN** the hint's plan for a dealt board at each difficulty is followed,
  and at each step the hint is asked afresh of the board reached
- **THEN** it gives that step's move
- **AND** where the plan ends the hint asked afresh has no step, or the board
  is solved

## REMOVED Requirements

### Requirement: Unreasonable Rectangles is bounded on its own measurements

**Reason**: The bound stood where deals began to give up, and they give up no
longer: with a number moved off each second answer a board takes a few hundred
draws at every size. What is left past it is a wait, which is the player's to
stop.

**Migration**: "Rectangles refuses no board for the time its deal takes" says
so. The small shapes are still refused at Unreasonable, by "Rectangles refuses
Unreasonable where no board needs it".
