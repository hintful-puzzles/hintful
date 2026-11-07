## MODIFIED Requirements

### Requirement: Generation: Rectangles generates by tiling, stretching and solving

The generator SHALL tile the base grid at random, leave no rectangle of one
square, and stretch it to full size by the expansion factor. At Easy and
Normal it SHALL winnow where each number may go with upstream's solver on
every layout, which places the numbers, and return only one that solver
reaches a unique placement for.

#### Scenario: A layout the solver cannot make unique is discarded

- **WHEN** upstream's solver does not reach a unique placement on a layout
  dealt for an Easy board
- **THEN** the generator lays out another grid

### Requirement: Generation: Rectangles deals only boards its hint can finish

At Easy and Normal the generator SHALL deal only boards the ladder of that
tier finishes from an empty board, and at Normal only boards Easy's
techniques do not, dealing again where a board it laid out falls outside
them. The desc of a seed for which upstream deals such a board SHALL differ
from upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator, dealing an Easy board, lays out a uniquely solvable
  board Easy's techniques cannot finish
- **THEN** it draws another board instead of returning that one

#### Scenario: A board of the tier upstream's seed dealt

- **WHEN** each seed upstream's generator was recorded on is dealt at the tier
  its recorded board needs
- **THEN** the desc and the `aux` are upstream's, byte for byte

### Requirement: Generation: An Unreasonable Rectangles board has one answer that the hint does not reach

At Unreasonable the generator SHALL put each number on a square of its
rectangle at random and, while the search finds an answer other than the
division as dealt, move a number whose rectangle differs in it to a square of
its dealt rectangle that the other leaves out. It SHALL keep the board only
where the dealt division is then the only answer and the ladder does not
finish it. Each search SHALL have a budget well under a pasted board's.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 5×5, 7×7 and 3×10, and at
  11×11 with an expansion factor of 0.5
- **THEN** the ladder finishes none of them
- **AND** exactly one division fits each board of up to 49 squares, by a count
  that has no search in it
- **AND** Solve's answer is the division the board was drawn as

#### Scenario: The smallest boards and the largest carry the tier

- **WHEN** an Unreasonable 4×4 board, a 4×5 board, a 5×5 board, a 2×12 board,
  a 15×15 board, a 19×19 board and a 30×30 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Generation: A Patches board hides what its clues need not say

Under Patches each clue SHALL first name its rectangle's shape and size. The
generator SHALL then hide each clue's size, and then widen each clue's shape
to plain, in a random order, keeping each change only where the board's tier
still holds: Easy's techniques finish it, then at Normal every technique
does, or at Unreasonable the search still proves one answer.

#### Scenario: A dealt Patches board hides some sizes

- **WHEN** Patches boards are dealt at 6×6, 7×7 and 8×8, at every tier
- **THEN** each has exactly one answer, its tier is the one asked for, and
  some clue on it shows no number

### Requirement: Generation: An Easy or Normal Rectangles board is one the hint's rungs of its tier finish

The game SHALL run its description's compiled ladder, each technique
checked sound, for its hint and its grading alike. Easy SHALL solve a board
exactly where Easy's techniques, a clue with one fit, a square one clue
reaches and squares another clue is sure to cover, finish it from empty;
Normal SHALL add the techniques that leave a clue no room and draw a line.
A board the ladder finishes has one answer, each technique being sound.

#### Scenario: A board only the hint finishes is Normal

- **WHEN** `7x7:b4c2b3a2_2a2b3c4a4b3_6b6h4e2a2a` is entered, a board the
  ladder finishes and Easy's techniques do not
- **THEN** it opens as Normal

#### Scenario: A board the solver finishes and the hint does not is Unreasonable

- **WHEN** `9x9:c4c5b9c12b2h2k12e2f2_3c12a8l3d5d` is entered, a board
  upstream's solver settles by ruling placements out that no line can record
- **THEN** it opens as Unreasonable

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the hint does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

### Requirement: Solver: Rectangles' search tries the number with the fewest placements left

Rectangles SHALL count a board's answers with the engine's search over its
ladder (`engine-difficulty`, "The engine counts a searching game's answers up
to two, within a budget of positions"). Where the ladder stops, the search
SHALL take the first number with the fewest fits left and assume each in
turn. A position SHALL be impossible where the ladder concludes a
contradiction, such as a number with no fit left.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 5×5 board the ladder finishes, on one with one
  answer that it does not reach, on a 4×4 board with several, on a 5×5 board
  whose numbers come to 26 and on one with no number
- **THEN** it reports one answer for the first two, several for the third and
  none for the last two

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 4×5 to 7×7, the same with a number moved to the
  square beside it and the same with two numbers swapped are each counted by
  covering the grid a rectangle at a time, each holding exactly one number
  that is its area
- **THEN** the search reports one answer exactly where one division fits,
  several where more do and none where none does
