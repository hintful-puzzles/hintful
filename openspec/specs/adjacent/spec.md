# adjacent Specification

## Purpose
Adjacent, the Latin-square puzzle whose bars mark exactly the neighbors one
apart, upstream's Adjacent mode of Unequal. It is born from its description,
and plays on the fill board's board of numbers (`described-fill-game`),
whose spec holds what every born game shares. This spec holds what is
Adjacent's own: the bar, its params, its deal, its ladder, its look and its
hint's words.

## Requirements

### Requirement: Rules: Adjacent is a Latin square whose bars mark the neighbors one apart

Adjacent SHALL be a Latin-square puzzle on a `w × w` grid: every row and
column holds each number `1..w` once, a bar between two neighboring cells
means their numbers differ by exactly 1, and no bar means they do not. The
board SHALL be reported solved exactly while the filled grid satisfies every
row, column and bar.

#### Scenario: A missing bar is a clue

- **WHEN** a grid is filled as a Latin square in which two neighboring cells
  with no bar between them hold 2 and 3
- **THEN** the board is not solved, and the gap between them is drawn as an
  error

### Requirement: Params: Adjacent's parameters and their encoding

Params SHALL be the size `w` and the tier Easy, Normal, Tricky, Hard or
Unreasonable, encoded `{w}` with a `d{c}` suffix for the tier when full, `c`
being upstream's `t`, `e`, `k`, `x` or `r` in that order, with no mode
letter. A string with no `d` SHALL decode as Normal, and the default board
SHALL be 5×5 at Normal, upstream's. Upstream's form, Unequal's Adjacent mode
with an `a` after the size, SHALL be read as the same params, and the `a`
SHALL never be written.

#### Scenario: Params round-trip

- **WHEN** the params `5dk` are read
- **THEN** they are 5×5 at Tricky, written `5dk` in full and `5` in brief

#### Scenario: Upstream's params string

- **WHEN** `5adk` is read
- **THEN** it is 5×5 at Tricky, written `5dk` in full

### Requirement: Params: Adjacent refuses a small board above Normal

A board below 5×5 SHALL be refused at Tricky or harder, as having no such
tier.

#### Scenario: A 4×4 at Tricky

- **WHEN** the params `4dk` are checked
- **THEN** they are refused with "No 4x4 puzzle is Tricky."

### Requirement: Description: A bar is flagged from both its cells

A desc SHALL be a record a cell, upstream's: its given number or 0, then the
letters `URDL` of its bars, then a comma. A bar SHALL be written from both
cells it joins, and a desc SHALL be refused as contradictory when a cell
flags a bar its neighbor does not flag back; every edge flagged by neither
cell has no bar. A desc with more than one answer SHALL be refused.

#### Scenario: A bar flagged from one end only

- **WHEN** a desc flags a bar toward a neighbor that does not flag it back
- **THEN** the desc is refused as contradictory

#### Scenario: Upstream's desc written back

- **WHEN** a desc upstream's generator wrote is read and written again
- **THEN** it is the same, byte for byte

### Requirement: Generation: An Adjacent board carries every bar, and keeps its tier's promise

A deal SHALL draw a Latin square, derive every given and every bar from it,
so that the absence of a bar is a clue, and hide givens alone while the
board still finishes at its tier, as every born deal hides (`deal.hide`).
What a board dealt at a tier promises SHALL be the collection's
(`engine-difficulty`, "Every tier promises one solution found at its cap").

#### Scenario: An Adjacent board carries every bar

- **WHEN** a board is dealt
- **THEN** a bar is flagged, from both ends, between every pair of neighboring
  cells whose answer values differ by exactly 1, and between no other pair

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

A bar SHALL be marked done as every born game's clue is
(`described-fill-game`, "A born game's clue may be marked done"): a press of
either button on it marks it and a second unmarks it, a drag on marks each
bar it passes that looked the same, and Shift or Ctrl with an arrow marks
the bar between the selected cell and its neighbor that way, whichever of
its two cells the arrow starts from. A gap with no bar SHALL take no mark.

#### Scenario: A bar marked from either side

- **WHEN** the player selects the cell right of a bar and presses
  Shift+Left, then selects the cell left of it and presses Shift+Right
- **THEN** the bar is marked done after the first press and unmarked after
  the second

#### Scenario: No mark where no bar is

- **WHEN** the player presses Shift with an arrow toward a neighbor no bar
  joins
- **THEN** no clue is marked done

### Requirement: Controls: Adjacent is played as a born board of numbers

Adjacent SHALL be played as every born board of numbers is
(`described-fill-game`, "A born game's values may be typed into a selected
cell"): with a cell highlighted, a value's key (a digit, and from 10 a
letter, `a` for 10) places that number, or toggles its pencil mark in pencil
mode, and Backspace, Space or `0` clears it. Its mistake check SHALL be the
born board's, against the answer.

#### Scenario: A wrong number is found against the answer

- **WHEN** the player enters a number that repeats nothing in its row or
  column and breaks no bar as the board stands, but is not the answer's
- **THEN** the mistake check counts that cell

### Requirement: Hint: Adjacent's hint is the shared candidate plan, its bars one firing at a time

Adjacent's hint SHALL be the candidate walk of a born board that keeps notes
(`described-fill-game`, "A born game with notes hints through the candidate
walk"), starting on the implicit reading (`play.hintNotes`). Each bar
technique SHALL be its own rung, `adjacent` or `adjacentSet`, a leg a cell,
striking what one bar, or its absence, rules out of that cell, its two
cells outlined, worded by the description.

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
this cell to its neighbor with nothing open two or more from" them.

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

The hint SHALL run only the techniques of the board's tier below
Unreasonable, so a bar beside a placed number SHALL be offered from Normal
up, and a bar read against an undecided neighbor and a set within one row or
column from Tricky up.

#### Scenario: A Normal board

- **WHEN** a hint is asked on a board dealt from the params `5de`
- **THEN** no step reads a bar against an undecided neighbor, and none is a
  set

### Requirement: Look: Adjacent draws its bars in the gaps between cells

The board SHALL be drawn with a gap between cells, a bar across the gap of
each pair of neighbors it joins and nothing where none does. A bar SHALL be
red where its two numbers are not one apart and gray where the player marked
it done; where two neighbors with no bar between them are one apart, the
bar's outline SHALL be drawn red in their gap.

#### Scenario: A missing bar's breach

- **WHEN** a 2 is placed beside a 1 with no bar between them
- **THEN** a red outline of a bar is drawn in their gap, and no bar is filled
  there
