# tents Specification

## Purpose
Tents, the puzzle of placing tents so that each tree can be matched to its own
orthogonally adjacent tent, no two tents touch even diagonally, and each row and
column holds its clued count. This capability specifies the game: what counts
as solved, what its params refuse and its description encoding, its solver
ladder, tiers and generator, live errors and its look, its drag and its
painting arrows, the link notation, mistake-checking and the explained hint.

## Requirements

### Requirement: Rules: Tents completion is judged from the board

Tents are placed on a `w × h` grid of fixed trees. The board SHALL be reported
complete when the tent count equals the tree count, every row and column holds
exactly its edge number of tents, no two tents are adjacent even diagonally,
and the trees and tents admit a one-to-one matching of each tent to an
orthogonally adjacent tree.

#### Scenario: Completion requires a valid matching

- **WHEN** the tents match all edge numbers and are non-adjacent but no
  perfect matching of trees and tents exists
- **THEN** the state does not report completed

### Requirement: Rules: Adjacent tents are marked with an error diamond

`redraw` SHALL mark two tents that are orthogonally or diagonally adjacent
with an error diamond: on the middle of the edge an orthogonal pair shares, and
on the corner a diagonal pair shares. A diamond SHALL be filled in the error
color and SHALL carry an exclamation mark.

#### Scenario: Adjacent tents are flagged

- **WHEN** two tents are placed diagonally adjacent
- **THEN** the shared corner shows an error diamond

### Requirement: Rules: An edge number that cannot be met is red

`redraw` SHALL draw an edge number in the error color when its row or column
holds more tents than the clue, or when its tents and its blank squares
together fall below the clue.

#### Scenario: An unmet clue is flagged

- **WHEN** a column already holds more tents than its edge number
- **THEN** that edge number renders red

#### Scenario: A line with too little room is flagged

- **WHEN** the tents and the blank squares of a row together number fewer than
  its edge number
- **THEN** that row's number is drawn in the error color

### Requirement: Rules: An over-committed group of tents or trees is red

A tent in a connected group of adjacent trees and tents with fewer trees than
tents SHALL be drawn in the error color. A tree in a connected group of
adjacent trees, tents and blank squares, a blank counting as a possible tent,
with more trees than tents and blanks together SHALL be drawn with an error
trunk and error leaves.

#### Scenario: Two tents on one tree are flagged

- **WHEN** two tents stand beside the same tree and beside no other
- **THEN** both tents are drawn in the error color

### Requirement: Rules: Tents ships findMistakes

`findMistakes(state)` SHALL re-solve the board's trees and edge numbers with
the top-difficulty solver and, when a unique solution exists, return one
mistake per placed square that contradicts it: a tent where the solution has
none, or a non-tent where the solution has a tent. Blank squares SHALL never be
mistakes. Such a square SHALL be rendered with a distinct inset red overlay.

#### Scenario: A wrong tent blocks Check & Save

- **WHEN** a tent is placed where the unique solution has none and
  `findMistakes` runs
- **THEN** exactly that square is reported and rendered with the mistake
  overlay

#### Scenario: Blank squares are not mistakes

- **WHEN** the board holds only correct tents and non-tents plus blanks
- **THEN** `findMistakes` returns an empty list

### Requirement: Rules: A link no pairing holds is a mistake

When a unique solution exists, `findMistakes` SHALL also return every link
that no pairing of the solution's tents with its trees can hold together with
the links before it in reading order, because the solution's tents are unique
but its pairing need not be. Such a link SHALL be rendered in the mistake
color.

#### Scenario: A link no pairing holds is a mistake

- **WHEN** the player joins a correct tent to a tree that no pairing of the
  solution gives it, and `findMistakes` runs
- **THEN** that link is reported and drawn in the mistake color

### Requirement: Rules: Tents has a link notation

The state SHALL record, per square, the tree or tent it is joined to, only
ever between a tent and an orthogonally adjacent tree and always at both ends.
A link move SHALL set rather than toggle. A square that stops being a tent
SHALL let go of its tree, and a solve SHALL clear every link. The win condition
SHALL NOT read links. `redraw` SHALL draw a link as a thin ink line across the
shared grid line, in a shape and color distinct from a tree's trunk.

#### Scenario: Removing a tent parts its link

- **WHEN** a joined tent is cleared or marked as grass
- **THEN** neither it nor its tree is joined to anything

### Requirement: Params: A Tents params string is its declared codec's, and one with no difficulty is Easy

Tents' params (a width, a height and a difficulty) and their encoding SHALL be
those its `paramConfig` and its declared codec give (`engine-params`, "A game
declares its params encoding once, and both codec halves are derived"), with
no departure from the codec grammar. A params string with no `d` SHALL decode
as Easy.

#### Scenario: Params round-trip

- **WHEN** the params 15×15 at Normal are encoded in full
- **THEN** the result is `15x15dt` and decoding it round-trips the params

#### Scenario: A bare size

- **WHEN** `10` is decoded
- **THEN** the params are a 10×10 board at Easy

### Requirement: Params: No 4×4 Tents board is dealt above Easy

Of full params `validateParams` SHALL refuse a 4×4 above Easy, a size none of
whose boards needs the harder tier.

#### Scenario: A 4×4 Normal board that arrives written still loads

- **WHEN** a game ID carries a 4×4 Normal board with its description
- **THEN** the params are accepted, and the same params are refused when a
  board is to be dealt

### Requirement: Params: Tents refuses a grid whose area cannot be counted

`validateParams` SHALL refuse, at every check, a width and a height whose
product is past the largest whole number the program counts exactly, in the
engine's sentence that the width times the height must not be unreasonably
large.

#### Scenario: A width in the thousands of millions of millions

- **WHEN** the width of `8x8de` is changed to 1200000000000000 and the params
  are checked, for a deal or for a board that arrives written
- **THEN** they are refused: "Width times height must not be unreasonably
  large."

### Requirement: Description: Tents descriptions use the upstream run-length encoding

The desc SHALL encode the tree grid row-major as a run-length code, where `_`
is a tree, `a`–`y` a run of 1–25 blanks then a tree, `z` a run of 25 blanks,
and the sequence terminates with a tree-past-the-end marker. The `w + h` edge
numbers SHALL follow, columns then rows, each preceded by a comma. A desc with
an invalid character, a wrong grid area, or a missing or malformed number SHALL
be refused.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc with a bad grid area or a missing number is loaded
- **THEN** it is refused with an error

### Requirement: Description: A Tents number is at most the length of its line

`newState` SHALL refuse a description in which a column's number is above the
height of the grid or a row's number above its width. It SHALL also refuse a
`z` that brings the count of squares up to or past the grid's area, since `z`
is written only with blank squares still to follow it.

#### Scenario: A column of an 8×8 board is given 9 tents

- **WHEN** the first number of
  `ebachbngeca_a,2,1,2,1,1,1,1,3,3,0,1,2,1,1,2,2`, the first column's 2, is
  changed to 9 and the result is read as an 8×8 board
- **THEN** it is refused as holding a number out of range for its board
- **AND** an 8 in that place is in range, so `newState` reads it, and the
  board is then refused for another reason: its clues contradict each other

### Requirement: Generation: Tents generates solver-gated boards

`newDesc` SHALL place `w*h/5` tents, rounded down, no two of them adjacent
even diagonally, and a tree beside each in a one-to-one matching; reject any
layout with a row or column that holds neither a tree nor a tent; and accept
only when the solver succeeds at the target difficulty and fails to converge
one level below.

#### Scenario: A layout with an empty column is thrown away

- **WHEN** a layout places every tent and tree and leaves one column with
  neither
- **THEN** it is thrown away before the solver is asked, and another layout
  is drawn

### Requirement: Generation: Tents' link rung sits beneath Easy, and its Easy rungs at Easy

The rung that links a tent to its one unattached adjacent tree SHALL sit
beneath Easy, so that the generator's links-only cap runs it alone. At Easy the
ladder SHALL run: grass on a blank square with no adjacent unmatched tree;
grass on a blank square touching a tent, even diagonally; a tent, linked to
the tree, on a tree's single candidate square; the link of a tree to a tent
already on its single candidate square; and the per-line count.

#### Scenario: The links-only cap runs one rung

- **WHEN** the solver runs at the cap beneath Easy
- **THEN** only the rung that links a tent to its tree runs

### Requirement: Generation: Tents' Normal rungs are rungs of their own

At Normal the ladder SHALL add the tree diagonal-pair elimination, which makes
a non-tent of the square between a tree's two diagonal candidates, and the line
count's reading of the two lines alongside. Each SHALL be a rung of its own that
writes only what its Normal half deduces.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: A mis-tiered Normal rung fails

- **WHEN** either Normal rung is declared at Easy
- **THEN** the generator's gate accepts different boards, and the frozen
  differential fails

### Requirement: Solver: Tents' solver is a certified deduction ladder

Tents' solver SHALL run its deductions as a `runDeductionFixpoint` ladder,
each deduction a rung of its own. The boards of its firing census SHALL be
those generated at every preset, read from `presets`, and at a non-square
size, at every cap the generator uses, and every rung SHALL fire on them. The
solver SHALL NOT keep a hand-written loop beside the ladder.

#### Scenario: A Normal rung nothing depends on is still certified

- **WHEN** the tree diagonal-pair rung is silenced
- **THEN** the census reports it as never fired, even though the frozen
  differential still passes, because other rungs reach its conclusions

### Requirement: Solver: Tents' line count reads every placement of a line's tents

The per-line count SHALL enumerate every valid placement of a row's or
column's remaining tents and place a tent or a non-tent in any square that
every placement gives the same state. At Normal a rung of its own SHALL read
the same placements for what they do to the two lines alongside.

#### Scenario: A line that has its count is grassed

- **WHEN** a row already holds as many tents as its edge number
- **THEN** the count makes every blank square of that row a non-tent

### Requirement: Controls: Tents places tents and grass by click and drag

`interpretMove` SHALL start a one-cell drag on a left or right press, extend it
along the single nearer row or column, and enact it on release. A left click
SHALL set a blank square to a tent or clear a non-blank square; a right click
SHALL set a blank to a non-tent or clear a non-blank; a right-drag, and only
a right one, SHALL set every blank square it covers to a non-tent. Trees SHALL
never be modified.

#### Scenario: A left click toggles a tent

- **WHEN** a blank square is left-clicked, then left-clicked again
- **THEN** the square becomes a tent, then blank

#### Scenario: A right-drag paints non-tents

- **WHEN** the right button is dragged across a row of blank squares
- **THEN** every covered blank square becomes a non-tent

### Requirement: Controls: An arrow with Shift or Ctrl grasses the squares the cursor leaves and enters

Shift or Ctrl with an arrow SHALL move the cursor and set the square it leaves
and the square it enters to a non-tent where blank, and with Ctrl where a tent
too.

#### Scenario: A shifted arrow paints grass

- **WHEN** the cursor is on a blank square and Shift with an arrow moves it
  onto another blank square
- **THEN** one move makes both squares non-tents
- **AND** a tent under either is left alone, where Ctrl would have made it a
  non-tent

### Requirement: Controls: A drag between a tree and the square beside it is the link gesture

A left drag between a tree and the square orthogonally beside it, in either
direction, SHALL be the link gesture when that square holds a tent or is
blank. It SHALL join the two, placing a tent on a blank square in the same
move, or part them when they are already joined, and SHALL change no other
square. A left drag that is not the link gesture SHALL act as a click at its
start.

#### Scenario: A drag from a tree to a blank square places its tent joined

- **WHEN** the player left-drags from a tree onto the blank square beside it,
  or from that square onto the tree
- **THEN** the square becomes a tent joined to that tree, in one move

### Requirement: Controls: L and an arrow make the link from the keyboard

`L` on the cursor's tree, tent or blank square, followed by an arrow, SHALL
make the link gesture's move toward that neighbor and take the cursor along.
Any other key SHALL disarm it.

#### Scenario: The keyboard joins with L and an arrow

- **WHEN** the cursor is on a tree, the player presses `L` and then the arrow
  toward the blank square or tent beside it
- **THEN** the same link move is made and the cursor moves onto that square

### Requirement: Hint: A Tents hint step has one premise

Each step of the Tents hint SHALL rest on one premise, a rung of the game's
own solver: grass beside no tree, grass beside trees that all have their
tents, grass round a tent, a tree's one open square, the square between a
tree's two diagonal candidates, a row or column's count over its own squares
(met, or with no spare room), and over the lines beside it. A tree's single
open square SHALL be one step placing the tent joined to that tree.

#### Scenario: Following the hint finishes a board

- **WHEN** a generated board at either tier is played by following the hint's
  steps
- **THEN** the board is completed, and after every step `findMistakes` reports
  nothing

### Requirement: Hint: A Tents hint step rests only on what the player can see

Every fact a step rests on SHALL be a tent, grass, a tree, a clue or a link
the player can see. Before each firing the links SHALL be re-read as the ones
drawn, plus a tent's tree when it is the only tree beside the tent not drawn to
another, or a tree's tent when it is the tree's only square that is blank or an
undrawn tent.

#### Scenario: A step rests on nothing the player cannot see

- **WHEN** any firing of the hint's recording pass is taken
- **THEN** the board it reasons from is the player's board with its links read
  as drawn plus those readable at a glance

### Requirement: Hint: The Tents hint draws a link for a pairing its rungs need

A pairing the rungs need beyond the links read off the board SHALL be a step
that draws the link. The link drawn SHALL be one after which a stalled rung
fires, sought for the square-placing rungs before the line counts are tried,
and then for any rung. Only when no single link lets a rung fire SHALL the
first pending link be drawn anyway.

#### Scenario: A link is drawn only for a step that needs it

- **WHEN** a step draws only a link and the firing after it places a square
- **THEN** that firing could not have fired on the board before the link

### Requirement: Hint: A Tents hint step says why and marks what it uses

Each step SHALL say why it is forced in one sentence. What its ring, its
outline and its stripes stand for SHALL be the legend's (`hintMarks`).

#### Scenario: A line count's picture

- **WHEN** the displayed step counts a row
- **THEN** the row is hatched, its clue is in the action color and the squares
  the step decides are ringed

### Requirement: Hint: A Tents step's links are followed as its squares are

What `hintKeepTrack` judges a move by SHALL be the links it changes as well as
the squares, so a step that places a tent joined to a tree is only partly made
by the tent.

#### Scenario: Placing a tree's tent by a click is progress

- **WHEN** the displayed step places a tent joined to a tree and the player
  places that tent by a click
- **THEN** the step stays displayed and asks only for the link

### Requirement: Hint: A Tents line's remaining tents grass the squares beside it that each placement touches

Where every way of placing a row's or column's remaining tents in its open
squares, no two side by side, puts a tent next to one open square of a line
alongside, even diagonally, a step SHALL mark that square grass ("Wherever
this column's 2 remaining tents go, one touches each of these squares beside
it"). The step SHALL decide no square of the line it counts.

#### Scenario: A column's two tents on a dealt Normal board

- **WHEN** the hint is followed on the 8×8 Normal board
  `hcabb_naambbc,1,2,1,2,2,1,1,2,1,2,1,2,2,0,2,2` from nothing placed
- **THEN** its third step, after the squares beside no tree and the row whose
  number is 0, counts the second column, which needs 2 tents, and marks grass
  the squares to its left and its right in the third row

### Requirement: Hint: The Tents hint tries the squares beside a tree before it counts a line

`hint` SHALL take the first of these that decides something, and begin again
after each: grass beside no tree, or beside trees that all have their tents;
grass round a tent; a tree's one open square; the square between a tree's two
diagonal candidates; a link after which one of those four decides something;
a line's count over its own squares; its count over the lines beside it; a
link after which any of them does, or failing that the first link pending. It
SHALL NOT stop at the board's tier.

#### Scenario: A line is counted when no square beside a tree is decided

- **WHEN** a hint is asked for on the 8×8 Easy board
  `ebachbngeca_a,2,1,2,1,1,1,1,3,3,0,1,2,1,1,2,2` with nothing placed
- **THEN** the first step marks as grass the squares beside no tree
- **AND** the second marks as grass the open squares of the row whose number is
  0, and a step about the squares round a tent comes only once a later count
  has placed one

### Requirement: Look: Tents renders trees, tents, clues and the cursor

`redraw` SHALL render non-blank tiles filled with grass, a tree as a trunk
rectangle plus leaf circles, a tent as a triangle, the grid lines, the edge
numbers on the bottom border for columns and on the right border for rows, and
the keyboard cursor as an outline. The trees and the tents SHALL keep their
own shapes and colors on the quiet surface. The geometry SHALL have a thin
border at the top and left, and room for the numbers at the bottom and right.

#### Scenario: A fresh board is drawn

- **WHEN** a board is drawn for the first time
- **THEN** its grid lines, its trees and its edge numbers below and to the
  right of the grid are painted

### Requirement: Look: Tents draws its squares on the collection's quiet surface

`redraw` SHALL draw a square the player has not decided as the collection's
cell surface, with the collection's surface grid line between squares and
round the grid. A square that is grass, a tree or a tent SHALL keep its grass
fill, so an undecided square and a grass one differ in hue and not by a step of
gray, in both schemes. The clues, a link between a tent and its tree, the
keyboard cursor and the edge of an error diamond SHALL be drawn in ink, not in
the grid's color.

#### Scenario: Undecided and grass are told apart by hue

- **WHEN** a board holds an undecided square beside one marked as grass
- **THEN** the first is the cell surface and the second the grass fill

#### Scenario: A link is ink on a quiet grid

- **WHEN** a tent is linked to its tree
- **THEN** the link is drawn in ink
- **AND** the grid line it crosses is the surface's grid line

### Requirement: Look: The Tents completion flash fills each square and keeps its pieces

A square the completion flash is on SHALL be filled with a flash color in
place of its grass or its plain surface, and SHALL keep its tree or tent and
its link.

#### Scenario: The flash is on a tree

- **WHEN** the completion flash is on a tree's square
- **THEN** the square is filled with a flash color, with its tree drawn on it
