## MODIFIED Requirements

### Requirement: Rectangles' parameters and their encoding

Params SHALL be `w`, `h`, `expandfactor`, a non-negative float that defaults
to 0, and the difficulty. They SHALL encode as `{w}x{h}`, with an `e{%g}`
suffix for a non-zero expansion factor and then the difficulty, Easy as `de`
or Unreasonable as `du`, in the full form only. A bare `{n}` SHALL decode as a
square of that side, and an ID with no difficulty letter SHALL decode as Easy.
A grid whose area is less than 2 SHALL be refused.

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

### Requirement: Rectangles reads past upstream's unchecked-board letter

Decoding SHALL read past upstream's trailing `a`, which asks for a board with
no promised single answer, and SHALL read the difficulty after it. Encoding
SHALL never write the `a`.

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `9x7a` is decoded
- **THEN** the params are those of `9x7`, and a board dealt from them has one
  solution
- **AND** `10x10e0.5adu` decodes as an Unreasonable 10×10 board with an
  expansion factor of 0.5

### Requirement: Rectangles flags a drawn edge the solution lacks

The game SHALL implement `findMistakes`: take the board's one answer from the
search that counts its answers, at either difficulty, and return every edge
the player has drawn that the answer does not contain. A missing edge SHALL
NOT be a mistake, and a board the search did not prove has exactly one answer
SHALL yield no mistakes.

#### Scenario: A wall the solution does not contain is flagged

- **WHEN** the player has drawn an edge that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake

### Requirement: Rectangles generates by tiling, stretching and solving

The generator SHALL tile the base grid at random, leave no rectangle of one
square, and stretch it to full size by the expansion factor. At Easy it SHALL
call the solver on every layout, which places the numbers, and return only one
the solver reaches a unique placement for.

#### Scenario: A layout the solver cannot make unique is discarded

- **WHEN** the solver does not reach a unique placement on a layout dealt for
  an Easy board
- **THEN** the generator lays out another grid

### Requirement: Rectangles' Solve returns the unique solution's edges

`solve` SHALL return the generator's `aux` when it is present, and otherwise
SHALL take the board's answer from the search that counts its answers, at
either difficulty, and return its edges, or an error when the numbers admit
no division or more than one.

#### Scenario: Solve without aux

- **WHEN** `solve` is called on a generated board with no `aux`
- **THEN** its move leaves the board solved
- **AND** on an Unreasonable board it is the move the `aux` gives

### Requirement: Rectangles deals only boards its hint can finish

At Easy the generator SHALL deal only boards the hint's steps finish from an
empty board, dealing again where a board it laid out would leave them short.
The desc of a seed for which upstream deals such a board SHALL differ from
upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator, dealing an Easy board, lays out a uniquely solvable
  board the hint's steps cannot finish
- **THEN** it draws another board instead of returning that one

## REMOVED Requirements

### Requirement: Rectangles loads only a board its hint finishes

**Reason**: Rectangles has two tiers and is held to them. A board its hint
does not finish loads where it has exactly one answer, as Unreasonable.

**Migration**: "A pasted Rectangles board opens at the difficulty it needs"
states what loads at each difficulty and what is refused.

## ADDED Requirements

### Requirement: Rectangles counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
solver: where the solver stops, it SHALL take the first number with the
fewest placements left and assume each in turn. A position SHALL be
impossible where the solver's deductions broke off at a square no rectangle
can cover, or a number has no placement left. It SHALL report one answer,
several, none, or that it stopped at its budget, which SHALL be counted in
positions and never in time.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 5×5 board the solver finishes, on one with one
  answer that it does not reach, on a 4×4 board with several, on a 5×5 board
  whose numbers come to 26 and on one with no number
- **THEN** it reports one answer for the first two, several for the third and
  none for the last two

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given two positions on a board that needs three
- **THEN** it reports that it stopped, and with three it reports one answer

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 4×5 to 7×7, the same with a number moved to the
  square beside it and the same with two numbers swapped are each counted by
  covering the grid a rectangle at a time, each holding exactly one number
  that is its area
- **THEN** the search reports one answer exactly where one division fits,
  several where more do and none where none does

### Requirement: An Easy Rectangles board is one the hint finishes

The lowest difficulty SHALL solve a board exactly where the hint's steps
finish it from an empty board and the search proves it has one answer,
whether or not the solver reaches a unique placement on it.

#### Scenario: A board only the hint finishes is Easy

- **WHEN** `7x7:b4c2b3a2_2a2b3c4a4b3_6b6h4e2a2a` is entered, a board the
  hint's steps finish and the solver stalls on
- **THEN** it opens as Easy

#### Scenario: A board the solver finishes and the hint does not is Unreasonable

- **WHEN** `9x9:c4c5b9c12b2h2k12e2f2_3c12a8l3d5d` is entered, a board the
  solver settles by ruling placements out that no line can record
- **THEN** it opens as Unreasonable

### Requirement: An Unreasonable Rectangles board has one answer that the hint does not reach

At Unreasonable the generator SHALL put each number on a square of its
rectangle at random, and SHALL keep the board only where the solver does not
reach a unique placement, the search proves one answer within a budget of its
own, well under the search's, and the hint's steps do not finish the board.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 5×5, 7×7 and 3×10, and at
  11×11 with an expansion factor of 0.5
- **THEN** neither the solver nor the hint's steps finish any of them
- **AND** exactly one division fits each board of up to 49 squares, by a count
  that has no search in it
- **AND** Solve's answer is the division the board was drawn as

#### Scenario: The smallest boards and the largest carry the tier

- **WHEN** an Unreasonable 4×5 board, a 5×5 board, a 15×15 board and a 19×19
  board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Rectangles refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, one two wide and up to eight long, a 3×3 one and a 3×4
one. The hint finishes every board of those shapes that has one answer.

#### Scenario: The small boards are not dealt at Unreasonable

- **WHEN** a 1×30, a 2×8, a 3×3 and a 4×3 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×8 board is still dealt at Easy, and a 2×9, a 3×5 and a 4×4
  board are admitted at Unreasonable

#### Scenario: Every board of a refused shape is tried

- **WHEN** every division into rectangles of a 1×2, 1×5 and 1×8 board, of a
  2×2 to a 2×8 board, and of a 3×3 and a 3×4 board, with each rectangle's
  number on each of its squares, is given to the solver, and those it leaves
  unfinished that have one answer are given to the hint's steps
- **THEN** the steps finish every one
- **AND** the same walk over a 3×5 board finds 48 they do not

### Requirement: Unreasonable Rectangles is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 400 squares, with a reason naming the difficulty. The same
size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** a 21×21 board is checked for dealing at each difficulty
- **THEN** it is refused at Unreasonable and not at Easy
- **AND** a 20×20 and an 8×50 board are admitted at Unreasonable

### Requirement: Rectangles' menu offers its sizes at both difficulties, the largest two at Easy

Rectangles' presets SHALL offer each of 7×7, 9×9, 11×11, 13×13 and 15×15 as
Easy and as Unreasonable, and 17×17 and 19×19 as Easy alone, and the default
SHALL be the Easy 7×7.

#### Scenario: The menu's twelve lines

- **WHEN** Rectangles' preset menu is read
- **THEN** its first five sizes each appear as Easy and then as Unreasonable,
  and 17×17 and 19×19 follow as Easy

### Requirement: A pasted Rectangles board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the hint finishes
it, and as Unreasonable where it has exactly one answer that the hint does
not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the hint does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** the 4×4 board `2b2_2a2b2b2a2_2`, which has several answers, and a
  5×5 board whose numbers come to 26, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Rectangles' hint stops where its steps do

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the rectangles and lines its five deductions force from the player's
lines and no others, and where none is forced it SHALL refuse with the
collection's sentence that deduction has run out. It SHALL go on from the
rectangles the player then draws.

#### Scenario: The hint stops, and goes on from a rectangle drawn rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a rectangle drawn a square too narrow there is reported by the
  mistake check
- **AND** with the solution's rectangle drawn wherever the hint stops, the
  hint finishes the board
