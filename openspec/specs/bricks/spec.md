# bricks Specification

## Purpose
Bricks (Tawamurenga), the puzzle of shading cells of an offset brick grid so
that every shaded cell above the bottom row rests on a shaded cell below, no
three shaded cells run in a row, and each number counts the shaded cells around
it. This capability holds what is Bricks' own: its board and its IDs, its
controls, its mistake check, its explained hint and when it refuses, its two
tiers and the retired third, what its generator promises, and how it is drawn.

## Requirements

### Requirement: Rules: The Bricks board is a hexagon stored as a padded parallelogram

The board SHALL be a hexagon stored as a padded parallelogram: the actual grid
width SHALL be the parameter width plus the ceiling of half the height minus one,
with the two triangular corners masked as boundary cells, leaving exactly
width-by-height playable cells. Neighbors SHALL be the fixed six-direction hex
step set.

#### Scenario: A board six wide and seven high

- **WHEN** a board of width 6 and height 7 is built
- **THEN** its grid is nine cells wide
- **AND** forty-two of its cells are playable

### Requirement: Rules: A Bricks board is complete when its three rules hold

The game SHALL be reported complete when the grid satisfies all three rules: no
three shaded cells in a row, every shaded cell above the bottom row resting on a
shaded one, and every clue counting exactly its shaded neighbors. A cell left
empty SHALL count as not shaded and SHALL NOT hold completion back.

#### Scenario: Satisfying every rule wins

- **WHEN** a move leaves all three rules satisfied
- **THEN** the game is reported complete

#### Scenario: The last brick wins with cells still empty

- **WHEN** the last shaded cell of the solution is placed while other cells of the
  board are still empty
- **THEN** the game is reported complete

### Requirement: Rules: Bricks' findMistakes reports a broken rule and a cell the answer contradicts

`findMistakes` SHALL report every cell the rule pass flags and, on a board the
solver finishes from its clues, every cell shaded or ruled out against that
answer. A brick or a cross the answer contradicts SHALL be drawn in the error
color when the check hands `redraw` its mistakes, beside the rule marks.

#### Scenario: A rule violation is reported

- **WHEN** the grid contains a rule violation and the player invokes Check & Save
- **THEN** `findMistakes` reports the offending cells

#### Scenario: A wrong cross that breaks no rule

- **WHEN** a cell the answer shades is ruled out, no rule is broken by it, and
  Check & Save is pressed
- **THEN** one mistake is reported, and the cross is drawn in the error color
  on a board already drawn

#### Scenario: The right color in the same cell

- **WHEN** that cell is shaded as the answer has it
- **THEN** `findMistakes` reports nothing

### Requirement: Params: Bricks refuses a 2×2 at Unreasonable

Of full parameters `validateParams` SHALL refuse a 2×2 at `Unreasonable`,
which has no board of that tier.

#### Scenario: A 2×2 at the harder tier

- **WHEN** a 2×2 `Unreasonable` board is asked for
- **THEN** it is refused with "No 2x2 puzzle is Unreasonable.", and a 2×3 at
  the same tier is dealt

### Requirement: Params: The undeclared Bricks tier still loads and is never dealt

A full (generation-capable) parameter set carrying the undeclared tier,
upstream's third, SHALL be refused with a message that lists the tiers that do
exist: the tier refused has no name to give.

#### Scenario: The undeclared tier is not generated

- **WHEN** a full parameter set requesting the depth-2 tier is validated
- **THEN** it is rejected with "Difficulty must be one of Easy, Unreasonable."
- **AND** the same parameters validate successfully when a description is
  supplied rather than generated

#### Scenario: The generator refuses rather than exhausts its retries

- **WHEN** the generator is called at that tier anyway
- **THEN** it fails immediately, rather than rejecting candidates until its retry
  budget is spent

### Requirement: Params: A Bricks params string may leave out its difficulty

Bricks' params, their bounds and their encoding SHALL be those its
`paramConfig` and its declared codec give (`engine-params`, "A game declares
its params encoding once, and both codec halves are derived"), and its menu
what `presets` lists. A string with no `d` SHALL decode as Easy. The
difficulty letters SHALL stay upstream's, `n` for `Unreasonable` and `t` for
the undeclared tier, so that an existing game ID names the same board.

#### Scenario: The Unreasonable preset

- **WHEN** `6x7dn` is decoded
- **THEN** it is the 6×7 `Unreasonable` board
- **AND** its shared encoding is `6x7`, which decodes as Easy

### Requirement: Description: Bricks descriptions use the run-length cell encoding

A Bricks description SHALL encode only the playable cells in canonical
left-to-right, top-to-bottom order: each numbered cell as its decimal value with a
separator inserted between two adjacent numbers, and each run of playable
(non-numbered) cells as a run-length lowercase count. Boundary cells SHALL be
re-derived from the geometry and SHALL NOT appear in the description.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: Description: A Bricks description of the wrong size or range is rejected

Validation SHALL reject a description that decodes to more or fewer playable cells
than the board holds, distinguishing too many from too few, and SHALL reject a clue
value out of range.

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description that decodes to more or fewer playable cells than the board
  has is validated
- **THEN** it is rejected with a message distinguishing too many from too few

### Requirement: Description: A Bricks description parts two numbers with _ and counts blank cells from a

Between two numbers with no blank cell between them a description SHALL hold
`_`. A letter SHALL count from `a` for one blank cell to `z` for twenty-six,
and `newState` SHALL read a run however it is split into letters. A number
SHALL be from 0 to 7, and a 7 SHALL be a cell that cannot be shaded and
counts nothing, drawn as `?`.

#### Scenario: A dealt 6×7 board

- **WHEN** `a1b2ad2a0a4b3fa3b4ab5a5a1e` is opened as a 6×7 board
- **THEN** its forty-two cells are covered, and the top row of six reads a
  blank cell, 1, two blank cells, 2 and a blank cell
- **AND** with its first number written 8 it is refused as out of range

### Requirement: Generation: Bricks offers Easy and Unreasonable, and no third tier

Bricks SHALL offer two tiers, Easy and `Unreasonable`. The harder SHALL carry
that name because its rung commits a cell by solving the rest of the board from
a hypothesis, and only a tier of that name may ship such a rung. Upstream's
third tier, whose sub-solve recurses in turn, names no boards, so it SHALL NOT
be offered under any name: not in the preset menu, the difficulty contract or
the custom-params dialog.

#### Scenario: The preset menu offers two tiers

- **WHEN** the preset menu is listed
- **THEN** every entry is Easy or `Unreasonable`

### Requirement: Generation: The Bricks generator solves the fully numbered board before it removes a number

Before it removes any number the generator SHALL solve the fully numbered
board, and SHALL start again when that solve does not complete: the numbering
made after the Easy solve can take away the brick another brick rests on, and
removing numbers cannot repair a board that does not solve.

#### Scenario: A board two squares wide loads from its own ID

- **WHEN** a board is dealt at a width of two and a height of four or more, at
  either difficulty
- **THEN** the solver completes it at that difficulty
- **AND** loading the board's game ID is accepted

#### Scenario: A board at the smallest height loads from its own ID

- **WHEN** a board is dealt at a height of two
- **THEN** loading the board's game ID is accepted

### Requirement: Solver: The depth-2 rung stays in the Bricks solver

Bricks' tiers are lookahead depth: Easy assumes nothing, the harder tier assumes
a cell and looks for an Easy-level contradiction, and depth 2 lets that sub-solve
recurse in turn. The depth-2 rung SHALL remain available to the solver, where the
hint and Solve use it as "try as hard as you can".

#### Scenario: Solve asks for the deepest rung

- **WHEN** the player asks for the solution of a board
- **THEN** the solver is run at depth 2, whatever tier the board was dealt at

### Requirement: Solver: The Bricks solver places cells by contradiction

The solver SHALL place cells by contradiction, tentatively shading or unshading
a cell and forcing the opposite when that leads to an invalid grid, with bounded
lookahead for the harder difficulties. At every tier each cell it places
SHALL be proved that way, and the solver SHALL NOT guess: the lookahead that
makes the harder tier a search only refutes a trial, and commits none.

#### Scenario: A cell that would complete a row of three is cleared

- **WHEN** an empty cell lies between two shaded cells of its row, on a board
  that has a solution
- **THEN** the solver finds shading it invalid and sets it unshaded

### Requirement: Controls: Bricks cells cycle by a click or a drag

Bricks SHALL take its clicks and its keys from its `targetVerbs` declaration.
The drag is the game's own: it SHALL paint the cells it crosses in one move. A
numbered cell SHALL never be shadeable.

#### Scenario: Dragging paints a run of cells

- **WHEN** the player presses on a cell and drags across further playable cells
- **THEN** on release every dragged playable cell is set to the drag's color in a
  single move

### Requirement: Controls: The Bricks keyboard cursor follows the hexagonal grid

The keyboard cursor SHALL take each step from the engine's `shearedHexStep`,
whether an arrow asks for it or the number pad, which SHALL be a direction
pad, so of its digits only 0 paints.

#### Scenario: Two steps up take one of each kind

- **WHEN** the cursor is moved up twice from a cell away from the board's edges
- **THEN** one of the two steps keeps its column in the stored grid and the other
  changes it

### Requirement: Controls: Ctrl or Shift with a Bricks move paints the cells the cursor leaves and enters

Ctrl with a move SHALL shade the cell the cursor leaves and the one it enters,
Shift mark them clear, and both together empty them; a numbered cell among
them is left as it is.

#### Scenario: Ctrl with an arrow shades two cells

- **WHEN** the cursor is on an empty cell with an empty cell to its right, and
  the player presses Ctrl with Right
- **THEN** one move shades both cells

### Requirement: Controls: Ctrl or Shift with a Bricks move that paints nothing makes no move

Ctrl or Shift with a move SHALL name in its move only cells that take a color
and do not have the one asked for. Where that leaves none, the key SHALL make
no move: it SHALL be a cursor move where the cursor moved, and be declined
where it did not.

#### Scenario: Ctrl with an arrow off the board from a numbered cell

- **WHEN** the cursor is on a numbered cell at the board's edge and Ctrl is
  pressed with the arrow that points off the board
- **THEN** the game declines the key, and the board and the cursor are as
  they were

### Requirement: Hint: A Bricks hint step explains why the move is forced

For a single-cell contradiction a hint step SHALL name the concrete rule the
opposite color would violate: three shaded bricks in a horizontal row, a shaded
brick with no shaded brick beneath it to rest on, or a clue that the change
would push above or below its shaded-neighbor count. It SHALL state the
premise, the contradiction and the conclusion in the necessity voice.

#### Scenario: A forced move is explained by the rule it would break

- **WHEN** a hint is requested on a solvable, mistake-free board where a
  single-cell contradiction is available
- **THEN** the explanation names the rule (three-in-a-row, a brick left
  unsupported, or a clue's neighbor count) that the opposite color would
  violate

### Requirement: Hint: A Bricks hint step is one journey of one cell

Because every Bricks deduction forces exactly one cell, each hint step SHALL
be a single self-contained journey. A paint that gives the step's cell the
color it forces, alone or in a drag across other cells, SHALL complete the
step, and every other move SHALL be off the plan.

#### Scenario: A step decides one cell and leaves it as it was

- **WHEN** a hint step is shown
- **THEN** it rings one cell, which is still empty on the board
- **AND** the cells it reasons from carry a different mark

### Requirement: Hint: The recursive lookahead rung is never narrated

The recursive lookahead rung SHALL NOT be narrated at all: it commits a cell by
solving the rest of the board from a hypothesis, which is a search, and no hint
narrates a search on any tier. The recorder SHALL omit it while the solver
retains it, so that grading and generation are unchanged and no description
moves.

#### Scenario: The lookahead rung never reaches a narration

- **WHEN** hint plans are recorded across every tier and many seeds
- **THEN** no step is forced by the recursive lookahead rung, and where only that
  rung could progress the hint refuses instead

### Requirement: Hint: A Bricks contradiction no named rule matches is an error, never a narration

The single-cell rung places one color and calls the validator once. Every hint
step SHALL give one of the named rules as its reason; a rejected trial that
matches none of them SHALL throw, and SHALL NOT be narrated. No hint sentence
SHALL claim that a chain of forced consequences was followed.

#### Scenario: Every refutation on a board has a named rule

- **WHEN** the single-cell rung is run over a board filled in any order that
  agrees with its solution
- **THEN** every forced cell is given one of the named rules, and nothing throws

### Requirement: Hint: Bricks calls its piece shaded and never by its color

Bricks' hint sentences and control words SHALL say "shaded" for the shaded
state and SHALL NOT say the piece's color, and its help page SHALL say the
piece's shape beside the placeholder for its color.

#### Scenario: A hint rests on a shaded cell

- **WHEN** a hint step reasons from a cell that is shaded
- **THEN** its sentence calls it a shaded brick and names no color

### Requirement: Hint: A Bricks hint takes the first empty cell one color breaks a rule in

The hint SHALL take the empty cells in reading order and give the first that
one color breaks a rule in. In each it SHALL try clear first: where that
strands a shaded brick above, or leaves a number unable to reach its count,
the cell must be shaded. It SHALL then try shaded: where that makes three in
a row, leaves the cell nothing to rest on, or gives a number too many, the
cell must stay clear. Where several rules break, the first in that order
SHALL be the reason given.

#### Scenario: Two rules break at once

- **WHEN** shading the first such cell would both make three in a row and
  give a number beside it too many shaded neighbors
- **THEN** the step's sentence gives the three in a row

### Requirement: Look: Bricks marks a rule violation on the board

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

### Requirement: Look: Bricks draws its marks beside the piece

The keyboard cursor and both of a hint's rings SHALL be drawn in the margin a
piece leaves round itself, so none lands on a piece. A gravity mark, which
straddles the edge between two cells, SHALL carry a rim that parts it from the
pieces it overlaps.

#### Scenario: A ring on a shaded cell leaves the piece whole

- **WHEN** the cursor or a hint ring is drawn on a cell holding a piece
- **THEN** the ring does not cover the piece

### Requirement: Look: Bricks draws a shaded cell as a piece and a ruled-out one as the clear square

The board SHALL be drawn as pieces on the collection's quiet surface. A shaded
cell SHALL hold the collection's shaded piece inset on its cell, the square one,
since a cell is a square whatever its row's offset. A ruled-out cell SHALL be
the collection's clear square with its faint cross, and a clue SHALL sit on
the lifted surface of a given. No cell SHALL carry a bevel.

#### Scenario: The three states are a piece, a clear square and nothing

- **WHEN** a board holding a shaded cell, a ruled-out cell and an undecided
  cell is drawn
- **THEN** the shaded one holds a piece in the shaded color, smaller than the
  cell, on the plain surface, the ruled-out one is filled with the clear
  square's color and holds a cross in the square's faint color, and the
  undecided one is plain surface and holds nothing

#### Scenario: A clue is told from a cell the player decides

- **WHEN** a board is drawn
- **THEN** each numbered cell is the lifted surface, and no other cell is
