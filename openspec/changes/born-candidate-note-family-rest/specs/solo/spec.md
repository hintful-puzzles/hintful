## MODIFIED Requirements

### Requirement: Rules: Solo's four variants compose

Solo SHALL be played from its description alone (`described-fill-game`):
its blocks a ruleset, **Standard** (rectangles cut by the board's two sizes)
or **Jigsaw** (blocks one square wide, dealt as connected parts of equal
size), and two modifiers of either, **X** (the two long diagonals are units
too) and **Killer** (a second partition of cages, each with its total, that
no number repeats in). There SHALL be two difficulty scales: the tiers, and
the killer scale its cage readings grade on.

#### Scenario: Variants are served from one registered game

- **WHEN** a Standard, Jigsaw, X or Killer Solo board is requested
- **THEN** the same registered `solo` game deals a playable board for it
- **AND** a Jigsaw board has irregular blocks while a Standard board has
  rectangular ones
- **AND** an X board also holds every number once on each long diagonal, and
  a Killer board carries its cages and their totals

### Requirement: Rules: Solo is solved when every region holds every digit

`status` SHALL report a board solved when every row, every column and every
block holds every number, each long diagonal does too on an X board, and on a
Killer board no cage repeats a number and every cage makes its total. The
check SHALL read the board's own space: the blocks its sizes cut or its deal
divided, and the diagonals only where X is on.

#### Scenario: The last placement solves the board

- **WHEN** a placement fills the grid with no rule broken
- **THEN** `status` reports the board solved

#### Scenario: A board without X has no diagonal rule

- **WHEN** two equal numbers stand on a long diagonal of a Standard board,
  in different rows, columns and blocks
- **THEN** no rule is broken

### Requirement: Params: Solo encodes and decodes its parameters

`encodeParams` SHALL write `"{c}x{r}"`, or `"{c}j"` for a Jigsaw, then `"x"`
for X and `"k"` for Killer. In *full* form it SHALL append the symmetry
(`a`, `r4`, `m2`, `md2`, `m4`, `md4` or `m8`, with the default 2-way
rotation unwritten) and the tier (`dt`, `db`, `di`, `da`, `de` or `du`). The
Easy tier's `dt` SHALL be written, where upstream leaves it out; upstream
reads both.

#### Scenario: Params round-trip across variants

- **WHEN** Standard, Jigsaw, X and Killer params are encoded with
  `full = true` and decoded
- **THEN** each decodes back to the original params, `3x3` to `3x3dt`
- **AND** the brief encoding omits the symmetry and the tier

### Requirement: Params: Solo refuses parameters outside its bounds

When a board is to be dealt, Solo SHALL refuse a grid of more than 31
numbers, blocks fewer than 2 wide that are not a Jigsaw, a Killer grid of more
than 9 numbers or fewer than 3, and an X grid of fewer than 4, each in the
sentence its bound's place gives. It SHALL refuse every tier above Easy on a
grid of 4 numbers or fewer, in the collection's sentence for a size that has
no board of the tier.

#### Scenario: Invalid params are rejected

- **WHEN** `4x3k` or `6x6` is to be dealt
- **THEN** it is refused: "Killer (digit sums): width and height must both
  be at most 9." or "Width and height must both be at most 31."

#### Scenario: A tiny grid has only its easy tiers

- **WHEN** a 2x2 board, a 4 Jigsaw or a 2x2 Killer is asked for at Normal
- **THEN** it is refused: "No 4x4 puzzle is Normal."
- **AND** the same params at Easy are dealt

### Requirement: Description: Solo refuses blocks and cages of the wrong number or size

A Jigsaw's blocks SHALL number the grid's size, each of that many cells. A
Killer's cages SHALL each hold 2 cells or more. Any other division SHALL be
refused as a game ID not laid out the way this puzzle's are.

#### Scenario: A cage of one cell

- **WHEN** the Killer board whose cages section opens `___a__a` is loaded
  with the first `a`, which joins the fourth and fifth cells of the top row,
  written `__`
- **THEN** it is refused as not laid out the way this puzzle's game IDs are

### Requirement: Description: Solo refuses a killer cage with no sum or with two

A Killer description whose sums section gives some cage no sum, or more than
one, SHALL be refused as not laid out the way this puzzle's game IDs are. A
sum SHALL be read anywhere in its cage, as upstream reads it, and written at
the cage's first cell in reading order.

#### Scenario: Two sums in one cage

- **WHEN** a `3x3ka` description's sums section opens `15_14_8_8_8_5`, the
  fifth cell being the second cell of the fourth's cage
- **THEN** it is refused

#### Scenario: A cage with no sum

- **WHEN** a `3x3ka` description's sums section opens `a14` where the first
  cell begins a cage
- **THEN** it is refused

### Requirement: Generation: Solo builds a full grid under every active constraint

A board's answer SHALL be searched under its blocks and, on a Killer board,
its cages, which the deal divides first: a Jigsaw's blocks into connected
parts as large as a row, and the cages into dominoes and then parts of up to
three cells. Every cage's total SHALL be its answer's sum.

#### Scenario: A board with the diagonals and cages both

- **WHEN** a board is dealt with X and Killer both on
- **THEN** its answer holds every number once on each long diagonal and
  repeats none in a cage, as well as in each row, column and block

### Requirement: Generation: Givens are removed in symmetry orbits

A board without Killer SHALL start from every square's number given and hide
each with the rest of its orbit under the symmetry asked for, keeping a hide
only while the board's tier still finishes it. A Killer board SHALL show no
given, and SHALL need its killer scale's top as well as the tier asked for.

#### Scenario: The givens keep the symmetry asked for

- **WHEN** a board is dealt with 4-way rotation
- **THEN** its pattern of givens is unchanged by a quarter turn

### Requirement: Solver: Each rung is graded on its own scale

Each technique SHALL carry its tier on its own scale, the tiers or the killer
scale, as the description's `scales` place it; a ladder SHALL hold only the
techniques both caps admit, and a technique that fires SHALL raise its own
scale's grade. Killer's techniques SHALL be in the ladder of a board with
Killer on alone.

#### Scenario: A rung over its cap is left out

- **WHEN** a Killer board is solved with the killer cap below the region
  rule's tier
- **THEN** the ladder holds no region rule and no reading of the partial
  cages it works out, and the killer grade reported does not exceed the cap

#### Scenario: A board without Killer has no cage reading

- **WHEN** a hint is asked on a Standard board
- **THEN** no step reads a cage, and the walk runs on the techniques its
  ladder holds

### Requirement: Hint: Solo's hint is the candidate walk's, started on the implicit reading

Solo's hint SHALL be the candidate walk of its description
(`engine-candidate-hints`): each technique a step can teach a rung, its words
its `says`, at the board's tiers on both scales, on the implicit reading of a
cell with no notes. A wording that names a unit SHALL name it by the board's
unit holding the cells: row, column, block or diagonal.

#### Scenario: Nothing is filled in under Solo's own reading

- **WHEN** the player asks for a hint on a board with no pencil notes,
  without having changed how hints pencil in
- **THEN** no step of the plan is the fill-all move

#### Scenario: A killer technique past the board's killer tier

- **WHEN** a hint is asked on a board whose killer cap is below the region
  rule
- **THEN** no step of the plan places or strikes by what a row, column or
  block leaves

#### Scenario: A cell every other number is ruled out of

- **WHEN** the next step places the only number a cell's row, column and
  block leave it on a Standard board
- **THEN** it says "Every other number is already in this cell's row, column
  or block, so it can only be" that number

### Requirement: Look: Solo draws its cages, digits, pencil marks and live errors

The board SHALL be drawn from its description: the blocks walled and tinted
with the region fills, alike for a Standard and a Jigsaw board; on a Killer
board each cage dashed in ink inside its blocks, with its total at its first
cell; given numbers on the lifted surface; pencil marks; and live errors. A
board without Killer SHALL draw no cage.

#### Scenario: Variant decorations are drawn

- **WHEN** a Standard, Jigsaw or Killer board is drawn
- **THEN** a Jigsaw board's walls follow its irregular blocks
- **AND** a Killer board draws each cage dashed and its total at its first
  cell

## REMOVED Requirements

### Requirement: Solver: Solo solves with its bespoke graded solver

**Reason**: Solo's hand-written solver is gone; its description's ladder runs
on the engine's (`described-fill-game`).

**Migration**: None.

### Requirement: Solver: The techniques Solo's solver implements

**Reason**: The techniques are the description's, each at its stated tier;
the forcing chain and bounded recursion are the engine's search tier.

**Migration**: None.

### Requirement: Solver: A census certifies that every rung fires

**Reason**: The cases' hint pins hold a position for every rung
(`solo.cases.yaml`), as for every born game.

**Migration**: None.

### Requirement: Solver: Solo's ladder is its description

**Reason**: True of every born game (`described-fill-game`).

**Migration**: None.

### Requirement: Solver: Solo's ladder runs a rung alone as the hint does

**Reason**: The engine's ladder and walk (`engine-candidate-hints`).

**Migration**: None.

### Requirement: Hint: Every killer sum Solo cites is worked out from the board in one step

**Reason**: The killer techniques are stated in the description, each
reading the board as it stands; no derived cage is kept.

**Migration**: None.

### Requirement: Hint: A killer sum has one of three origins

**Reason**: The origins are the description's techniques and their `says`.

**Migration**: None.

### Requirement: Hint: A killer sum is narrated by what it came from

**Reason**: Each wording is stated beside its technique.

**Migration**: None.

### Requirement: Hint: The eliminations Solo's hint teaches

**Reason**: The ladder is the description's.

**Migration**: None.

### Requirement: Hint: A Solo step's indication is its firing region, or what the player looks at

**Reason**: The words and marks are each technique's `says`, and the walk's
`steps`, in the description.

**Migration**: None.

### Requirement: Hint: Solo marks every board element its hint sentence points at

**Reason**: The engine's rule for every stated wording.

**Migration**: None.

### Requirement: Hint: The two rungs whose premise is not a region carry their cells

**Reason**: Each technique's marks are stated in its `says`.

**Migration**: None.
