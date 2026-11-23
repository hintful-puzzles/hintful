# clusters Specification

## Purpose
Clusters, the puzzle of two-coloring a grid so that exactly the dotted tiles
have a single same-colored neighbor and every other tile has at least two. This
capability states what is the game's own: its rules and what Check & Save
reports, what its params refuse and what its description marks, what its two
difficulty tiers mean, its drag and its keyboard painting, its explained hint,
and how its two colors are drawn.

## Requirements

### Requirement: Rules: The cluster rules decide when a board is solved

Every cell of a finished board SHALL hold one of two pieces, a block or a
disc. A tile given as a dot SHALL touch exactly one orthogonally adjacent
tile of its own piece, and every other tile SHALL touch at least two. The
board SHALL be solved when every cell is filled and no rule is broken. A
piece at which a rule breaks as the board stands SHALL be marked in the error
color as the player plays, as the fill engine marks a broken piece
(`described-fill-game`).

#### Scenario: A rule-breaking cell is reported as a mistake

- **WHEN** the board contains a cell that violates a cluster rule and mistakes
  are checked
- **THEN** a mistake is reported, and Check & Save declines to save

#### Scenario: Completing the grid wins

- **WHEN** a move fills the last cell so every cell satisfies the cluster rules
- **THEN** the game is reported solved

### Requirement: Rules: Clusters' findMistakes reports each tile the answer contradicts

`findMistakes` SHALL report every tile the player placed in the piece the
answer does not give it, whether or not it breaks a rule, and nothing else.
A reported tile SHALL be outlined when the check hands `redraw` its mistakes.

#### Scenario: A wrong tile that breaks no rule

- **WHEN** one tile is placed in the piece the answer does not give it, no
  rule is broken, and Check & Save is pressed
- **THEN** one mistake is reported, that tile is outlined, and the board is
  not saved

### Requirement: Params: Clusters refuses a board size that has no puzzle

Validation SHALL reject a board whose area is less than 2 as too small. It
SHALL additionally reject a board no larger than 2×2 in both dimensions, which
has no Clusters puzzle at any difficulty.

#### Scenario: A board with no puzzle at all is rejected

- **WHEN** a board of 1×1 or 2×2 is validated
- **THEN** it is rejected, naming the constraint, rather than accepted and
  generated for ever

### Requirement: Params: Clusters refuses to generate Normal on a board too small for it

Validation SHALL refuse Normal, when a board is to be generated, on a board of
fewer than 12 squares or one whose shorter side is less than two, which is too
small to admit one, as having no such tier.

#### Scenario: The boundary, in both of its shapes

- **WHEN** Normal is asked for on a 3×3 or a 1×20 board that is to be
  generated
- **THEN** each is refused as having no Normal puzzle of its size
- **AND** 3×4 is accepted, as is 3×3 at Normal when a description comes with
  it

### Requirement: Description: Clusters descriptions use the upstream run-length dot encoding

A Clusters description SHALL be the given dots and nothing else, written as
the fill engine's `dots` segment (`described-fill-game`) over the cells in
row-major order: a lowercase letter is a dotted disc and an uppercase letter
a dotted block, upstream's red and blue.

#### Scenario: The board the first preset deals

- **WHEN** `DceclHbAacAg` is read for `7x7`
- **THEN** its `D` puts a dotted block on the fourth cell, after three blanks,
  and its closing `g` leaves the last six cells blank

### Requirement: Generation: Clusters' tiers are the single-cell rule, the count, and a search

**Easy** SHALL be the single-cell proof by contradiction. **Normal** SHALL add
the count: tile B's count over the squares it shares with tile A bounds how
many of them take A's piece, which settles A's other empty neighbors.
**Unreasonable** SHALL be a board the two do not finish that a search proves
has one answer, and a board labeled Normal that the count does not finish
opens there. A board SHALL be dealt by its description's climb
(`described-fill-game`).

#### Scenario: The harder tier needs the deeper reasoning

- **WHEN** a board generated at Normal is solved using only the single-cell rule
- **THEN** the solver does not reach a solution
- **AND** solving the same board with the count completes it

#### Scenario: An Unreasonable board needs a search

- **WHEN** a board is generated at Unreasonable
- **THEN** the count does not finish it, and the search finds exactly one answer

### Requirement: Controls: Clusters is painted by click, drag and keyboard cursor

Clusters' buttons, keys and drag SHALL be those the fill engine derives from
its description (`described-fill-game`): a click SHALL go round empty, the
button's piece and the other one; `1` SHALL place a block and `0` or `2` a
disc; a drag SHALL repeat the pressed square's change on the squares it
passes that held what that square held. A given dot SHALL never be
overwritten. A hand-written Clusters' save is not read.

#### Scenario: Dragging paints a run of cells

- **WHEN** a drag is started on a blank cell and moved across several blank
  cells
- **THEN** every blank cell it passes holds the piece the press gave the first

#### Scenario: A drag over a given leaves the given alone

- **WHEN** a drag passes over a given dot cell and is released
- **THEN** the given keeps its piece and its dot

### Requirement: Controls: A Shift or Ctrl arrow is the fill engine's stroke

An arrow pressed with Shift or Ctrl SHALL move the cursor and paint the square
it left and the square it entered as the fill engine's stroke does
(`described-fill-game`): Shift puts a disc in an empty one, and Ctrl in a
block as well. A given dot SHALL be skipped, and what is painted SHALL be one
move.

#### Scenario: The run passes over a dot

- **WHEN** Shift with an arrow moves the cursor from an empty square onto a
  given dot
- **THEN** the square left holds a disc, the dot is unchanged, and the cursor
  is on the dot

### Requirement: Hint: Solve and the hint use the deeper rung at every tier

`solve` and `hint` SHALL use the deeper rung whatever tier the board was
generated at: they are "try as hard as you can", and the rung costs nothing on
a board that does not need it. Solve SHALL take the answer the search proves.
The hint of a board dealt at Easy SHALL nonetheless need no count step at all.

#### Scenario: Solving an Easy board

- **WHEN** a board generated at Easy is solved
- **THEN** the solver runs with the count available and fills the board to
  its unique solution

#### Scenario: An Easy board is hinted to the end without a chain

- **WHEN** a board generated at Easy is followed hint by hint from its start
- **THEN** every step is a single-cell deduction and the board ends solved

### Requirement: Hint: A Clusters hint step names the rule the other color would break

Each hint step SHALL name the rule that the opposite coloring would violate: a
tile wholly sealed off from its own color, a given dot that would touch a
second same-color tile, or a plain tile that could no longer touch two tiles
of its own color. It SHALL state the premise, the contradiction and the
conclusion.

#### Scenario: A forced move is explained by the rule it would break

- **WHEN** a hint is requested on a solvable, mistake-free board
- **THEN** the forced cell is ringed, and the explanation names the rule
  (sealed off, dot overcount, or cannot-touch-two) that the opposite color
  would violate, outlining the endangered tile when it is not the target itself

### Requirement: Hint: The tile the other color would break is outlined, in a hue the error frame does not use

What the ring and the outline of a step stand for SHALL be the legend's
(`hint.marks`). When the contradiction lands on a tile other than the target,
that tile SHALL carry a second mark, the outline, as a frame in a hue the
live-error frame does not use, and a count step SHALL outline both tiles it
reads the same way. When the contradiction lands on the target itself, the
step SHALL outline no tile for it.

#### Scenario: The word and the ring go together

- **WHEN** a hint step is displayed
- **THEN** its sentence says "outlined" of a tile exactly when a tile other
  than the target carries the second mark

### Requirement: Hint: A Clusters hint is refused where it cannot deduce

A hint SHALL be refused, and SHALL NOT deduce onward, when the deduction runs
into a contradiction from the player's position. `findMistakes` names a wrong
tile wherever the board has one answer, so that refusal is reached only on a
description without one. Where the deduction stops short, as on an
Unreasonable board, the hint SHALL give the steps it has, and refuse with
`DEDUCTION_EXHAUSTED` only where it has none.

#### Scenario: Several wrong tiles, none flagged

- **WHEN** a dealt board holds several tiles that disagree with its solution,
  none of them breaking a local rule, and a hint is asked for
- **THEN** the banner asks for the highlighted mistakes to be fixed, and each
  of those tiles is highlighted

### Requirement: Hint: A count step names each tile by its piece and dot

A count step SHALL ring the cell it fills and outline the two tiles it reads,
named by piece and dot, or as one and the other where those agree, and SHALL
say how many more of a piece the first must touch, how many the second
allows, and which of them the square is beside.

#### Scenario: Two dotted blocks

- **WHEN** one dotted block must touch two more blocks, another allows at most
  one beside it, and the square is beside only the first
- **THEN** the step says "One outlined dotted block must touch two more
  blocks, and the other outlined dotted block allows at most one block beside
  it, so this square, beside only the first, must hold a block."

### Requirement: Look: Clusters draws its two colors as the collection's two-state pair

The board SHALL be drawn as pieces on a quiet surface. The two pieces a cell
can take SHALL be the two members of the collection's two-state pair: the
block, the piece the primary button gives, is the first member and the disc
the second, each drawn in that member's color and shape, inset on its cell.
A given SHALL sit on a lifted surface and carry a dot on its piece, light on
the darker block and dark on the lighter disc in both schemes.

#### Scenario: The primary button's color is the pair's first member

- **WHEN** an empty cell is clicked once with the primary button
- **THEN** the cell holds a piece in the color and the shape of the first
  member of the two-state pair
