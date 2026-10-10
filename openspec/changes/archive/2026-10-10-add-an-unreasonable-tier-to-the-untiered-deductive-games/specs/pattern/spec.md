## RENAMED Requirements

- FROM: `### Requirement: Pattern's parameters are a width and a height`
- TO: `### Requirement: Pattern's parameters are a size and a difficulty`
- FROM: `### Requirement: Pattern generates only boards the per-line solver solves uniquely`
- TO: `### Requirement: An Easy Pattern board is one the per-line solver solves`

## MODIFIED Requirements

### Requirement: Pattern's parameters are a size and a difficulty

Params SHALL be `w` and `h`, positive integers, and a difficulty, Easy or
Unreasonable. They SHALL encode as `{w}x{h}`, followed in the full encoding by
`de` for Easy or `du` for Unreasonable; the shared encoding SHALL leave the
difficulty out. A bare `{w}` SHALL decode to a square `w × w` grid, and a
string with no difficulty letter SHALL decode as Easy, so that an ID written
before the game had tiers reads as it did. `validateParams` SHALL refuse an
unreasonably large `w·h`.

#### Scenario: Params round-trip

- **WHEN** Easy params `{ w: 20, h: 15 }` are encoded in full
- **THEN** the result is `20x15de`, and the same params at Unreasonable give
  `20x15du`
- **AND** decoding each round-trips the params
- **AND** decoding a bare `10` yields an Easy `10 × 10` grid

#### Scenario: Invalid params are rejected

- **WHEN** params with a non-positive dimension, or with a grossly oversized
  `w·h`, are checked
- **THEN** they are refused with an error string

#### Scenario: An ID from before the tiers is Easy

- **WHEN** `20x15` is decoded
- **THEN** the params are an Easy `20 × 15` grid

### Requirement: An Easy Pattern board is one the per-line solver solves

The per-line solver is the row and column fixpoint that narrows each line
against its run-length clue until no further cell is forced. At Easy the
generator SHALL produce a random grid and accept it only when that solver,
from the grid's derived clues alone, completes it to one fully determined
grid.

#### Scenario: Generated boards are uniquely line-solvable

- **WHEN** `newDesc` produces an Easy board and the solver is run from its
  clues on an all-unknown grid
- **THEN** the solver completes to a single fully-determined grid (no remaining
  unknown cells, no contradiction)

### Requirement: A Pattern hint never reveals the solution or searches

The hint SHALL never reveal the stored solution or run a search. Every Easy
board is one the per-line solver solves with no guessing, so the plan for a
generated Easy board SHALL complete without any un-narrated step. On an
Unreasonable board the plan SHALL hold the steps the lines force and no
others, and where no line forces a cell the hint SHALL refuse with the
collection's sentence that deduction has run out. It SHALL go on from the
marks the player then makes, as it does from any position.

#### Scenario: The plan solves the board

- **WHEN** the full hint plan for any generated Easy board is applied step by
  step
- **THEN** the board reaches its unique solution

#### Scenario: The hint stops where the lines do

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** once the player has marked a cell the lines did not decide as the
  solution has it, the hint has a step again

## ADDED Requirements

### Requirement: Pattern counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
per-line solver: where no line forces a cell it assumes one each way and
deduces on, and a line that no placement of its runs fits ends that branch.
The search SHALL report one answer, several, none, or that it stopped at its
budget, which SHALL be counted in positions tried and never in time. Solve and
the mistake check SHALL take the board's answer from this search at either
tier.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the lines decide, on one with one answer
  that they do not reach, on a 2×2 board whose two diagonals both fit, and on
  a board whose clues contradict each other
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** every 3×4 picture's clues are searched, and its pictures are counted
  by laying whole rows and reading the columns
- **THEN** the search reports one answer exactly where one picture fits

### Requirement: An Unreasonable Pattern board has one answer that the lines do not reach

At Unreasonable the generator SHALL accept a grid only when the per-line
solver leaves some cell of it undecided and the search proves its clues have
exactly one answer. Its retry bound SHALL be counted in squares drawn, so that
a small size whose such boards are rare is given enough grids to find one.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×4 to 10×10
- **THEN** the per-line solver leaves each unfinished
- **AND** exactly one picture fits each board's clues, by a count that has no
  search in it

### Requirement: Pattern refuses Unreasonable at a size none of whose boards needs it

`validateParams` SHALL refuse Unreasonable, when a board is to be dealt, for a
grid one square wide or tall and for any grid up to 3×3, with the collection's
sentence that no puzzle of that size is Unreasonable. No picture of those
sizes has one answer that the lines do not reach. A board of such a size that
arrives with its description SHALL still load.

#### Scenario: A 3x3 Unreasonable board is not dealt

- **WHEN** the params of an Unreasonable 3×3, 2×3 or 1×5 board are checked for
  dealing
- **THEN** each is refused
- **AND** the same params are accepted for a board that arrives with its
  description

#### Scenario: No picture of a refused size needs search

- **WHEN** every picture of every size up to 3×3 is given to the per-line
  solver
- **THEN** wherever the solver leaves a cell undecided, a second picture fits
  the same clues

### Requirement: A pasted Pattern board opens at the tier it needs

A board that arrives as a game ID SHALL open as Easy where the per-line solver
and the hint finish it, and as Unreasonable where it has exactly one answer
that they do not reach, whatever tier its ID states below that. A board with
several answers SHALL be refused with the collection's sentence that it has
more than one solution, and a board with none with the sentence that its clues
contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the lines do not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 2×2 ID whose two diagonals both fit, and one whose clues
  contradict each other, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory
