## MODIFIED Requirements

### Requirement: Filling's parameters

Params SHALL be `w`, `h` and a difficulty, Easy or Unreasonable. A `w` or an
`h` below 1 SHALL be refused. The encoding SHALL carry `{w}x{h}`, and the
difficulty in the full form only, as `de` or `du`. A string with no difficulty
letter SHALL decode as Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` are encoded
- **THEN** the result is `13x9`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `9` yields a 9×9 square grid

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 13×9 board is encoded
- **THEN** the full encoding is `13x9du` and the shared one `13x9`
- **AND** `13x9`, written before the game had tiers, decodes as Easy

### Requirement: Filling generates uniquely solvable boards

`newDesc` SHALL deal a board whose regions are no larger than
`min(max(max(w,h),3), 9)` cells. At Easy it SHALL publish only a clue set from
which the solver still solves the board, and an Easy board SHALL be the one
upstream's generator deals from the same seed.

#### Scenario: Every generated board is solvable

- **WHEN** an Easy board is generated for any preset
- **THEN** the solver fills every cell
- **AND** each resulting region's size equals its number

### Requirement: Filling reports mistakes for Check & Save

The game SHALL implement `findMistakes(state)` by taking the board's one
answer from the search that counts its answers, at either difficulty, and
returning every player-filled cell whose number contradicts it. It SHALL
return an empty result when the search did not prove exactly one answer.

#### Scenario: A wrong fill is flagged and clears

- **WHEN** a player fills a cell with a number that contradicts the unique
  solution and `findMistakes` is called
- **THEN** that cell is reported as a mistake
- **AND** when the cell is corrected the mistake is no longer reported

## REMOVED Requirements

### Requirement: A Filling board loads when its hint and its solver both finish it

**Reason**: Filling has tiers, so it no longer answers `finishesByDeduction`.
A board the solver and the hint finish is an Easy one, and a board with one
answer that they do not reach now loads as Unreasonable.

**Migration**: "A pasted Filling board opens at the difficulty it needs",
which keeps the board of three 2s and says how it is refused.

## ADDED Requirements

### Requirement: Filling counts a clue set's answers by a bounded search

The game SHALL count a clue set's answers up to two by trial and error over
the solver, assuming each number an empty square can still take where the
solver stops. It SHALL report one answer, several, none, or that it stopped
at its budget, which SHALL be counted in positions and never in time. Solve
SHALL take the answer from it at either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the solver finishes, on a 5×5 with one
  answer that it does not reach, on an empty 3×1 and on a 3×1 of three 2s
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by writing numbers into the
  empty squares one at a time
- **THEN** the search reports one answer exactly where one filling fits,
  several where more do and none where none does

### Requirement: Filling's solver run says when a position is impossible

After the deductions stop, a position SHALL be reported contradictory where a
region is past its number's size or is walled in short of it, and solved only
where every region is exactly its size.

#### Scenario: A region past its size, and one shut in short

- **WHEN** the search is given one position to try on `3x1:222`, `3x1:121`
  and `4x1:13a1`
- **THEN** it reports no answer for each
- **AND** on an empty 3×1 it reports that it stopped

### Requirement: An Unreasonable Filling board has one answer that the solver does not reach

At Unreasonable the generator SHALL hide clues from a full board while the
search still proves one answer within a budget of its own, well under the
search's, and SHALL keep the board only when the solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 2×2 to 6×6
- **THEN** the solver leaves each unfinished
- **AND** exactly one filling fits each, by a count that has no search in it

#### Scenario: The smallest boards carry the tier

- **WHEN** an Unreasonable 1×2, 2×2, 1×5 or 2×3 board is dealt
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Filling refuses Unreasonable where no board of a size needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide and one, three or four squares long, lying either way.
No clue set of those sizes has one answer that the solver does not reach.

#### Scenario: A strip of three is not dealt at Unreasonable

- **WHEN** a 1×1, 1×3, 3×1, 1×4 or 4×1 Unreasonable board is asked for
- **THEN** it is refused with the sentence that no puzzle of that size is
  Unreasonable
- **AND** the same params with a description supplied are accepted

#### Scenario: Every clue set of a refused size is one the solver finishes

- **WHEN** every clue set of each refused size is counted
- **THEN** each one with exactly one answer is finished by the solver

### Requirement: Filling rejects board sizes it cannot generate

`validateParams` SHALL refuse, when a board is to be dealt at either
difficulty, a board of more than 300 squares, with a reason naming that
maximum. The retry cap on filling a board with regions SHALL be sized to the
rarest board the bound admits. A description that is supplied SHALL NOT be
held to the bound.

#### Scenario: A board past the bound is refused with a reason

- **WHEN** an 18×17, a 20×20 and a 1×301 board are validated for generation
- **THEN** each is refused with a message naming 300
- **AND** a 17×17, a 15×20 and a 1×300 board are admitted at either difficulty

#### Scenario: An existing large description still loads

- **WHEN** a 25×25 board's params accompany a supplied description
- **THEN** validation succeeds

### Requirement: Filling's menu offers each size at both difficulties

Filling's presets SHALL offer each of 7×9, 9×13 and 13×17 as Easy and as
Unreasonable, and the default SHALL be an Easy 9×13.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Filling's preset menu is read
- **THEN** its 7×9, 9×13 and 13×17 boards each appear as Easy and as
  Unreasonable

### Requirement: A pasted Filling board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one answer that they
do not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** an empty 3×1 board and `3x1:222`, whose three 2s are one region of
  three, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Filling's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the steps its deductions force from the player's numbers and no others,
and where none forces anything it SHALL refuse with the collection's sentence
that deduction has run out. It SHALL go on from the numbers the player then
enters.

#### Scenario: The hint stops, and goes on from a number tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a number entered wrongly there is reported by the mistake check
- **AND** with a number entered as the solution has it wherever the hint
  stops, the hint finishes the board
