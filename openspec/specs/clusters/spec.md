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

Every cell of a finished board SHALL hold one of two colors. A tile given as a
dot SHALL touch exactly one orthogonally adjacent tile of its own color, and
every other tile SHALL touch at least two. The board SHALL be solved when every
cell is filled and no rule is broken. A cell that breaks a rule as the board
stands SHALL be framed in the error color as the player plays.

#### Scenario: A rule-breaking cell is reported as a mistake

- **WHEN** the board contains a cell that violates a cluster rule and mistakes
  are checked
- **THEN** a mistake is reported, and Check & Save declines to save

#### Scenario: Completing the grid wins

- **WHEN** a move fills the last cell so every cell satisfies the cluster rules
- **THEN** the game is reported solved

### Requirement: Rules: Clusters' findMistakes reports each tile the answer contradicts

On a board the solver finishes from its givens, `findMistakes` SHALL report
every tile the player placed in the color that answer does not give it, whether
or not it breaks a rule, and nothing else. On any other board it SHALL report
the cells that break a rule. The surface under a reported tile SHALL be drawn
in the error wash when the check hands `redraw` its mistakes.

#### Scenario: A wrong tile that breaks no rule

- **WHEN** one tile is placed in the color the answer does not give it, no rule
  is broken, and Check & Save is pressed
- **THEN** one mistake is reported, that tile's surface is repainted in the
  error wash on a board already drawn, and the board is not saved

### Requirement: Params: A Clusters params string is its declared codec's, and one with no difficulty is Easy

Clusters' params and their encoding SHALL be those its `paramConfig` and its
declared codec give (`engine-params`, "A game declares its params encoding
once, and both codec halves are derived"), with no departure from the codec
grammar. A params string that carries no difficulty SHALL decode to Easy. The
tier letters SHALL be `e`, `t` and `u`.

#### Scenario: The Normal preset's two forms

- **WHEN** `7x7dt` is decoded
- **THEN** it is a 7×7 board at Normal, whose short form is `7x7`
- **AND** `7x7` decoded and encoded in full is `7x7de`

### Requirement: Params: Clusters refuses a board size that has no puzzle

Validation SHALL reject a board whose area is at least 10000 as too large and
one whose area is less than 2 as too small. It SHALL additionally reject a
board no larger than 2×2 in both dimensions, which has no Clusters puzzle at
any difficulty.

#### Scenario: A board with no puzzle at all is rejected

- **WHEN** a board of 1×2 or 2×2 is validated
- **THEN** it is rejected, naming the constraint, rather than accepted and
  generated for ever

### Requirement: Params: Clusters refuses to generate Normal on a board too small for it

Validation SHALL refuse Normal, when a board is to be generated, on a board of
fewer than 12 squares or one whose shorter side is less than two, which is too
small to admit one.

#### Scenario: The boundary, in both of its shapes

- **WHEN** Normal is asked for on a 3×3, a 2×5 or a 1×20 board that is to be
  generated
- **THEN** each is refused with "Normal needs a board of at least 12 squares,
  at least two wide."
- **AND** 3×4 and 2×6 are accepted, as is 3×3 at Normal when a description
  comes with it

### Requirement: Description: Clusters descriptions use the upstream run-length dot encoding

A Clusters description SHALL be the given dots and nothing else, written in
the engine's dot-run grammar (`engine-params`, "The engine provides the
dot-run description grammar") over the cells in row-major order: a lowercase
letter is a red dot and an uppercase letter a blue one. The parser SHALL
refuse what `readDotRuns` refuses and nothing of its own.

#### Scenario: The board the first preset deals

- **WHEN** `DceclHbAacAg` is read for `7x7`
- **THEN** its `D` puts a blue dot on the fourth cell, after three blanks, and
  its closing `g` leaves the last six cells blank
- **AND** `DceclHbAacAG`, the same with its closing letter in uppercase, is
  refused for the `G`

### Requirement: Generation: Clusters' tiers are the single-cell rule, the count, and a search

**Easy** SHALL be the single-cell proof by contradiction. **Normal** SHALL add the count: tile B's count over the squares it shares with tile A bounds how many of them take A's color, which settles A's other empty neighbors. **Unreasonable** SHALL be a board the two do not finish that a search proves has one answer, and a board labeled Normal that the count does not finish opens there.

#### Scenario: The harder tier needs the deeper reasoning

- **WHEN** a board generated at Normal is solved using only the single-cell rule
- **THEN** the solver does not reach a solution
- **AND** solving the same board with the count completes it

#### Scenario: An Unreasonable board needs a search

- **WHEN** a board is generated at Unreasonable
- **THEN** the count does not finish it, and the search finds exactly one answer

### Requirement: Controls: Clusters is painted by click, drag and keyboard cursor

Clusters SHALL take its clicks, its cursor and its select keys from its
`targetVerbs` declaration (`engine-input`, "The engine owns a declaring game's
press and select keys"). The drag is the game's own: the press SHALL pick the
state its click would give the pressed square, and on release every square the
drag passed, whatever it held, SHALL take that state as one move. A given dot
SHALL never be overwritten.

#### Scenario: Dragging paints a run of cells

- **WHEN** a drag is started and moved across several blank cells
- **THEN** every non-given cell it passes is painted the drag color on release

#### Scenario: A drag over a given leaves the given alone

- **WHEN** a drag passes over a given dot cell and is released
- **THEN** the given keeps its color and its dot

### Requirement: Controls: Clusters' number keys set the cursor's square outright

Each key-only verb of `targetVerbs` SHALL set the cursor's square to its state
whatever the square held, where a click cycles it, and SHALL make no move on a
given dot or on a square already in that state.

#### Scenario: A key does not cycle

- **WHEN** the cursor is on a blue square and `1` is pressed twice
- **THEN** no move is made and the square stays blue, where two left clicks
  would have cleared it

### Requirement: Controls: An arrow with Shift or Ctrl paints the squares the cursor leaves and enters

An arrow pressed with Shift SHALL move the cursor and color red both the
square it left and the square it entered; with Ctrl, blue; with both, it SHALL
clear them. A given dot and a square already in that state SHALL be skipped,
and what is painted SHALL be one move. Where the grid's edge stops the cursor,
the square it stays on SHALL still be painted. A hidden cursor SHALL be shown
and SHALL paint on that same press, from where it was parked.

#### Scenario: A row painted from the keyboard

- **WHEN** the cursor is on the first of three empty squares in a row and
  Ctrl with the Right arrow is pressed twice
- **THEN** all three squares are blue, the first press having painted two of
  them and the second one more

#### Scenario: The first press on a hidden cursor

- **WHEN** `DceclHbAacAg` is opened for `7x7`, whose first three squares are
  empty, and Shift with the Right arrow is pressed before any other key
- **THEN** the cursor shows on the second square of the top row, and the first
  two squares are red

#### Scenario: The run passes over a dot

- **WHEN** Shift with an arrow moves the cursor from an empty square onto a
  given dot
- **THEN** the square left is red, the dot is unchanged, and the cursor is on
  the dot

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
(`hintMarks`). When the contradiction lands on a tile other than the target,
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

### Requirement: Hint: A count step names both tiles it reads

A count step SHALL ring the cell it colors and outline the two tiles it reads, named by color and kind, or by order where those agree, and SHALL say where the first tile's color must or may only be among the squares both touch.

#### Scenario: A dot's last color is among the shared squares

- **WHEN** a yellow dot that needs one more yellow shares squares with a purple dot that leaves at least one of them yellow
- **THEN** the step says "The outlined yellow dot's last yellow must also touch the outlined purple dot, so this cell must be purple." of the dot's other empty neighbor

### Requirement: Look: Clusters draws its two colors as the collection's two-state pair

The board SHALL be drawn as pieces on a quiet surface. The two colors a cell
can take (which the description and controls requirements call blue and red,
after upstream) SHALL be the two members of the collection's two-state pair:
blue, the color the primary button gives, is the first member and red is the
second, each drawn in that member's color and shape, inset on its cell. A
given SHALL sit on a lifted surface and carry its dot on its piece.

#### Scenario: The primary button's color is the pair's first member

- **WHEN** an empty cell is clicked once with the primary button
- **THEN** the cell holds a piece in the color and the shape of the first
  member of the two-state pair
