## ADDED Requirements

### Requirement: Filling's hint keeps what the solver deduces from the clues alone

Where no rule forces a square of the board the plan has reached, the plan
SHALL take the next still-empty square the solver fills from the clues alone,
narrated with the deduction that forced it there and with its evidence read
from the board the step is shown on. The plan SHALL so finish every
mistake-free position of a board that loads, whatever order its squares were
filled in.

#### Scenario: A board the rules stall on from its own hint's position

- **WHEN** `hint` is asked on the opening of
  `7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b`
- **THEN** applying every step's move in order solves the board
- **AND** the plan made with no run from the clues to keep stops with squares
  empty

#### Scenario: A position the player filled in their own order

- **WHEN** any share of that board's answer is filled in and `hint` is asked
- **THEN** the plan fills every empty square with the answer's number

### Requirement: A Filling board loads when its hint and its solver both finish it

`finishesByDeduction` SHALL be the collection's shared test: the solver solves
the board from its clues, and the hint, played from the opening, ends on a
solved board. Every board the solver solves SHALL pass it.

#### Scenario: A dealt board loads

- **WHEN** a board is dealt at any preset
- **THEN** it loads

#### Scenario: A board with every square clued and a wrong answer is refused

- **WHEN** `3x1:222` is loaded, whose three 2s are one region of three
- **THEN** it is refused as a board deduction does not finish

## MODIFIED Requirements

### Requirement: Filling solver deduces the unique solution

The solver SHALL apply four sound deductive techniques to fixpoint, in a fixed
order: forced single-direction region growth, capacity-forced expansion or the
drop of an isolated `1`, critical distant squares, and per-cell
possible-number bitmap elimination, which includes inferring unclued "ghost"
regions. Every square it fills SHALL be right. How many it fills MAY depend on
the order the squares were filled in, since the last technique is not
monotone.

#### Scenario: Solver completes a generated board

- **WHEN** the solver runs on a freshly generated puzzle's clues
- **THEN** it reports solved
- **AND** the produced board has every region sized to its number

### Requirement: Filling provides an explained deduction hint

`hint(state)` SHALL return a plan-carrying, narrated hint that explains why
each move is forced, and `hintKeepTrack` SHALL advance the plan as the player
follows it. From any mistake-free position, `hint` SHALL deduce an ordered
sequence of forced steps that together solve the board, one narrated `HintStep`
per step. Each step's narration SHALL name the deduction that forces it and
SHALL avoid repeating the region's number.

#### Scenario: Hint explains the next forced move and solves the board

- **WHEN** `hint` is called on an unsolved, mistake-free generated board
- **THEN** it returns `{ ok: true }` with a non-empty list of steps
- **AND** each step's move is a legal `executeMove` whose narration names the
  deduction (region growth / lonely cell / elimination) that forces its squares
- **AND** applying every step's move in order solves the board
