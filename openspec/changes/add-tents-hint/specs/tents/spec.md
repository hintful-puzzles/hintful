## MODIFIED Requirements

### Requirement: Tents input maps drag gestures, cursor and direct keys

`interpretMove` SHALL implement the upstream drag model: pressing the left or
right button starts a one-cell drag; dragging extends it along the single
nearer row or column; releasing enacts it. A left click sets a blank square
to a tent or clears a non-blank square; a right click sets a blank to a
non-tent or clears a non-blank; a right-drag sets every blank square it
covers to a non-tent. Trees are never modified. Arrow keys SHALL move a
cursor (revealing it first), select/select2 SHALL set the cursor square to a
tent/non-tent (or clear it), and the literal keys `T`/`N`/`B` SHALL set it
directly. A gesture producing no change SHALL return no move.

A left drag between a tree and the square orthogonally beside it, in either
direction, SHALL be the link gesture when that square holds a tent or is
blank: it joins the two, placing a tent on a blank square in the same move, or
parts them when they are already joined, and it changes no other square. `L`
on the cursor's tree, tent or blank square, followed by an arrow, SHALL make
the same move toward that neighbor and take the cursor along; any other key
disarms it. A left drag that is not the link gesture keeps upstream's meaning,
a click at its start.

#### Scenario: A left click toggles a tent

- **WHEN** a blank square is left-clicked, then left-clicked again
- **THEN** the square becomes a tent, then blank

#### Scenario: A right-drag paints non-tents

- **WHEN** the right button is dragged across a row of blank squares
- **THEN** every covered blank square becomes a non-tent

#### Scenario: A drag from a tree to a blank square places its tent joined

- **WHEN** the player left-drags from a tree onto the blank square beside it,
  or from that square onto the tree
- **THEN** the square becomes a tent joined to that tree, in one move

#### Scenario: The keyboard joins with L and an arrow

- **WHEN** the cursor is on a tree, the player presses `L` and then the arrow
  toward the blank square or tent beside it
- **THEN** the same link move is made and the cursor moves onto that square

### Requirement: Tents ships findMistakes

`findMistakes(state)` SHALL re-solve the board's trees and edge numbers with
the top-difficulty solver and, when a unique solution exists, return one
mistake per placed square that contradicts it — a tent where the solution has
none, or a non-tent where the solution has a tent (blank squares are never
mistakes) — rendered with a distinct inset red overlay; it SHALL return an
empty list when the board is not uniquely solvable. It SHALL also return every
link that no pairing of the solution's tents with its trees can hold together
with the links before it in reading order, rendered in the mistake color: the
solution's tents are unique but its pairing need not be.

#### Scenario: A wrong tent blocks Check & Save

- **WHEN** a tent is placed where the unique solution has none and
  `findMistakes` runs
- **THEN** exactly that square is reported and rendered with the mistake
  overlay

#### Scenario: Blank squares are not mistakes

- **WHEN** the board holds only correct tents and non-tents plus blanks
- **THEN** `findMistakes` returns an empty list

#### Scenario: A link no pairing holds is a mistake

- **WHEN** the player joins a correct tent to a tree that no pairing of the
  solution gives it, and `findMistakes` runs
- **THEN** that link is reported and drawn in the mistake color

## ADDED Requirements

### Requirement: Tents has a link notation

The state SHALL record, per square, the tree or tent it is joined to, only
ever between a tent and an orthogonally adjacent tree and always at both ends.
A link move SHALL set rather than toggle. A square that stops being a tent
SHALL let go of its tree, and a solve SHALL clear every link. The win condition
SHALL NOT read links. `redraw` SHALL draw a link as a thin ink line across the
shared grid line, in a shape and color distinct from a tree's trunk.

#### Scenario: Removing a tent parts its link

- **WHEN** a joined tent is cleared or marked as grass
- **THEN** neither it nor its tree is joined to anything

### Requirement: Tents explains the next deduction

The game SHALL implement `hint` as a recording projection of its own solver
rungs, one premise per step: grass beside no tree, grass beside trees that all
have their tents, grass round a tent, a tree's one open square, the square
between a tree's two diagonal candidates, a row or column's count over its own
squares (met, or with no spare room), and over the lines beside it. Every fact
a step rests on SHALL be a tent, grass, a tree, a clue or a link the player can
see: before each firing the links SHALL be re-read as the ones drawn, plus a
tent's tree when it is the only tree beside the tent not drawn to another, or a
tree's tent when it is the tree's only square that is blank or an undrawn tent.
A pairing the rungs need beyond that SHALL be a step that draws the link, taken
only when some stalled rung fires once it is drawn, the square-placing rungs
before the line counts. A tree's single open square SHALL be one step placing
the tent joined to that tree. Each step SHALL name why it is forced, in one
sentence of at most 120 characters, ring what it decides, outline what it
reasons from, hatch the row or column it counts with, color that clue in the
action color, and draw a link it asks for in the action color. The hint SHALL
refuse on a solved board and while `findMistakes` reports anything.
`hintKeepTrack` SHALL judge a move by the squares and links it changes, holding
a step that is only partly made and shrinking it to what is left.

#### Scenario: Following the hint finishes a board

- **WHEN** a generated board at either tier is played by following the hint's
  steps
- **THEN** the board is completed, and after every step `findMistakes` reports
  nothing

#### Scenario: A step rests on nothing the player cannot see

- **WHEN** any firing of the hint's recording pass is taken
- **THEN** the board it reasons from is the player's board with its links read
  as drawn plus those readable at a glance

#### Scenario: A link is drawn only for a step that needs it

- **WHEN** a step draws only a link
- **THEN** the next firing could not have fired on the board before it

#### Scenario: Placing a tree's tent by a click is progress

- **WHEN** the displayed step places a tent joined to a tree and the player
  places that tent by a click
- **THEN** the step stays displayed and asks only for the link
