# bricks Specification

## Purpose
Bricks (Tawamurenga), the puzzle of shading cells of an offset brick grid so
that every shaded cell above the bottom row rests on a shaded cell below, no
three shaded cells run in a row, and each number counts the shaded cells around
it. This capability specifies its port to the TS engine, with mistake-checking,
an explained deduction hint, and only the difficulty tiers its solver can
actually grade.

## Requirements

### Requirement: Bricks game implements the Game interface

The engine SHALL provide `src/games/bricks/` implementing the `Game` interface for
Bricks, registered so the puzzle is served by the TypeScript engine.

Parameters SHALL be a width, a height and a difficulty (Easy or `Unreasonable`).
The harder tier is named `Unreasonable` rather than upstream's `Normal` because
its rung commits a cell by solving the rest of the board from a hypothesis, and
only a tier of that name may ship such a rung. Validation SHALL require width at
least 2, height at least 2, and a known difficulty. A game ID SHALL encode the
width, height and difficulty and round-trip through decode; the encoded
difficulty characters are unchanged by the rename, so an existing game ID names
the same board.

The tier names SHALL have a single definition in the game, read by the preset
menu, the difficulty contract and the custom-params dialog alike, so that no two
of them can disagree.

The board SHALL be a hexagon stored as a padded parallelogram: the actual grid
width SHALL be the parameter width plus the ceiling of half the height minus one,
with the two triangular corners masked as boundary cells, leaving exactly
width-by-height playable cells. Neighbors SHALL be the fixed six-direction hex
step set. This geometry SHALL be bespoke and SHALL NOT depend on the shared grid
tiling engine.

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset or legal size
- **THEN** a board is produced whose unique solution the solver reaches, marking it
  complete

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered

#### Scenario: The menu, the contract and the custom dialog offer the same tiers

- **WHEN** the tier names the preset menu shows, the tiers the difficulty
  contract declares, and the choices the custom-params difficulty field offers
  are compared
- **THEN** they are the same list

### Requirement: Bricks descriptions use the run-length cell encoding

A Bricks description SHALL encode only the playable cells in canonical
left-to-right, top-to-bottom order: each numbered cell as its decimal value with a
separator inserted between two adjacent numbers, and each run of playable
(non-numbered) cells as a run-length lowercase count. Boundary cells SHALL be
re-derived from the geometry and SHALL NOT appear in the description.

Validation SHALL reject a description that decodes to more or fewer playable cells
than the board holds, distinguishing too many from too few, and SHALL reject a clue
value out of range.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description that decodes to more or fewer playable cells than the board
  has is validated
- **THEN** it is rejected with a message distinguishing too many from too few

### Requirement: Bricks input, mistake-checking and completion

Bricks SHALL be played by clicking or dragging to cycle a cell between shaded,
unshaded and empty, with the right button cycling in the reverse direction, and by a
hexagon-aware keyboard cursor. A numbered cell SHALL never be shadeable. Moving the
cursor up or down SHALL alternate between an orthogonal and a diagonal step to
follow the hexagonal grid.

Because Bricks is uniquely solvable and every rule violation is localized, it SHALL
provide a `findMistakes` hook that reports the offending cells, so that Check & Save
hard-blocks while a mistake is present. Rule violations SHALL additionally be shown
live during play — three-in-a-row bars, gravity error diamonds, and over-count
numbers.

The game SHALL be reported complete when the grid satisfies all three rules with no
cell left empty, and SHALL flash on completion. There SHALL be no interpolated
animation.

#### Scenario: Dragging paints a run of cells

- **WHEN** the player presses on a cell and drags across further playable cells
- **THEN** on release every dragged playable cell is set to the drag's color in a
  single move

#### Scenario: A mistake blocks Check & Save

- **WHEN** the grid contains a rule violation and the player invokes Check & Save
- **THEN** `findMistakes` reports the offending cells and the save is blocked

#### Scenario: Satisfying every rule wins

- **WHEN** the last empty cell is set so that all three rules hold
- **THEN** the game is reported complete and flashes

### Requirement: Bricks provides an explained deduction hint

Bricks SHALL implement the `hint` and `hintKeepTrack` hooks so a player can ask
why the next move is forced. A hint SHALL be computed from the game's own
contradiction solver — the solver and the hint SHALL be two projections of one
deduction engine — so that every hinted move corresponds to a deduction the
solver can make from the player's current position, and the plan SHALL be
recompute-stable: a deterministic scan order, so a hint recomputed after a
followed move continues where the previous plan left off.

Each hint step SHALL explain *why* the move is forced, not merely which cell to
act on: for a single-cell contradiction it SHALL name the concrete rule the
opposite color would violate — three shaded bricks in a horizontal row, a shaded
brick with no shaded brick beneath it to rest on, or a clue that the change would
push above or below its shaded-neighbor count — stating the premise, the
contradiction, and the conclusion in the necessity voice. The forced cell SHALL
be highlighted as the hint target and the deduction's evidence cells SHALL be
marked distinctly on the board so the reasoning is visible and not only in prose.
The hint SHALL NOT pre-place the forced color. Because every Bricks deduction
forces exactly one cell, each hint step SHALL be a single self-contained journey.

**The recursive lookahead rung SHALL NOT be narrated at all.** It commits a cell
by solving the rest of the board from a hypothesis, which is a search, and no hint
narrates a search on any tier. The recorder SHALL omit it while the solver retains
it, so grading and generation are unchanged and no description moves; where the
single-cell rung runs out, the hint SHALL refuse rather than reach for it.

The single-cell rung's own **unclassified** case — one color placed, one
validator call, the board breaks at a cell none of the named rules matched — SHALL
be narrated as what it is: the break is at a marked cell and nothing was followed
to reach it. It SHALL NOT inherit the recursive rung's wording, which described
following a chain of forced consequences and was never true of this case.

A hint SHALL be refused, with an explanatory banner, when the board is already
solved, when the board contains a rule violation (as reported by
`findMistakes`), or when the player's placed cells contradict the unique solution
without yet breaking a local rule — in the last case the banner SHALL say a
placed cell must be wrong rather than deduce onward from a doomed position.

#### Scenario: A forced move is explained by the rule it would break

- **WHEN** a hint is requested on a solvable, mistake-free board where a
  single-cell contradiction is available
- **THEN** the forced cell is highlighted as the target, its evidence cells are
  marked, and the explanation names the rule (three-in-a-row, a brick left
  unsupported, or a clue's neighbor count) that the opposite color would
  violate, without pre-placing the forced color

#### Scenario: The lookahead rung never reaches a narration

- **WHEN** hint plans are recorded across every tier and many seeds
- **THEN** no step is forced by the recursive lookahead rung, and where only that
  rung could progress the hint refuses instead

#### Scenario: The unclassified break is narrated as a break, not as a chain

- **WHEN** the single-cell rung forces a move by a contradiction none of the
  named rules matched
- **THEN** the narration says the board breaks at the marked cell, and does not
  claim any chain of consequences was followed

#### Scenario: A hint is refused on a solved, mistaken, or wrong-but-legal board

- **WHEN** a hint is requested on a board that is solved, that contains a
  rule-violating cell, or whose placed cells contradict the unique solution
  without yet breaking a local rule
- **THEN** no move is hinted and an explanatory banner is shown, and for the
  last case the banner states that a placed cell must be wrong

### Requirement: Bricks offers only difficulties that exist

Bricks SHALL offer Easy and `Unreasonable`, and SHALL NOT offer upstream's third
tier **as a name at all**: it names no boards, so it appears in neither the preset
menu, the difficulty contract, nor the custom-params dialog.

It SHALL nevertheless remain **decodable**. The difficulty character set is
unchanged, so a game ID or saved game carrying that tier still parses and still
round-trips; `validateParams` SHALL reject it when asked for a full
(generation-capable) parameter set, naming the difficulty and the tiers that do
exist, while continuing to accept it otherwise so such a game still loads.

Bricks' tiers are lookahead depth — Easy assumes nothing, the harder tier assumes
a cell and looks for an Easy-level contradiction, and upstream's third lets that
sub-solve recurse in turn — and depth 2 decides nothing depth 1 has not already
decided. Upstream conceded the symptom in its own documentation ("selecting Tricky
difficulty may generate a puzzle at Normal difficulty instead") and this port
preserved it as an intended quirk; measurement retired the quirk, because *may* is
always. The depth-2 rung SHALL remain available to the **solver**, where hints,
Solve and mistake-checking use it as "try as hard as you can" at no cost.

Because the tier is no longer declared, the cross-game difficulty contract no
longer covers it; the game's own suite SHALL assert that its difficulty character
still round-trips through a game ID, so that dropping the name cannot silently
change what an existing ID means.

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

### Requirement: Bricks grades the tiers it does offer

A Bricks board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it. The acceptance gate SHALL probe the tier immediately below the
one requested; upstream probes at Easy whatever tier was requested, which is
correct for the second tier only by coincidence.

The rename changes no description: it is a menu label, and the
solver's rungs are untouched.

#### Scenario: An Unreasonable board genuinely needs its own tier

- **WHEN** a board generated at `Unreasonable` is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at `Unreasonable` does

### Requirement: Bricks solves and generates by deduction

Bricks SHALL provide a solver that decides whether a grid is complete, still
unfinished, or invalid, from three rules: no three consecutive shaded cells in a
horizontal line, every shaded cell supported by a shaded cell below it, and every
numbered cell's shaded-neighbor count consistent with its clue. The solver SHALL
place cells by contradiction — tentatively shading or unshading a cell and forcing
the opposite when that leads to an invalid grid — with bounded lookahead for the
harder difficulties. Every difficulty tier SHALL be solvable by pure deduction; the
solver SHALL NOT rely on guessing.

The generator SHALL use the solver to keep every puzzle uniquely solvable at its
target difficulty: it SHALL fill the grid under the support and run-length
constraints, number it, then remove numbers in a randomized order, keeping a
removal only while the puzzle stays uniquely solvable. Generation from a given seed
SHALL be reproducible.

#### Scenario: The solver reaches the unique solution

- **WHEN** a generated board is solved
- **THEN** the solver marks it complete and its cells match the intended solution

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

### Requirement: Bricks presets draw tall, and a Bricks board is never turned

Bricks SHALL offer its presets at 6×7 and 8×10, upstream's 7×6 and 10×8 turned to draw taller than wide. Bricks SHALL NOT declare `transposeParams`: a shaded brick rests on the row below it and no three may lie in a horizontal line, so a tall board is a different puzzle from a wide one rather than the same one turned.

#### Scenario: A Bricks board is dealt as chosen

- **WHEN** a Bricks board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen

### Requirement: A dealt Bricks board has a solution

The Bricks generator SHALL write out only a board its solver completes at the
difficulty asked for. Before it removes any number it SHALL solve the fully
numbered board, and SHALL start again when that solve does not complete.

The generator numbers the board twice: once from the bricks it laid, and again
after an Easy solve, when every square that solve left undecided becomes a
number. The second numbering changes the answer, and it can take away the brick
another brick rests on. Removing numbers keeps a removal only while the board
still solves, so it preserves a board that solves and cannot repair one that
does not.

#### Scenario: A board two squares wide loads from its own ID

- **WHEN** a board is dealt at a width of two and a height of four or more, at
  either difficulty
- **THEN** the solver completes it at that difficulty
- **AND** loading the board's game ID is accepted

#### Scenario: A board at the smallest height loads from its own ID

- **WHEN** a board is dealt at a height of two
- **THEN** loading the board's game ID is accepted

### Requirement: Bricks draws its shaded cells as pieces on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. A shaded cell SHALL
hold the collection's shaded piece, in its color and shape, inset on its cell;
a cell is a square whatever its row's offset, so the piece is the square one. A
cell the player has ruled out SHALL be the same surface as an undecided cell
with the collection's ruled-out dot on it, and an undecided cell SHALL be the
plain surface: no state SHALL be a fill of the whole cell or a step of gray. A
clue SHALL sit on the lifted surface of a given. The line between cells SHALL
be the surface's grid line, and no cell SHALL carry a bevel.

The keyboard cursor and both of a hint's rings SHALL be drawn in the margin a
piece leaves round itself, so none lands on a piece. A gravity mark, which
straddles the edge between two cells, SHALL carry a rim that parts it from the
pieces it overlaps.

The game SHALL name no hue: its hint sentences and its control words SHALL say
"shaded" for the one state and the collection's word for the other, and its
help page SHALL name the piece's color by placeholder and say its shape.

#### Scenario: The three states are told apart without a fill

- **WHEN** a board holding a shaded cell, a ruled-out cell and an undecided
  cell is drawn
- **THEN** all three cells have the same surface color
- **AND** the shaded one holds a piece in the shaded color, the ruled-out one a
  dot, and the undecided one nothing

#### Scenario: A clue is told from a cell the player decides

- **WHEN** a board is drawn
- **THEN** each numbered cell is the lifted surface and each other cell is the
  plain one

#### Scenario: A control names the ruled-out state by the collection's word

- **WHEN** the controls list describes the key that rules a cell out
- **THEN** it says the collection's word for a cell that is not shaded
