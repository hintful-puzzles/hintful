## MODIFIED Requirements

### Requirement: Palisade's parameters are a size and a region size

Params SHALL be `w`, `h`, `k` (the region size) and a difficulty, Easy or
Unreasonable. They SHALL encode as `{w}x{h}n{k}`, and the difficulty in the
full form only, as `de` or `du`. A bare number SHALL decode as a square grid
whose region size is its width, and a string with no difficulty letter as
Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 8, h: 6, k: 6 }` are encoded
- **THEN** the result is `8x6n6`
- **AND** decoding `8x6n6` round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }`

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 8×6 board in regions of 6 is encoded
- **THEN** the full encoding is `8x6n6du` and the shared one `8x6n6`
- **AND** `8x6n6`, written before the game had tiers, decodes as Easy

### Requirement: Palisade generates uniquely solvable boards

At Easy `newDesc` SHALL emit only a board the deductive solver solves from
its clues alone, so the board has one division and needs no guess. It SHALL
strip clues, keeping a clue removed only while the solver still solves the
board.

#### Scenario: Generated boards are solvable

- **WHEN** `newDesc` produces an Easy board for each preset across several
  seeds
- **THEN** the deductive solver solves each board to a valid division (every
  region size `k`, every clue satisfied, no stray walls)

### Requirement: Palisade checks mistakes against the unique solution

`findMistakes(state)` SHALL take the board's one division from the search
that counts its answers, at either difficulty, and flag every edge where the
player has drawn a wall the solution lacks or set a no-wall mark where the
solution has a wall. Where the search did not prove exactly one division it
SHALL return an empty result, never a false positive. `redraw` SHALL redden
each flagged edge.

#### Scenario: A wrong wall is flagged

- **WHEN** the player draws a wall that the unique solution does not contain
- **THEN** `findMistakes` includes that edge
- **AND** `redraw`, given that mistake, draws the edge in the error color

#### Scenario: A correct partial board is clean

- **WHEN** every wall the player has drawn agrees with the unique solution
- **THEN** `findMistakes` returns an empty result

## ADDED Requirements

### Requirement: Palisade counts a clue set's answers by a bounded search

The game SHALL count a clue set's divisions up to two by trial and error over
the solver, assuming an undecided edge a wall and then not where the solver
stops. It SHALL report one answer, several, none, or that it stopped at its
budget, which SHALL be counted in positions and never in time. Solve SHALL
take the answer from it at either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 5×5 board the solver finishes, on one with
  one division that it does not reach, on one with no clue and on one whose
  only clue is a 4
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by laying whole regions
  down one at a time
- **THEN** the search reports one answer exactly where one division fits,
  several where more do and none where none does

### Requirement: Palisade's solver run says when a position is impossible

After the deductions stop, a position SHALL be reported contradictory where
a region is past its size, a wall lies inside a region, a clue has more walls
than its number or too few edges left to reach it, or a region short of its
size has no undecided edge to grow through. It SHALL be reported solved once
the walls are a whole division that meets every clue.

#### Scenario: Each kind of impossible position is told at once

- **WHEN** four boards, one for each kind, are searched with exactly the
  positions each needs, and with one fewer
- **THEN** each has one answer with them and is out of reach with one fewer

### Requirement: An Unreasonable Palisade board has one answer that the solver does not reach

At Unreasonable the generator SHALL take an Easy board and strip further
clues, each only while the search still proves one division within a budget
of its own, well under the search's, and SHALL keep the board only when the
solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 3×2 to 6×6
- **THEN** the solver leaves each unfinished
- **AND** exactly one division fits each, by a count that has no search in it

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 3×2 board in threes, 2×4 in fours, 3×3 in threes
  and 12×15 in tens is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Palisade refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide or high, and one in regions of one. Such a board
divides one way whatever its clues, and the solver finds that way with none.

#### Scenario: A strip is not dealt at Unreasonable

- **WHEN** a 1×4 board in twos, a 6×1 board in threes and a 3×4 board in
  ones are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** the same params with a description supplied are accepted

#### Scenario: The solver finishes such a board with no clue

- **WHEN** the solver runs on a strip or a board in regions of one that has
  no clue at all
- **THEN** it finishes it, and the board divides exactly one way

### Requirement: Unreasonable is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 180 squares, with a reason naming the difficulty. The same
size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** a 14×13 board in sevens is checked for dealing at each difficulty
- **THEN** it is refused at Unreasonable and not at Easy
- **AND** a 12×15 board in tens and a 9×20 board in sixes are admitted at
  Unreasonable

### Requirement: Palisade's menu offers each board at both difficulties

Palisade's presets SHALL offer each of its four boards, 5×5 in fives, 6×8 in
sixes, 8×10 in eights and 12×15 in tens, as Easy and as Unreasonable, and the
default SHALL be the Easy 5×5.

#### Scenario: Every board is offered at both difficulties

- **WHEN** Palisade's preset menu is read
- **THEN** its four boards each appear as Easy and then as Unreasonable

### Requirement: A pasted Palisade board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one division that
they do not reach, whatever lower difficulty its ID states. A board with
several divisions SHALL be refused as having more than one solution, and a
board with none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one division the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5n5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 5×5 board with no clue, and one whose only clue is a 4, are
  entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Palisade's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the edges its deductions force from the player's walls and marks and no
others, and where none is forced it SHALL refuse with the collection's
sentence that deduction has run out. It SHALL go on from the edges the player
then decides.

#### Scenario: The hint stops, and goes on from an edge tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** an edge decided wrongly there is reported by the mistake check
- **AND** with an edge decided as the solution has it wherever the hint
  stops, the hint finishes the board
