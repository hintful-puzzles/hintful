## MODIFIED Requirements

### Requirement: Separate's parameters are a size and a letter count

Params SHALL be `w`, `h`, `k` (the letter count) and a difficulty, Easy or
Unreasonable. They SHALL encode as `{w}x{h}n{k}`, and the difficulty in the
full form only, as `de` or `du`. A bare `{w}` SHALL decode to a square
`w × w` grid with `k = w`, and a string with no difficulty letter as Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, h: 6, k: 4 }` are encoded
- **THEN** the result is `6x6n4`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }`

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 6×6 board with four letters is encoded
- **THEN** the full encoding is `6x6n4du` and the shared one `6x6n4`
- **AND** `6x6n4`, written before the game had tiers, decodes as Easy

### Requirement: Every generated Separate board is solved by its own solver

At Easy the generator SHALL keep a board only when the solver, run to a
fixpoint, fully solves it, so every Easy board has one partition and that
solver reaches it.

#### Scenario: Generated boards are uniquely solvable

- **WHEN** the generator produces an Easy board for given params
- **THEN** the solver run to a fixpoint partitions it into `k`-ominoes each
  holding one of each letter

### Requirement: Separate ships findMistakes for Check & Save

The game SHALL implement `findMistakes`: take the board's one partition from
the search that counts its answers, at either difficulty, and return every
player edge whose state contradicts it, a wall where the solution has none or
a no-wall mark where the solution has a wall. A flagged edge SHALL be drawn
in the error color. Where the search did not prove exactly one partition
`findMistakes` SHALL return an empty list.

#### Scenario: A contradicting wall is flagged

- **WHEN** the player draws a wall that the unique solution does not have and
  Check & Save runs
- **THEN** `findMistakes` includes that edge
- **AND** the next `redraw` draws that edge in the error color

## REMOVED Requirements

### Requirement: The hint refuses a board its solver cannot finish

**Reason**: Separate has tiers. A board the solver cannot finish from empty
may be an Unreasonable one, with one partition the search has proved, and the
mistake check vouches for the player's marks on it from that partition.

**Migration**: "Separate's hint stops where the solver does" says what the
hint does on such a board. A board with several partitions or none no longer
loads at all ("A pasted Separate board opens at the difficulty it needs").

## ADDED Requirements

### Requirement: Separate counts a board's answers by a bounded search

The game SHALL count a board's partitions up to two by trial and error over
the solver: where the solver stops, it SHALL take the region with the fewest
squares it could still grow into and assume it takes the first of them, and
then that it does not. It SHALL report one answer, several, none, or that it
stopped at its budget, which SHALL be counted in positions and never in time.
Solve SHALL take the answer from it at either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the solver finishes, on one with
  one partition that it does not reach, on one whose rows and whose 2×2
  blocks each hold one of each letter, and on one that is all As
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, and the same with letters swapped
  anywhere, are each counted by laying whole regions down one at a time
- **THEN** the search reports one answer exactly where one partition fits,
  several where more do and none where none does

### Requirement: Separate's solver run says when a position is impossible

After the rungs stop, a position SHALL be reported contradictory where a
region short of its size has no neighboring square it may still take, and
solved once every region is of full size.

#### Scenario: A region that cannot grow is told at once

- **WHEN** a 5×5 board that needs 13 positions is searched with 13, and with
  12
- **THEN** it has one answer with 13 and is out of reach with 12

### Requirement: An Unreasonable Separate board has one answer that the solver does not reach

At Unreasonable the generator SHALL take an Easy board and swap pairs of
letters inside a region it was dealt from, each only while the search still
proves one partition within a budget of its own, well under the search's, and
SHALL keep the board only when the solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×4 to 6×6
- **THEN** the solver leaves each unfinished
- **AND** exactly one partition fits each, by a count that has no search in it

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 4×2 board with four letters, 3×3 with three, 6×2
  with three and 6×6 with six is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Separate refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide or high, one with two letters, and a 3×2 board with
three. No such board has one partition that the solver does not reach.

#### Scenario: Such a board is not dealt at Unreasonable

- **WHEN** a 6×1 board with three letters, a 4×4 board with two and a 2×3
  board with three are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** the same params with a description supplied are accepted
- **AND** a 6×1 board with three letters is still dealt at Easy

#### Scenario: Every fill of a small such board is tried

- **WHEN** every fill of a strip, of a board with two letters up to 4×4 and
  of a 3×2 board with three letters is given to the solver, and those it
  leaves unfinished are counted by laying whole regions down
- **THEN** none of them has exactly one partition
- **AND** a 3×3 board with three letters has a fill that the solver leaves
  unfinished and that has exactly one

### Requirement: Separate's menu offers each board at both difficulties

Separate's presets SHALL offer each of its four boards, 4×4 with four
letters, 5×5 with five, 6×6 with four and 6×6 with six, as Easy and as
Unreasonable, and the default SHALL be the Easy 5×5.

#### Scenario: Every board is offered at both difficulties

- **WHEN** Separate's preset menu is read
- **THEN** its four boards each appear as Easy and then as Unreasonable

### Requirement: A pasted Separate board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one partition that
they do not reach, whatever lower difficulty its ID states. A board with
several partitions SHALL be refused as having more than one solution, and a
board with none as one that contradicts itself.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one partition the solver does not reach
  is entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4n4du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 4×4 board whose rows and 2×2 blocks each hold one of each
  letter, and one that is all As, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Separate's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the edges its rungs force from the player's walls and marks and no
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
