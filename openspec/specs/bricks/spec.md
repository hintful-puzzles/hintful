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

`findMistakes` SHALL report every cell shaded or ruled out against the
board's answer; a broken rule always holds one, since the board has one. A
brick or a cross the answer contradicts SHALL be drawn in the error color
when the check hands `redraw` its mistakes, beside the rule marks.

#### Scenario: A rule violation is reported

- **WHEN** the grid contains a rule violation and the player invokes Check & Save
- **THEN** `findMistakes` reports a cell of it that the answer contradicts

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

### Requirement: Params: A Bricks params string may leave out its difficulty

Bricks' params, their bounds and their encoding SHALL be those its
description declares (`described-fill-game`), and its menu its boards. A
string with no `d` SHALL decode as Easy. The difficulty letters SHALL stay
upstream's, `e` and `n` for `Unreasonable`, so that an existing game ID
names the same board.

#### Scenario: The Unreasonable preset

- **WHEN** `6x7dn` is decoded
- **THEN** it is the 6×7 `Unreasonable` board
- **AND** its shared encoding is `6x7`, which decodes as Easy

### Requirement: Params: Bricks reads upstream's Tricky as Unreasonable

The letter `t`, upstream's third tier, which dealt only boards its Normal
does, SHALL be read as `Unreasonable` and never written, so an ID carrying
it opens and a params string carrying it deals.

#### Scenario: A Tricky board upstream dealt

- **WHEN** `7x6dt:ga6c3ac3a2af3_0_3b2_4ag` is opened
- **THEN** it is the 7×6 Unreasonable board, and Solve finishes it

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
`newState` SHALL read a run however it is split into letters, and a run
written SHALL end at a corner of the hexagon, as upstream's does. A number
SHALL be from 0 to 7, and a 7 SHALL be a hole: a given cell that cannot be
shaded and counts nothing, drawn clear with no number.

#### Scenario: A dealt 6×7 board

- **WHEN** `a1b2ad2a0a4b3fa3b4ab5a5a1e` is opened as a 6×7 board
- **THEN** its forty-two cells are covered, and the top row of six reads a
  blank cell, 1, two blank cells, 2 and a blank cell
- **AND** with its first number written 8 it is refused as out of range

### Requirement: Generation: Bricks offers Easy and Unreasonable, and no third tier

Bricks SHALL offer two tiers, Easy and `Unreasonable`. An Easy board SHALL be one its ladder finishes from its numbers, and an Unreasonable one a board with one answer that the ladder stops short of, dealt and graded by the engine's search, since only a tier of that name may ask for a search. Upstream's third tier, whose sub-solve recursed in turn, names no boards, so it SHALL NOT be offered under any name: not in the preset menu, the difficulty contract or the custom-params dialog.

#### Scenario: The preset menu offers two tiers

- **WHEN** the preset menu is listed
- **THEN** every entry is Easy or `Unreasonable`

#### Scenario: An Unreasonable board needs the search

- **WHEN** a board is dealt at Unreasonable
- **THEN** the search finds it one answer
- **AND** the ladder does not finish it

### Requirement: Generation: Bricks builds its wall row by row from the bottom

The deal SHALL lay the answer row by row from the bottom, each cell a brick
two times in three where the rules still allow one, and SHALL draw again
where fewer than two in five cells are bricks. The numbers are those on its
clear cells, as many hidden as the board stays at its tier.

#### Scenario: Each tier at the smallest widths

- **WHEN** boards are dealt at 2×3 and 3×2 Unreasonable and 2×10 Easy
- **THEN** each has one answer, two in five of its cells bricks or more, and
  opens at its tier from its own ID

### Requirement: Solver: The Bricks solver places cells by contradiction

The ladder SHALL place each cell by contradiction: a color supposed in an open cell breaks a rule at once, so the cell is the other color. Each way a rule breaks SHALL be a technique of the description, checked sound, and SHALL also hold its rule on the marks as they stand, so a broken position is a contradiction. The ladder SHALL NOT guess.

#### Scenario: The five ways a supposed color breaks a rule

- **WHEN** the description's techniques are listed
- **THEN** they are: clearing the cell leaves a shaded brick above it nothing
  to rest on, or a number too few cells to reach it; shading it makes three in
  a row, leaves it nothing beneath it to rest on, or gives a number too many

#### Scenario: A cell that would complete a row of three is cleared

- **WHEN** an empty cell lies between two shaded cells of its row, on a board
  that has a solution
- **THEN** the ladder finds shading it breaks a rule and sets it unshaded

### Requirement: Solver: Bricks knows a board's answer from the search beneath its ladder

Solve, the hint's refusal and the mistake check SHALL know a board's answer from the engine's search by trial and error over the ladder, whatever tier the board was dealt at, and a board the search finds no one answer SHALL be one Solve refuses and the hint does not plan on.

#### Scenario: Solve on an upstream Tricky board

- **WHEN** the player asks for the solution of one of the Tricky boards upstream's generator dealt
- **THEN** the board is solved

### Requirement: Controls: Bricks cells cycle by a click or a drag

Bricks SHALL take its clicks, its keys and its drag from its description's
`play`: a click cycles a cell round empty, shaded and clear, the right
button the other way, 1 shades and 0 or 2 marks clear, and a drag paints
the cells it crosses in one move. A numbered cell SHALL never be shadeable.

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

### Requirement: Controls: Shift or Ctrl with a Bricks move marks clear the cells the cursor leaves and enters

Shift with a move SHALL mark clear each empty cell of the two the cursor
leaves and enters, and Ctrl each shaded one as well; a numbered cell among
them is left as it is. A move on the number pad SHALL stroke as an arrow
does.

#### Scenario: Ctrl with the pad's 7

- **WHEN** the cursor is on an empty cell with an empty cell above it, and
  the player presses Ctrl with the pad's 7
- **THEN** the cursor moves up and both cells are marked clear

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

Each hint step SHALL decide one cell, a single self-contained journey: a firing that forces several is as many steps. A paint that gives the step's cell the color it forces, alone or in a drag across other cells, SHALL complete the step, and every other move SHALL be off the plan.

#### Scenario: A step decides one cell and leaves it as it was

- **WHEN** a hint step is shown
- **THEN** it rings one cell, which is still empty on the board
- **AND** the cells it reasons from carry a different mark

### Requirement: Hint: Bricks calls its piece shaded and never by its color

Bricks' hint sentences, control words and help page SHALL say "shaded" for
the shaded state and SHALL NOT say the piece's color.

#### Scenario: A hint rests on a shaded cell

- **WHEN** a hint step reasons from a cell that is shaded
- **THEN** its sentence calls it a shaded brick and names no color

### Requirement: Hint: The search beneath the Bricks ladder is never narrated

The search beneath the ladder SHALL NOT be narrated at all: it commits a cell by solving the rest of the board from a hypothesis, and no hint narrates a search on any tier. Where only the search could progress, the hint SHALL refuse instead.

#### Scenario: The search never reaches a narration

- **WHEN** a hint is asked for where the ladder forces no cell on a board the search finds one answer
- **THEN** the hint refuses, saying that nothing further follows by deduction

### Requirement: Hint: A Bricks hint step's reason is the technique that fired

Every hint step SHALL give as its reason the technique that forced its cell, and SHALL name the rule that technique states. No hint sentence SHALL claim that a chain of forced consequences was followed.

#### Scenario: Every technique reaches a narration

- **WHEN** hint plans are recorded over dealt boards replayed from shares of their answers
- **THEN** each of the five techniques gives some step its reason

### Requirement: Hint: The Bricks hint carries on from its last step, then by its rules

The hint SHALL take, of the firings the ladder could make, the one that
carries on from the cells its last step read and decided, and otherwise
the first by its rule: a shaded brick stranded, a number left short, three
in a row, a brick resting on nothing, a number given too many.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 4×4 board `2b1c0c2_2b1` with no cell
  decided
- **THEN** the first step shades the cell right of the top-left 2, since the
  2 cannot reach its count without it
- **AND** the next shades the cell beneath it, by the same 2

### Requirement: Status bar: The Bricks status bar counts the numbers left

The status bar SHALL read `Clues left: {n}`, counting the shown numbers with
a neighbor still undecided or a count broken, and SHALL be empty once none
is left.

#### Scenario: A board as dealt, and solved

- **WHEN** upstream's 7×6 Easy board `2c1_3ab0c2_3fb2_2a5a3fb2a2a2` is
  opened, and then solved
- **THEN** the status bar reads "Clues left: 13", and then is empty

### Requirement: Look: Bricks draws its marks beside the piece

The keyboard cursor and both of a hint's rings SHALL be drawn in the margin a
piece leaves round itself, so none lands on a piece, on the cell's sheared
place.

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

### Requirement: Look: Bricks marks a broken rule as the fill engine does

A rule violation SHALL be marked on the board, always and with no mistake
check asked for (`Game.rules`): a bar over three shaded cells in a row, a
shaded cell that can rest on nothing in the error color, and the number of a
clue that can no longer count its bricks in the error color. While a drag is
in flight the marks SHALL be those of the board the drag previews.

#### Scenario: A committed row of three is marked at once

- **WHEN** a move leaves three shaded cells in a row and no drag is in flight
- **THEN** the bar is drawn over them

#### Scenario: A brick over an open square is not yet marked

- **WHEN** a shaded cell has one square beneath it still empty and the other
  clear
- **THEN** it is drawn in its own color
