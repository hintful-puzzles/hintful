## MODIFIED Requirements

### Requirement: Crossing's parameters

Parameters SHALL be a width, a height, a symmetric-walls flag and a
difficulty, Easy or Unreasonable. Each dimension SHALL be declared with a
lower bound of 2, and `validateParams` SHALL refuse a board whose width and
height are both below 4. The params encoding SHALL carry the width and height,
and a string that omits the height SHALL decode as a square board. The
symmetry and the difficulty are generation-time settings and SHALL appear only
in the full encoding, the symmetry as `S` and the difficulty after it as `de`
or `du`. A string with no difficulty letter SHALL decode as Easy, so that an
ID written before the game had tiers reads as it did.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in full and decoded
- **THEN** the same width, height, symmetric-walls flag and difficulty are
  recovered, and a string omitting the height is read as a square board

#### Scenario: A dimension below the minimum is rejected

- **WHEN** parameters are validated with both width and height below 4
- **THEN** `validateParams` refuses them with "Width or height must be at
  least 4."
- **AND** a width or a height below 2 is refused by the field's declared bound

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 7×4 board with symmetric walls is encoded
- **THEN** the full encoding is `7x4Sdu` and the shared one `7x4`
- **AND** `7x4S`, written before the game had tiers, decodes as Easy

### Requirement: Crossing's generator keeps every board uniquely solvable

At Easy the generator SHALL accept a board only when the solver reports it
valid, so that the board has one solution and deduction alone reaches it, and
SHALL retry otherwise. On a generated board no 2×2 block SHALL be fully closed
and the open cells SHALL be connected. Generation from a given seed SHALL be
reproducible, and an Easy board SHALL be the board upstream's generator deals
from the same seed, save where it would leave a cell no clue can reach.

#### Scenario: Every preset produces a uniquely-solvable board

- **WHEN** a new Easy game is generated for any preset or legal size
- **THEN** a board is produced whose walls and number list admit exactly one
  solution reachable by the deductive solver

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed and parameters are used twice to generate a game
- **THEN** both runs produce the identical description

### Requirement: Crossing rejects board sizes it cannot generate

Parameter validation SHALL reject, when validating for generation, any board
whose area is larger than the generable maximum, giving a reason, and SHALL NOT
leave generation to retry indefinitely. Generation retries until every run
reads as a distinct listed number, so the chance of success falls to zero as
the board grows. A board two, three or four squares on its shorter side SHALL
be held to a smaller maximum of its own, since its long runs give out sooner.
The generator's retry cap SHALL be sized to the rarest board validation
admits, so that exhausting it signals a defect and not an ordinary request.
Validation SHALL NOT apply a ceiling when a description is already supplied,
so an existing puzzle of any size remains playable.

#### Scenario: An ungenerable size is refused with a reason

- **WHEN** parameters larger than the generable maximum are validated for
  generation
- **THEN** validation fails with a message naming the maximum

#### Scenario: A thin board is refused where none is dealt

- **WHEN** a 2×41, a 61×3 and a 4×46 board are validated for generation at
  either difficulty
- **THEN** each is refused with a message naming its shorter side and that
  side's maximum area, and a 2×40 board is admitted

#### Scenario: An existing large description still loads

- **WHEN** parameters larger than the generable maximum accompany a supplied
  description
- **THEN** validation succeeds

### Requirement: Crossing's findMistakes compares the board with the unique solution

`findMistakes` SHALL take the board's one answer from the search that counts
its answers, at either difficulty, and flag every placed digit that
contradicts it and every empty cell whose pencil notes have crossed out its
solution digit. It SHALL return nothing when the search did not prove the
board has exactly one answer.

#### Scenario: Entering the wrong digit is caught by Check & Save

- **WHEN** the player places a digit that contradicts the unique solution and
  invokes Check & Save
- **THEN** the cell is flagged as a mistake and the save is refused

## ADDED Requirements

### Requirement: Crossing counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
solver's two deductions, assuming each candidate digit of an empty cell in
turn where they stop. It SHALL report one answer, several, none, or that it
stopped at its budget, which SHALL be counted in positions tried and never in
time. Solve SHALL take the board's answer from it at either difficulty, and
SHALL say that a board has more than one solution or none only where the
search proved it.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the solver finishes, on one with one
  answer that it does not reach, on two four-cell runs that share no cell with
  two numbers to hold, and on an across run and a down run from one cell whose
  numbers start with different digits
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** the walls of dealt boards from 4×3 to 6×6 are given the numbers of
  a fresh random fill, and the same with one number changed, and each board's
  answers are counted by writing whole numbers into its runs
- **THEN** the search reports one answer exactly where one way fits, several
  where more do and none where none does

### Requirement: Crossing's solver says when a cell is left with no digit

The solver SHALL report a position in which an empty cell has no candidate
digit left as contradictory, and not as one it merely cannot finish.

#### Scenario: Two runs that cannot share their cell

- **WHEN** the solver runs on an across run and a down run from one cell
  whose only numbers start with different digits
- **THEN** it reports the board contradictory
- **AND** it reports a board of two separate runs that two numbers fit either
  way as not fully determined

### Requirement: An Unreasonable Crossing board has one answer that the solver does not reach

At Unreasonable the generator SHALL accept a board only when the solver stops
short on it and the search proves it has exactly one answer. Such a board
SHALL keep what an Easy one keeps: no 2×2 block fully closed, the open cells
connected, and no cell that no clue can reach.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×2 to 9×9, with
  symmetric walls and without
- **THEN** the solver leaves each unfinished
- **AND** exactly one way of writing the numbers into the runs fits each, by
  a count that has no search in it
- **AND** every open cell of each lies in a run

#### Scenario: The smallest boards carry the tier

- **WHEN** an Unreasonable 4×2, 2×4 or 4×3 board is dealt
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Unreasonable is bounded on its own measurements

The bound on the Unreasonable boards that are dealt SHALL be its own, tighter
than the Easy one, since at every shape such a board is found several times
more seldom. A size past it SHALL be refused with a reason naming the
difficulty, and SHALL still be dealt at Easy where the Easy bound admits it.

#### Scenario: A size dealt at Easy is refused at Unreasonable

- **WHEN** a 14×14 board, a 15×15 board with symmetric walls and a 5×40 board
  are checked for dealing at each difficulty
- **THEN** each is admitted at Easy and refused at Unreasonable

#### Scenario: The largest admitted boards are dealt

- **WHEN** an Unreasonable 13×13, 12×15, 4×45 and 2×40 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Crossing's menu offers each size at both difficulties

Crossing's presets SHALL offer each of five square sizes from 5×5 to 13×13 at
both difficulties, and after them two Easy boards with symmetric walls: a 9×9,
and the largest board there is, 15×15, which symmetric walls make quick to
deal.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Crossing's preset menu is read
- **THEN** its 5×5, 7×7, 9×9, 11×11 and 13×13 boards each appear as Easy and
  as Unreasonable, followed by a symmetric 9×9 and a symmetric 15×15

### Requirement: A pasted Crossing board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one answer that they
do not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused with the collection's sentence that it has more than
one solution, and a board with none with the sentence that its clues
contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 4×3 ID of two separate runs that two numbers fit either way, and
  a 4×2 ID whose two runs cannot share their cell, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Crossing's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the steps its deductions force from the player's digits and notes and no
others, and where none forces anything it SHALL refuse with the collection's
sentence that deduction has run out. It SHALL go on from the digits the player
then enters, as it does from any position.

#### Scenario: The hint stops, and goes on from a digit tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a digit entered wrongly there is reported by the mistake check
- **AND** with a digit entered as the solution has it wherever the hint stops,
  the hint finishes the board
