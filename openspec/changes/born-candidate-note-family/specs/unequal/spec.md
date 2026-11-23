## MODIFIED Requirements

### Requirement: Rules: Unequal is a Latin square with clues between neighbors

Unequal SHALL be a Latin-square puzzle on a `w × w` grid: the player places a
number `1..w` in every cell so each row and column contains every number
exactly once, subject to clues between orthogonally adjacent cells. The board
SHALL be reported solved exactly while the filled grid satisfies every row,
column and clue constraint.

#### Scenario: Entering the last correct number completes the board

- **WHEN** the player enters the final number that completes a correct grid
- **THEN** `status` reports the resulting state as solved

### Requirement: Params: Unequal's parameters and their encoding

Params SHALL be the size `w` and the tier Easy, Normal, Tricky, Hard or
Unreasonable. They SHALL be encoded `{w}` with a `d{c}` suffix for the tier
when full, `c` being upstream's `t`, `e`, `k`, `x` or `r` in that order. A
string with no `d` SHALL decode as Normal. The default board SHALL be 4×4 at
Normal, upstream's.

#### Scenario: A string with no difficulty

- **WHEN** `5` is decoded
- **THEN** it is a 5×5 board at Normal, whose full form is `5de`

#### Scenario: Params round-trip

- **WHEN** the params `6dx` are read
- **THEN** they are 6×6 at Hard, written `6dx` in full and `6` in brief

### Requirement: Description: A malformed Unequal description, or a sign flagged at both ends, is refused

A desc SHALL be refused when it has the wrong number of cells, a number outside
`0..w`, a flag pointing off the grid, a sign flagged from both its cells,
which would make each the greater, or a board with more than one answer.
Every cell SHALL be written out: a letter standing for a run of blank cells
SHALL be refused.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with the wrong number of cells or a flag that points off the
  grid is validated
- **THEN** the result is a non-null error

#### Scenario: A sign flagged from both ends

- **WHEN** a desc flags a sign toward a neighbor that flags one back
- **THEN** the desc is refused as contradictory

### Requirement: Controls: A digit places a number or toggles its pencil mark, and Backspace or Space clears

Unequal SHALL be played as every born board of numbers is
(`described-fill-game`, "A born game's values may be typed into a selected
cell"). With a cell highlighted, a value's key (a digit, and from 10 a
letter, `a` for 10) SHALL place that number, or toggle its pencil mark in
pencil mode, and Backspace, Space or `0` SHALL clear it. Given cells SHALL
reject entry, and in pencil mode no key SHALL change a cell holding a number.

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)

### Requirement: Controls: A clue is struck through by a click or a modified arrow

A sign SHALL be marked done as every born game's clue is
(`described-fill-game`, "A born game's clue may be marked done"): a press of
either button in its gap marks it and a second unmarks it, a drag on marks
each sign it passes that looked the same, and Shift or Ctrl with an arrow
marks the sign between the selected cell and its neighbor that way.

#### Scenario: Clicking a clue toggles its spent state

- **WHEN** the player clicks a greater-than sign, then clicks it again
- **THEN** the sign is marked done after the first click and unmarked after
  the second, and no number or note has changed

### Requirement: Controls: Unequal provides on-screen key labels

Unequal SHALL offer one key per value `1..w`, labeled `1` to `9` and then
`a`, `b` and so on, followed by a clear key.

#### Scenario: The keypad covers the grid's digits plus clear (order < 10)

- **WHEN** the key labels are requested for a 4×4 Unequal board
- **THEN** the result is the buttons `1,2,3,4` followed by a clear key

### Requirement: Hint: Unequal's hint is the shared candidate plan over rows and columns

Unequal's hint SHALL be the candidate walk of a born board that keeps notes
(`described-fill-game`, "A born game with notes hints through the candidate
walk"), with the sign technique its description states recorded as the rung
`sign`, a firing a leg a cell, each worded by the description's wording for
the end it strikes. What its marks stand for SHALL be the legend's
(`play.hintMarks`).

#### Scenario: A single on an Unequal board

- **WHEN** a step places a number because it fits one cell of its row
- **THEN** its sentence is the shared narrator's and names no sign

### Requirement: Hint: The hint starts on the implicit reading

Unequal's description SHALL state the implicit reading of an unmarked cell as
the one a fresh game starts on (`play.hintNotes`), because a sign strikes from
one cell at a time.

#### Scenario: A hint on a board with no notes

- **WHEN** a hint is asked, under the game's own default reading, on a board
  with no pencil notes
- **THEN** no step is the fill-all move

### Requirement: Look: Unequal renders greater-than signs between cells

`redraw` SHALL render the `w × w` grid with a gap between cells, drawing a
greater-than sign in the gap pointing from the larger toward the smaller cell
of each sign dealt. Each sign SHALL be colored to distinguish a normal sign, a
currently-violated sign (red), and a sign marked done (gray).

#### Scenario: A board draws its greater-than signs

- **WHEN** the initial frame of a dealt board is rendered
- **THEN** a greater-than polygon is drawn in the gap of each sign

## ADDED Requirements

### Requirement: Generation: Unequal derives every clue from a Latin square and hides them

A deal SHALL draw a Latin square, derive every given and every true sign
from it, and hide givens and signs in one random order while the board still
finishes at its tier, as every born deal hides (`deal.hide`). An Easy board
reads no sign, so it shows none.

#### Scenario: An Easy board shows no sign

- **WHEN** a board is dealt from the params `5dt`, 5×5 at Easy
- **THEN** its desc flags no sign

## REMOVED Requirements

### Requirement: Controls: The keypad is zero-based from order 10

**Reason**: A born board of numbers types and draws a value past 9 as a
letter from `a`, as Solo does, so 10 is `a` where upstream wrote it `9`.
**Migration**: None: a game ID is unchanged, since the desc writes numbers in
decimal.

### Requirement: Hint: The hint's marks are drawn in the gap beside the box

**Reason**: A born game's ring circles what its cell shows, its number or its
notes, as every born game's does (`described-fill-game`); the outline stays
on the box's edge.
**Migration**: None.
