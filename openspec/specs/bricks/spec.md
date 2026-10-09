# bricks Specification

## Purpose
Bricks (Tawamurenga), the puzzle of shading cells of an offset brick grid so
that every shaded cell above the bottom row rests on a shaded cell below, no
three shaded cells run in a row, and each number counts the shaded cells around
it. This capability holds what is Bricks' own: its board and its IDs, its
controls, its mistake check, its explained hint and when it refuses, its two
tiers and the retired third, what its generator promises, and how it is drawn.

## Requirements

### Requirement: Bricks parameters are a width, a height and a difficulty

Parameters SHALL be a width, a height and a difficulty, Easy or `Unreasonable`.
A width below 2, a height below 2, or a difficulty that is not a known one SHALL
be refused; the engine refuses them from the bounds and the choices the game
declares. A game ID SHALL encode the width, height and difficulty and round-trip
through decode. The difficulty letters SHALL stay `e`, `n` and `t`, so that an
existing game ID names the same board.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered

#### Scenario: A board one cell wide is refused

- **WHEN** parameters with a width of 1 are checked
- **THEN** they are refused

### Requirement: Bricks offers Easy and Unreasonable, and no third tier

Bricks SHALL offer two tiers, Easy and `Unreasonable`. The harder SHALL carry
that name because its rung commits a cell by solving the rest of the board from
a hypothesis, and only a tier of that name may ship such a rung. Upstream's
third tier, whose sub-solve recurses in turn, names no boards, so it SHALL NOT
be offered under any name: not in the preset menu, the difficulty contract or
the custom-params dialog.

#### Scenario: The preset menu offers two tiers

- **WHEN** the preset menu is listed
- **THEN** every entry is Easy or `Unreasonable`

### Requirement: The Bricks board is a hexagon stored as a padded parallelogram

The board SHALL be a hexagon stored as a padded parallelogram: the actual grid
width SHALL be the parameter width plus the ceiling of half the height minus one,
with the two triangular corners masked as boundary cells, leaving exactly
width-by-height playable cells. Neighbors SHALL be the fixed six-direction hex
step set. This geometry SHALL be bespoke and SHALL NOT depend on the shared grid
tiling engine.

#### Scenario: A board six wide and seven high

- **WHEN** a board of width 6 and height 7 is built
- **THEN** its grid is nine cells wide
- **AND** forty-two of its cells are playable

### Requirement: Bricks descriptions use the run-length cell encoding

A Bricks description SHALL encode only the playable cells in canonical
left-to-right, top-to-bottom order: each numbered cell as its decimal value with a
separator inserted between two adjacent numbers, and each run of playable
(non-numbered) cells as a run-length lowercase count. Boundary cells SHALL be
re-derived from the geometry and SHALL NOT appear in the description.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Bricks description of the wrong size or range is rejected

Validation SHALL reject a description that decodes to more or fewer playable cells
than the board holds, distinguishing too many from too few, and SHALL reject a clue
value out of range.

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description that decodes to more or fewer playable cells than the board
  has is validated
- **THEN** it is rejected with a message distinguishing too many from too few

### Requirement: Bricks cells cycle by a click or a drag

Bricks SHALL be played by clicking or dragging to cycle a cell between shaded,
unshaded and empty, with the right button cycling in the reverse direction. A
numbered cell SHALL never be shadeable.

#### Scenario: Dragging paints a run of cells

- **WHEN** the player presses on a cell and drags across further playable cells
- **THEN** on release every dragged playable cell is set to the drag's color in a
  single move

### Requirement: The Bricks keyboard cursor follows the hexagonal grid

Bricks SHALL be played, as well as by the pointer, by a hexagon-aware keyboard
cursor. Moving the cursor up or down SHALL alternate between an orthogonal and a
diagonal step to follow the hexagonal grid.

#### Scenario: Two steps up take one of each kind

- **WHEN** the cursor is moved up twice from a cell away from the board's edges
- **THEN** one of the two steps keeps its column in the stored grid and the other
  changes it

### Requirement: Bricks reports rule violations through findMistakes

Because Bricks is uniquely solvable and every rule violation is localized, it SHALL
provide a `findMistakes` hook that reports the offending cells, so that Check & Save
hard-blocks while a mistake is present.

#### Scenario: A mistake blocks Check & Save

- **WHEN** the grid contains a rule violation and the player invokes Check & Save
- **THEN** `findMistakes` reports the offending cells and the save is blocked

### Requirement: Bricks marks a rule violation on the board

A rule violation SHALL be marked on the board: a bar over three shaded cells in
a row, an error diamond where a shaded cell rests on nothing, and a miscounted
clue's number in the error color. The marks SHALL show live while a drag is in
flight, for the board the drag previews, and when the check hands `redraw` its
mistakes. A committed board SHALL otherwise carry none.

#### Scenario: A drag shows the row it is about to make

- **WHEN** a drag in flight previews three shaded cells in a row
- **THEN** the bar is drawn over them before the drag is released

#### Scenario: A committed violation waits for the check

- **WHEN** a move leaves three shaded cells in a row and no drag is in flight
- **THEN** no mark is drawn until the check reports the mistake

### Requirement: A Bricks board is complete when its three rules hold

The game SHALL be reported complete when the grid satisfies all three rules: no
three shaded cells in a row, every shaded cell above the bottom row resting on a
shaded one, and every clue counting exactly its shaded neighbors. A cell left
empty SHALL count as not shaded and SHALL NOT hold completion back. The game
SHALL flash on completion. There SHALL be no interpolated animation.

#### Scenario: Satisfying every rule wins

- **WHEN** a move leaves all three rules satisfied
- **THEN** the game is reported complete and flashes

#### Scenario: The last brick wins with cells still empty

- **WHEN** the last shaded cell of the solution is placed while other cells of the
  board are still empty
- **THEN** the game is reported complete

### Requirement: Bricks provides an explained deduction hint

Bricks SHALL implement the `hint` and `hintKeepTrack` hooks so a player can ask
why the next move is forced. A hint SHALL be computed from the game's own
contradiction solver, the solver and the hint being two projections of one
deduction engine, so that every hinted move corresponds to a deduction the
solver can make from the player's current position.

#### Scenario: Following the hints solves the board

- **WHEN** hint steps are applied in order on a board the single-cell rung
  solves, a new hint being asked for whenever a plan runs out
- **THEN** the board is driven to completion

### Requirement: A Bricks hint plan is recompute-stable

The hint plan SHALL be recompute-stable: it SHALL scan in a deterministic order,
so a hint recomputed after a followed move continues where the previous plan left
off.

#### Scenario: A hint after a followed step continues the plan

- **WHEN** the first step of a plan is followed and a hint is asked for again
- **THEN** the new plan begins with the old plan's second step

### Requirement: A Bricks hint step explains why the move is forced

Each hint step SHALL explain why the move is forced, not merely which cell to act
on. For a single-cell contradiction it SHALL name the concrete rule the opposite
color would violate: three shaded bricks in a horizontal row, a shaded brick with
no shaded brick beneath it to rest on, or a clue that the change would push above
or below its shaded-neighbor count. It SHALL state the premise, the
contradiction and the conclusion in the necessity voice.

#### Scenario: A forced move is explained by the rule it would break

- **WHEN** a hint is requested on a solvable, mistake-free board where a
  single-cell contradiction is available
- **THEN** the forced cell is highlighted as the target, its evidence cells are
  marked, and the explanation names the rule (three-in-a-row, a brick left
  unsupported, or a clue's neighbor count) that the opposite color would
  violate, without pre-placing the forced color

### Requirement: A Bricks hint marks the forced cell and its evidence, and places nothing

The forced cell SHALL be highlighted as the hint target, and the deduction's
evidence cells SHALL be marked distinctly on the board, so the reasoning is
visible and not only in prose. The hint SHALL NOT pre-place the forced color.
Because every Bricks deduction forces exactly one cell, each hint step SHALL be a
single self-contained journey.

#### Scenario: A step decides one cell and leaves it as it was

- **WHEN** a hint step is shown
- **THEN** it rings one cell, which is still empty on the board
- **AND** the cells it reasons from carry a different mark

### Requirement: The recursive lookahead rung is never narrated

The recursive lookahead rung SHALL NOT be narrated at all: it commits a cell by
solving the rest of the board from a hypothesis, which is a search, and no hint
narrates a search on any tier. The recorder SHALL omit it while the solver
retains it, so that grading and generation are unchanged and no description
moves. Where the single-cell rung runs out, the hint SHALL refuse rather than
reach for it.

#### Scenario: The lookahead rung never reaches a narration

- **WHEN** hint plans are recorded across every tier and many seeds
- **THEN** no step is forced by the recursive lookahead rung, and where only that
  rung could progress the hint refuses instead

### Requirement: A Bricks contradiction no named rule matches is an error, never a narration

The single-cell rung places one color and calls the validator once. Every hint
step SHALL give one of the named rules as its reason; a rejected trial that
matches none of them SHALL throw, and SHALL NOT be narrated. No hint sentence
SHALL claim that a chain of forced consequences was followed.

#### Scenario: Every refutation on a board has a named rule

- **WHEN** the single-cell rung is run over a board filled in any order that
  agrees with its solution
- **THEN** every forced cell is given one of the named rules, and nothing throws

### Requirement: A Bricks hint is refused on a solved, mistaken or contradicted board

A hint SHALL be refused, with an explanatory banner, when the board is already
solved, when the board contains a rule violation (as reported by
`findMistakes`), or when the player's placed cells contradict the unique solution
without yet breaking a local rule. In the last case the banner SHALL say a
placed cell must be wrong, and the hint SHALL NOT deduce onward from a doomed
position.

#### Scenario: A hint is refused on a solved, mistaken, or wrong-but-legal board

- **WHEN** a hint is requested on a board that is solved, that contains a
  rule-violating cell, or whose placed cells contradict the unique solution
  without yet breaking a local rule
- **THEN** no move is hinted and an explanatory banner is shown, and for the
  last case the banner states that a placed cell must be wrong

### Requirement: The undeclared Bricks tier still loads and is never dealt

The undeclared tier SHALL remain decodable: its difficulty letter is kept, so a
game ID or saved game carrying it still parses and still round-trips. A full
(generation-capable) parameter set carrying it SHALL be refused with a message
naming the difficulty and the tiers that do exist, by the engine from the
difficulty item's retired choice; any other parameter set carrying it SHALL be
accepted, so such a game still loads.

#### Scenario: The undeclared tier is not generated

- **WHEN** a full parameter set requesting the depth-2 tier is validated
- **THEN** it is rejected with a message naming the difficulty and the tiers that
  do exist
- **AND** the same parameters validate successfully when a description is
  supplied rather than generated

#### Scenario: The undeclared tier still round-trips through a game ID

- **WHEN** a game ID carrying the depth-2 difficulty character is decoded and
  re-encoded
- **THEN** the same difficulty is recovered and the same game ID is produced

#### Scenario: The generator refuses rather than exhausts its retries

- **WHEN** the generator is called at that tier anyway
- **THEN** it fails immediately, rather than rejecting candidates until its retry
  budget is spent

### Requirement: The depth-2 rung stays in the Bricks solver

Bricks' tiers are lookahead depth: Easy assumes nothing, the harder tier assumes
a cell and looks for an Easy-level contradiction, and depth 2 lets that sub-solve
recurse in turn. The depth-2 rung SHALL remain available to the solver, where the
hint and Solve use it as "try as hard as you can".

#### Scenario: Solve asks for the deepest rung

- **WHEN** the player asks for the solution of a board
- **THEN** the solver is run at depth 2, whatever tier the board was dealt at

### Requirement: Bricks grades the tiers it does offer

A Bricks board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it. The acceptance gate SHALL probe the tier immediately below the
one requested.

#### Scenario: An Unreasonable board genuinely needs its own tier

- **WHEN** a board generated at `Unreasonable` is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at `Unreasonable` does

### Requirement: The Bricks solver places cells by contradiction

The solver SHALL place cells by contradiction, tentatively shading or unshading
a cell and forcing the opposite when that leads to an invalid grid, with bounded
lookahead for the harder difficulties. Every difficulty tier SHALL be solvable
by pure deduction; the solver SHALL NOT rely on guessing.

#### Scenario: A cell that would complete a row of three is cleared

- **WHEN** an empty cell lies between two shaded cells of its row, on a board
  that has a solution
- **THEN** the solver finds shading it invalid and sets it unshaded

### Requirement: The Bricks generator deals only a board with one solution its solver completes

The generator SHALL write out only a board with exactly one solution, which its
solver completes at the difficulty asked for. Before it removes any number it
SHALL solve the fully numbered board, and SHALL start again when that solve does
not complete: the numbering made after the Easy solve can take away the brick
another brick rests on, and removing numbers cannot repair a board that does not
solve. Generation from a given seed SHALL be reproducible.

#### Scenario: A board two squares wide loads from its own ID

- **WHEN** a board is dealt at a width of two and a height of four or more, at
  either difficulty
- **THEN** the solver completes it at that difficulty
- **AND** loading the board's game ID is accepted

#### Scenario: A board at the smallest height loads from its own ID

- **WHEN** a board is dealt at a height of two
- **THEN** loading the board's game ID is accepted

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

### Requirement: A Bricks board is never turned

Bricks SHALL declare `transposeParams` not applicable: a shaded brick rests on
the row below it and no three may lie in a horizontal line, so a tall board is a
different puzzle from a wide one rather than the same one turned.

#### Scenario: A Bricks board is dealt as chosen

- **WHEN** a Bricks board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen

### Requirement: Bricks draws its board as pieces on a quiet surface

The board SHALL be drawn as pieces on the collection's quiet surface. A shaded
cell SHALL hold the collection's shaded piece inset on its cell, the square one,
since a cell is a square whatever its row's offset. A ruled-out cell SHALL be
the undecided cell's plain surface with the collection's ruled-out cross on it,
and a clue SHALL sit on the lifted surface of a given. No state SHALL be a fill
of the whole cell or a step of gray, and no cell SHALL carry a bevel.

#### Scenario: The three states are told apart without a fill

- **WHEN** a board holding a shaded cell, a ruled-out cell and an undecided
  cell is drawn
- **THEN** all three cells have the same surface color
- **AND** the shaded one holds a piece in the shaded color, smaller than the
  cell, the ruled-out one a cross, and the undecided one nothing

#### Scenario: A clue is told from a cell the player decides

- **WHEN** a board is drawn
- **THEN** each numbered cell is the lifted surface and each other cell is the
  plain one

### Requirement: Bricks draws its marks beside the piece

The keyboard cursor and both of a hint's rings SHALL be drawn in the margin a
piece leaves round itself, so none lands on a piece. A gravity mark, which
straddles the edge between two cells, SHALL carry a rim that parts it from the
pieces it overlaps.

#### Scenario: A ring on a shaded cell leaves the piece whole

- **WHEN** the cursor or a hint ring is drawn on a cell holding a piece
- **THEN** the ring does not cover the piece

### Requirement: Bricks names no hue

The game SHALL name no hue: its hint sentences and its control words SHALL say
"shaded" for the one state and the collection's word for the other, and its
help page SHALL name the piece's color by placeholder and say its shape.

#### Scenario: A control names the ruled-out state by the collection's word

- **WHEN** the controls list describes the key that rules a cell out
- **THEN** it says the collection's word for a cell that is not shaded
