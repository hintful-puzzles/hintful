## MODIFIED Requirements

### Requirement: Sticks parameters round-trip through their encoding

The full encoding of the parameters SHALL carry the width, height, block
percentage, symmetry and difficulty, Easy as `de` or Unreasonable as `du`, and
SHALL round-trip through decode. The short encoding SHALL be the bare
`width x height`. A bare `width x height` ID SHALL decode without a symmetry
marker, and an ID with no difficulty letter SHALL decode as Easy.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in full and decoded
- **THEN** the same width, height, block percentage, symmetry and difficulty
  are recovered

#### Scenario: A bare size decodes

- **WHEN** `10x10` is decoded
- **THEN** the parameters have width 10 and height 10

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 7×7 board is encoded
- **THEN** the full encoding is `7x7b20s2du` and the shared one `7x7`
- **AND** `7x7b20s2`, written before the game had tiers, decodes as Easy

### Requirement: The Sticks generator keeps only what the solver completes

The generator SHALL place blocks under the chosen symmetry, fill and clue
the board, and retain a candidate only while the deductive solver deduces it to a
unique completion; it SHALL then remove clues in a randomized order. At Easy
it SHALL keep each removal only while the solver still completes the board.
Generation from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

### Requirement: Sticks findMistakes flags only lines that contradict the solution

`findMistakes` SHALL take the board's one fill from the search that counts
its answers, at either difficulty, and flag every cell whose player-drawn line
contradicts it; a merely missing line SHALL NOT be flagged. Where the search
did not prove exactly one fill it SHALL flag nothing.

#### Scenario: A contradicting line is flagged as a mistake

- **WHEN** the board is checked and a placed line differs from the unique
  solution's line for that cell
- **THEN** that cell is reported as a mistake

## REMOVED Requirements

### Requirement: Every generated Sticks board has one solution, reached without guessing

**Reason**: Sticks has two tiers, and a board dealt at Unreasonable is one the
deduction does not reach.

**Migration**: "Every Easy Sticks board has one solution, reached without
guessing" keeps the rule for the tier it is still true of, and "An
Unreasonable Sticks board has one answer that the solver does not reach"
states the other.

## ADDED Requirements

### Requirement: Every Easy Sticks board has one solution, reached without guessing

Every board generated at Easy SHALL have exactly one solution, and the shipped
deduction SHALL reach it with no guessing anywhere.

#### Scenario: A generated board has exactly one solution

- **WHEN** a board generated at Easy is enumerated by a search that propagates
  the shipped deduction and branches on the cells it leaves undecided
- **THEN** exactly one solution is found

### Requirement: Sticks counts a board's answers by a bounded search

The game SHALL count a board's fills up to two by trial and error over the
solver: where the solver stops, it SHALL take the first blank square and
assume its line runs across, and then up and down. It SHALL report one
answer, several, none, or that it stopped at its budget, which SHALL be
counted in positions and never in time. Solve SHALL take the answer from it
at either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the solver finishes, on one with
  one fill that it does not reach, on one with no block and no number, and on
  one whose corner square holds a 4 with a 1 beside it and a 1 below it
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given four positions on a board that needs five
- **THEN** it reports that it stopped, and with five it reports one answer

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 4×4, the same with numbers taken away and
  the same with one number changed are each counted by laying every white
  square each way and reading the finished board against its numbers
- **THEN** the search reports one answer exactly where one fill fits, several
  where more do and none where none does

### Requirement: An Unreasonable Sticks board has one answer that the solver does not reach

At Unreasonable the generator SHALL remove clues from a fill the solver
completes, each only while the search still proves one fill within a budget
of its own, well under the search's, and SHALL keep the board only when the
solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 3×3 to 5×5
- **THEN** the solver leaves each unfinished
- **AND** exactly one fill fits each, by a count that has no search in it

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 2×5 board, a 3×3 board and a 10×10 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Sticks refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
2×2 board. The solver finishes every 2×2 board that has one fill.

#### Scenario: A 2×2 board is not dealt at Unreasonable

- **WHEN** a 2×2 board is asked for at Unreasonable
- **THEN** it is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×2 board is still dealt at Easy, and a 2×3 board is admitted at
  Unreasonable

#### Scenario: Every 2×2 board is tried

- **WHEN** every set of blocks, every fill, every square a line's number
  could sit on and every set of numbers left showing on a 2×2 board is given
  to the solver, and those it leaves unfinished are counted
- **THEN** none of them has exactly one fill
- **AND** the same walk over a 2×3 board finds some that do

### Requirement: Unreasonable Sticks is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 100 squares or longer than 30 on a side, with a reason
naming the difficulty. The same size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** an 11×11 board and a 2×40 board are checked for dealing at each
  difficulty
- **THEN** each is refused at Unreasonable and not at Easy
- **AND** a 10×10, a 4×25 and a 2×30 board are admitted at Unreasonable

### Requirement: Sticks' menu offers each size at both difficulties

Sticks' presets SHALL offer each of 5×5, 7×7 and 10×10 as Easy and as
Unreasonable, and the default SHALL be the Easy 7×7.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Sticks' preset menu is read
- **THEN** its three sizes each appear as Easy and then as Unreasonable

### Requirement: A pasted Sticks board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one fill that they
do not reach, whatever lower difficulty its ID states. A board with several
fills SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one fill the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4b20s2du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 4×4 board with no block and no number, and one whose corner
  square holds a 4 with a 1 beside it and a 1 below it, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Sticks' hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the squares its deduction forces from the player's lines and no others,
and where none is forced it SHALL refuse with the collection's sentence that
deduction has run out. It SHALL go on from the lines the player then places.

#### Scenario: The hint stops, and goes on from a line tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a line placed wrongly there is reported by the mistake check
- **AND** with a line placed as the solution has it wherever the hint stops,
  the hint finishes the board
