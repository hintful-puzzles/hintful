## ADDED Requirements

### Requirement: Rules: A sign says its open end holds the greater number

A greater-than sign between two cells SHALL mean the number at its open end
is greater than the number at its pointed end. Not every true sign is dealt,
so two neighbors with no sign between them may hold any two numbers.

#### Scenario: A sign broken

- **WHEN** the player fills the pointed end of a sign with a number greater
  than its open end's
- **THEN** the board is not solved, and the sign is drawn as an error

### Requirement: Params: Unequal refuses the 3×3 tiers no board needs

`validateParams` SHALL refuse, when a board is to be dealt, an order of 3 at
Tricky or Unreasonable, which no 3×3 board needs.

#### Scenario: A 3×3 at Hard deals

- **WHEN** a board is to be dealt from the params `3dx`
- **THEN** it is not refused, and the board dealt needs Hard

#### Scenario: A 3×3 at Unreasonable is refused

- **WHEN** a board is to be dealt from the params `3dr`
- **THEN** it is refused with "No 3x3 puzzle is Unreasonable."
- **AND** a board that arrives with its description under those params opens

### Requirement: Description: A malformed Unequal description, or a sign flagged at both ends, is refused

A desc SHALL be refused when it has the wrong number of cells, a number outside
`0..order`, a flag pointing off the grid, or a sign flagged from both its
cells, which would make each the greater. Every cell SHALL be written out: a
letter standing for a run of blank cells SHALL be refused.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with the wrong number of cells or a flag that points off the
  grid is validated
- **THEN** the result is a non-null error

#### Scenario: A sign flagged from both ends

- **WHEN** a desc flags a sign toward a neighbor that flags one back
- **THEN** the desc is refused as contradictory

### Requirement: Generation: An Unequal board keeps the collection's promise at its tier

What a board dealt at a tier promises SHALL be the collection's
(`engine-difficulty`, "Every tier promises one solution found at its cap", "A
difficulty tier binds the board it generates" and "A generator never settles
for a lower tier"), with no departure.

#### Scenario: An Unequal board at Hard

- **WHEN** a board is dealt from the params `6dx`, 6×6 at Hard
- **THEN** the solver capped at Tricky does not finish it, and capped at Hard
  it does

### Requirement: Solver: Unequal's ladder is its description

Unequal's solver SHALL run the ladder of `unequal.description.yaml`: the sign
technique it states and the Latin library's it places, each at the tier the
description gives it. The search above them stays the engine's.

#### Scenario: A sign fires as its description states it

- **WHEN** a sign's smaller end has 3 as its least candidate and the larger
  end still notes 2 and 3, at a cap of Easy or above
- **THEN** the solver strikes 2 and 3 from the larger end in one firing

### Requirement: Hint: A sign's elimination is one firing of one sign

A sign elimination SHALL be the greater-than bound deduction: a single
technique firing, striking the candidates it rules out of one cell by one
`pencilStrike` move. One recorded firing SHALL map to exactly one `group`, so
a hint step never mixes signs.

#### Scenario: A strike step stays in its narrated cell

- **WHEN** a sign elimination's step is built
- **THEN** every mark its `pencilStrike` clears lies in one cell, and that cell
  is one of the two the sign sits between

#### Scenario: An inequality bound is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a
  greater-than sign rules a value out of one of its two cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the narration names the greater-than relationship and the bounding
  cell's smallest/largest possible value, concluding in the necessity voice

### Requirement: Hint: Unequal's hint reasons no harder than its board's tier

The hint's recording solver SHALL try a lower tier's technique before a
higher one's and, on a board below Unreasonable, SHALL be capped at the
board's own tier. So a sign's bound SHALL be offered from Normal up, a set
within one row or column from Tricky up, and one number's places across
several rows and columns at Hard.

#### Scenario: An Easy board has no clue strikes

- **WHEN** a hint is asked on a board dealt from the params `4dt`, 4×4 at Easy
- **THEN** no step reasons from a sign: each one places a number, as the last
  its row and column leave the cell or in the last cell of a row or column
  left for it

### Requirement: Look: Unequal renders greater-than signs between cells

`redraw` SHALL render the `order × order` grid with a gap between cells,
drawing a greater-than sign in the gap pointing from the larger toward the
smaller cell of each sign dealt. Each sign SHALL be colored to distinguish a
normal sign, a currently-violated sign (red), and a struck-through ("spent")
sign.

#### Scenario: A board draws its greater-than signs

- **WHEN** the initial frame of a generated board is rendered
- **THEN** a greater-than polygon is drawn in the gap of each sign

## MODIFIED Requirements

### Requirement: Rules: Unequal's mistake check re-solves from its givens and clues

Unequal's `findMistakes` SHALL judge the board against the answer it re-solves
from the givens and clues.

#### Scenario: A wrong number that breaks no rule

- **WHEN** the player enters a number that repeats nothing in its row or
  column, breaks no sign as the board stands, and is not the answer's
- **THEN** `findMistakes` includes that cell

### Requirement: Params: Unequal's parameters and their encoding

Params SHALL be `order` and `diff`, held as the values `"trivial"`, `"easy"`,
`"tricky"`, `"extreme"` and `"recursive"`, which are the tiers Easy, Normal,
Tricky, Hard and Unreasonable in that order. They SHALL be encoded `{order}`
with a `d{c}` suffix for difficulty when full, `c` being `t`, `e`, `k`, `x`
or `r` in that order of the values. A string with no `d` SHALL decode as
Normal.

#### Scenario: A string with no difficulty

- **WHEN** `4` is decoded
- **THEN** it is a 4×4 board at Normal, whose full form is `4de`

#### Scenario: Params round-trip

- **WHEN** params `{ order: 6, diff: "extreme" }` are encoded with
  `full = true`
- **THEN** the result is `6dx`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`

### Requirement: Controls: A clue is struck through by a click or a modified arrow

A click of either button on a greater-than sign in the gap between two cells,
or a shift/ctrl-cursor toward a neighboring sign, SHALL toggle that sign's
struck-through ("spent") state.

#### Scenario: Clicking a clue toggles its spent state

- **WHEN** the player clicks a greater-than sign
- **THEN** `executeMove` toggles that sign's spent flag

### Requirement: Controls: Unequal provides on-screen key labels

Unequal SHALL implement `requestKeys(params)` returning one button per grid
value `1..order` followed by a clear key (button code `8`, labeled `"Clear"`).
Each value button's label SHALL be its own character.

#### Scenario: The keypad covers the grid's digits plus clear (order < 10)

- **WHEN** the key labels are requested for an order-4 Unequal board
- **THEN** the result is the buttons `1,2,3,4` followed by a clear key

### Requirement: Hint: Unequal's hint is the shared candidate plan over rows and columns

Unequal's hint SHALL be the collection's candidate-elimination plan, taken
through its row/column preset (`engine-candidate-hints`, "A shared
candidate-elimination hint plan" and "A row/column Latin square answers no
question its regions already settle"), departing only in the reading it starts
on. Unequal SHALL supply its recording solver and the words of its sign
deductions, which the requirements below state. What its marks stand for
SHALL be the legend's (`hintMarks`).

#### Scenario: A single on an Unequal board

- **WHEN** a step places a number because it fits one cell of its row
- **THEN** its sentence is the shared narrator's and names no sign

### Requirement: Hint: Unequal's clue sentences read correctly at the ends of the range

A sign step's indication SHALL be the inequality, and its sentence SHALL read
correctly at the degenerate value extremes: a bound at the edge of the range
SHALL name the smallest or largest number rather than a vacuous bound.

#### Scenario: A bound at the edge of the range

- **WHEN** a greater-than clue strikes 1 from its larger cell while the cell
  across it can still be 1
- **THEN** the narration says the larger side cannot hold the smallest number,
  and does not say the other cell is "at least 1"

### Requirement: Look: Unequal draws its boxes as quiet surfaces, with a given's lifted

`redraw` SHALL draw each cell as its own box, apart from its neighbors, on the
collection's cell surface, and a box holding a given number on the collection's
lifted surface of a given, so that a given is told by the box under it as well
as by its ink. A box's outline SHALL be the collection's surface grid line. The
signs between boxes are clues and SHALL keep their own colors, drawn on the
board between the boxes.

#### Scenario: A given is told by the box under it

- **WHEN** a board with given numbers is drawn
- **THEN** each given's box is the lifted surface
- **AND** every other box is the cell surface, outlined in the surface grid line

## REMOVED Requirements

### Requirement: Rules: Unequal has two modes

**Reason**: Adjacent is a game of its own (`split-adjacent-from-unequal`), so
Unequal has one clue, the sign.

**Migration**: "Rules: A sign says its open end holds the greater number";
the bar's rule is the `adjacent` spec's.

### Requirement: Params: Unequal refuses small Adjacent boards and the 3×3 tiers no board needs

**Reason**: The small-board refusal is Adjacent's.

**Migration**: "Params: Unequal refuses the 3×3 tiers no board needs", and the
`adjacent` spec's "Params: Adjacent refuses a small board above Normal".

### Requirement: Description: A malformed Unequal description is refused

**Reason**: A bar flagged from one end is Adjacent's desc to refuse.

**Migration**: "Description: A malformed Unequal description, or a sign
flagged at both ends, is refused", and the `adjacent` spec's "Description: A
bar is flagged from both its cells".

### Requirement: Generation: What an Unequal board promises at its tier is the collection's

**Reason**: Its scenario was an Adjacent board.

**Migration**: "Generation: An Unequal board keeps the collection's promise at
its tier".

### Requirement: Generation: An Adjacent board carries every bar

**Reason**: Adjacent is a game of its own.

**Migration**: The `adjacent` spec's "Generation: An Adjacent board carries
every bar, and keeps its tier's promise".

### Requirement: Solver: Unequal's ladder is its two descriptions

**Reason**: Unequal has one description.

**Migration**: "Solver: Unequal's ladder is its description", and the
`adjacent` spec's "Solver: Adjacent's ladder is its description".

### Requirement: Hint: A clue elimination is one firing of one clue

**Reason**: Its bar scenario is Adjacent's.

**Migration**: "Hint: A sign's elimination is one firing of one sign", and the
`adjacent` spec's "Hint: Adjacent's hint is the shared candidate plan, its
bars one firing at a time".

### Requirement: Hint: A bar is read against a neighbor that is still undecided

**Reason**: Adjacent is a game of its own.

**Migration**: The `adjacent` spec's requirement of the same name.

### Requirement: Hint: Unequal's hint reasons no harder than the board's tier

**Reason**: Its scenario of a Normal board was an Adjacent board.

**Migration**: "Hint: Unequal's hint reasons no harder than its board's
tier", and the `adjacent` spec's "Hint: Adjacent's hint reasons no harder
than the board's tier".

### Requirement: Look: Unequal renders greater-than signs or adjacency bars between cells

**Reason**: Adjacent draws its own bars.

**Migration**: "Look: Unequal renders greater-than signs between cells"; the
bars are drawn by Adjacent (`adjacent` spec, "Rules: Adjacent shares
Unequal's board and controls").
