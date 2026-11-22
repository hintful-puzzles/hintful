## MODIFIED Requirements

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

### Requirement: Controls: Bricks cells cycle by a click or a drag

Bricks SHALL take its clicks, its keys and its drag from its description's
`play`: a click cycles a cell round empty, shaded and clear, the right
button the other way, 1 shades and 0 or 2 marks clear, and a drag paints
the cells it crosses in one move. A numbered cell SHALL never be shadeable.

#### Scenario: Dragging paints a run of cells

- **WHEN** the player presses on a cell and drags across further playable cells
- **THEN** on release every dragged playable cell is set to the drag's color in a
  single move

### Requirement: Look: Bricks draws its marks beside the piece

The keyboard cursor and both of a hint's rings SHALL be drawn in the margin a
piece leaves round itself, so none lands on a piece, on the cell's sheared
place.

#### Scenario: A ring on a shaded cell leaves the piece whole

- **WHEN** the cursor or a hint ring is drawn on a cell holding a piece
- **THEN** the ring does not cover the piece

## ADDED Requirements

### Requirement: Params: Bricks reads upstream's Tricky as Unreasonable

The letter `t`, upstream's third tier, which dealt only boards its Normal
does, SHALL be read as `Unreasonable` and never written, so an ID carrying
it opens and a params string carrying it deals.

#### Scenario: A Tricky board upstream dealt

- **WHEN** `7x6dt:ga6c3ac3a2af3_0_3b2_4ag` is opened
- **THEN** it is the 7×6 Unreasonable board, and Solve finishes it

### Requirement: Generation: Bricks builds its wall row by row from the bottom

The deal SHALL lay the answer row by row from the bottom, each cell a brick
two times in three where the rules still allow one, and SHALL draw again
where fewer than two in five cells are bricks. The numbers are those on its
clear cells, as many hidden as the board stays at its tier.

#### Scenario: Each tier at the smallest widths

- **WHEN** boards are dealt at 2×3 and 3×2 Unreasonable and 2×10 Easy
- **THEN** each has one answer, two in five of its cells bricks or more, and
  opens at its tier from its own ID

### Requirement: Controls: Shift or Ctrl with a Bricks move marks clear the cells the cursor leaves and enters

Shift with a move SHALL mark clear each empty cell of the two the cursor
leaves and enters, and Ctrl each shaded one as well; a numbered cell among
them is left as it is. A move on the number pad SHALL stroke as an arrow
does.

#### Scenario: Ctrl with the pad's 7

- **WHEN** the cursor is on an empty cell with an empty cell above it, and
  the player presses Ctrl with the pad's 7
- **THEN** the cursor moves up and both cells are marked clear

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

### Requirement: Status bar: The Bricks status bar counts the numbers left

The status bar SHALL read `Clues left: {n}`, counting the shown numbers with
a neighbor still undecided or a count broken, and SHALL be empty once none
is left.

#### Scenario: A board as dealt, and solved

- **WHEN** upstream's 7×6 Easy board `2c1_3ab0c2_3fb2_2a5a3fb2a2a2` is
  opened, and then solved
- **THEN** the status bar reads "Clues left: 13", and then is empty

## REMOVED Requirements

### Requirement: Params: The undeclared Bricks tier still loads and is never dealt

**Reason**: Upstream's Tricky is read as Unreasonable, the tier its boards
are, and deals there.
**Migration**: See "Params: Bricks reads upstream's Tricky as Unreasonable".

### Requirement: Generation: The Bricks generator solves the fully numbered board before it removes a number

**Reason**: The fill deal holds every answer it builds to the rules with its
numbers before it hides one, and the hand-written generator is gone.
**Migration**: See "Generation: Bricks builds its wall row by row from the
bottom".

### Requirement: Controls: Ctrl or Shift with a Bricks move paints the cells the cursor leaves and enters

**Reason**: Bricks strokes as every fill game whose drag sweeps: Shift and
Ctrl mark clear.
**Migration**: See "Controls: Shift or Ctrl with a Bricks move marks clear
the cells the cursor leaves and enters".

### Requirement: Hint: The Bricks hint carries on from its last step, by the rules in order

**Reason**: The fill engine's hint orders the cells one firing forces.
**Migration**: See "Hint: The Bricks hint carries on from its last step,
then by its rules".

### Requirement: Look: Bricks draws in red where the board breaks a rule

**Reason**: A brick resting on nothing is drawn in the error color, as the
fill engine draws a cell a rule breaks at, not with a diamond.
**Migration**: See "Look: Bricks marks a broken rule as the fill engine
does".
