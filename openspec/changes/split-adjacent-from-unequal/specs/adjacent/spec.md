## ADDED Requirements

### Requirement: Rules: Adjacent is a Latin square whose bars mark the neighbors one apart

Adjacent SHALL be a Latin-square puzzle on an `order × order` grid: every row
and column holds each number `1..order` once, a bar between two neighboring
cells means their numbers differ by exactly 1, and no bar means they do not.
The board SHALL be reported solved exactly while the filled grid satisfies
every row, column and bar.

#### Scenario: A missing bar is a clue

- **WHEN** a grid is filled as a Latin square in which two neighboring cells
  with no bar between them hold 2 and 3
- **THEN** the board is not solved, and the gap between them is drawn as an
  error

### Requirement: Rules: Adjacent shares Unequal's board and controls

Adjacent SHALL play on the edge-clue Latin square Unequal plays on, its board,
description format, controls, keypad, preferences, mistake check and look
being Unequal's requirements read with a bar for a sign. What a bar says, its
params, how its boards are dealt and what its hint says are Adjacent's own.

#### Scenario: A wrong number is found against the bars

- **WHEN** the player enters a number that repeats nothing in its row or
  column and breaks no bar as the board stands, but is not the answer's
- **THEN** `findMistakes` includes that cell

### Requirement: Params: Adjacent's parameters and their encoding

Params SHALL be `order` and `diff`, encoded as Unequal's are (`{order}`, then
`d{c}` when full), with no mode letter. A string with no `d` SHALL decode as
Normal, and the default board SHALL be 5×5 Normal. Upstream's form, Unequal's
Adjacent mode with an `a` after the order, SHALL be read as the same params.

#### Scenario: Params round-trip

- **WHEN** params `{ order: 5, diff: "tricky" }` are encoded with `full = true`
- **THEN** the result is `5dk`, and decoding it round-trips the params
- **AND** encoding with `full = false` yields `5`

#### Scenario: Upstream's params string

- **WHEN** `5adk` is decoded
- **THEN** it is the params `{ order: 5, diff: "tricky" }`

### Requirement: Params: Adjacent refuses a small board above Normal

`validateParams` SHALL refuse a board below order 5 at Tricky or harder.

#### Scenario: A 4×4 at Tricky

- **WHEN** `validateParams` is called with `{ order: 4, diff: "tricky" }`
- **THEN** it returns "Size must be at least 5 for puzzles of this
  difficulty."

### Requirement: Description: A bar is flagged from both its cells

A desc SHALL flag a bar from both cells it joins, and SHALL be refused as
contradictory when a cell flags a bar its neighbor does not flag back.

#### Scenario: A bar flagged from one end only

- **WHEN** a desc flags a bar toward a neighbor that does not flag it back
- **THEN** the desc is refused as contradictory

### Requirement: Generation: An Adjacent board carries every bar, and keeps its tier's promise

`newDesc` SHALL flag every bar the solution makes true, so that the absence
of a bar is a clue, and only number givens are added and stripped. What a
board dealt at a tier promises SHALL be the collection's (`engine-difficulty`,
"Every tier promises one solution found at its cap").

#### Scenario: An Adjacent board carries every bar

- **WHEN** a board is generated
- **THEN** a bar is flagged, from both ends, between every pair of neighboring
  cells whose solution values differ by exactly 1, and between no other pair

#### Scenario: An Adjacent board at Hard

- **WHEN** a board is dealt from the params `5dx`
- **THEN** the solver capped at Tricky does not finish it, and capped at Hard
  it does

### Requirement: Solver: Adjacent's ladder is its description

Adjacent's solver SHALL run the ladder of `adjacent.description.yaml`: the
bar techniques it states and the Latin library's it places, each at the tier
the description gives it. The search above them stays the engine's.

#### Scenario: A bar beside a placed number

- **WHEN** a bar joins a cell to a neighbor holding 3, at a cap of Normal or
  above
- **THEN** the solver strikes from the cell every number but 2 and 4

### Requirement: Controls: A bar is struck through by a click or a modified arrow

A click of either button on a bar, or a shift/ctrl-arrow from a cell toward a
neighbor it shares a bar with, SHALL toggle that bar's struck-through
("spent") state, whichever of the bar's two cells the arrow starts from.

#### Scenario: A bar marked from either side

- **WHEN** the player selects the cell right of a bar and presses
  Shift+Left, then selects the cell left of it and presses Shift+Right
- **THEN** the bar is grayed out after the first press and restored after the
  second

### Requirement: Hint: Adjacent's hint is the shared candidate plan, its bars one firing at a time

Adjacent's hint SHALL be the collection's candidate-elimination plan through
its row/column preset (`engine-candidate-hints`), starting on the implicit
reading. A bar deduction SHALL strike the candidates one bar, or its absence,
rules out of one cell, in one `pencilStrike`, its two cells outlined.

#### Scenario: A bar beside a filled cell is taught as a note strike

- **WHEN** a hint is asked on a fully-penciled board where a bar (or its
  absence) beside a filled cell rules a value out of the neighbor
- **THEN** the hint returns a `pencilStrike` step clearing those candidates
  from that one cell, the narration stating that the two numbers must (or
  must not) differ by exactly one

### Requirement: Hint: A bar is read against a neighbor that is still undecided

The hint SHALL rule out of a cell each number that fits none of the numbers
still open in a neighbor: across a bar, a number with nothing open one away
from it there, and across a gap with no bar, a number that every open number
there equals or is one away from. It SHALL say "A bar joins this cell to its
neighbor with nothing open one away from" those numbers, or "No bar joins
this cell to its neighbor, whose numbers all clash with" them.

#### Scenario: A bar beside a neighbor down to two numbers

- **WHEN** a bar joins a cell that can still be 1 to 5 to a neighbor whose
  open numbers are 1 and 2
- **THEN** 4 and 5 are ruled out of the cell and 3 is kept, the neighbor's 2
  being one away from it
- **AND** the sentence says the neighbor has nothing open one away from 4 or 5

### Requirement: Hint: Adjacent's sentences read correctly at the ends of the range

A bar's sentence SHALL speak of being one away from N, and SHALL NOT say
"N−1 or N+1", which is wrong at 1 and at the order.

#### Scenario: A bar beside a 1

- **WHEN** a bar joins a cell to a neighbor holding 1
- **THEN** the sentence says they must differ by exactly 1, and names no 0

### Requirement: Hint: Adjacent's hint reasons no harder than the board's tier

The hint's recording solver SHALL be capped at the board's tier below
Unreasonable, so a bar beside a placed number SHALL be offered from Normal
up, and a bar read against an undecided neighbor and a set within one row or
column from Tricky up.

#### Scenario: A Normal board

- **WHEN** a hint is asked on a board dealt from the params `5de`
- **THEN** no step reads a bar against an undecided neighbor, and none is a
  set
