# group Specification

## Purpose
Group, the Latin-square puzzle whose completed grid must be a group's Cayley
table: Latin and associative. It rides on the shared Latin solver and the
shared candidate hint walk, and this spec holds what is Group's own: its tiers
and their associativity and identity deductions, the hidden identity, the
reordering of rows and columns, subgroup dividers, and what its hint teaches.
What it shares with every note-taking game is in `engine-notes`.

## Requirements

### Requirement: Rules: A Group board is solved by a group table

A board SHALL be solved when every cell is filled and the grid is a valid group
Cayley table: Latin and associative.

#### Scenario: A completed valid table wins

- **WHEN** every cell is filled so the grid is Latin and associative
- **THEN** the game is reported solved

### Requirement: Rules: Group's mistake check re-solves from its givens

Group's `findMistakes` SHALL judge the board against the answer it re-solves
from the givens. A mark set that leaves out its cell's answer SHALL be drawn
in the same mistake outline as a wrong entry.

#### Scenario: A wrong element that breaks no rule

- **WHEN** the player enters an element that repeats nothing in its row or
  column, breaks no product as the board stands, and is not the answer's
- **THEN** `findMistakes` includes that cell, though nothing is annotated as an
  error before the check

### Requirement: Params: Group's parameters

Group SHALL be played from its description alone (`described-fill-game`). Its
params SHALL be a grid size (the group's order, 3 to 26), a difficulty and a
ruleset, Identity shown or Identity hidden. An identity-hidden board SHALL be
at least 4×4, because a 3×3 board is never harder than Easy and an Easy board
cannot hide its identity.

#### Scenario: An identity-hidden 3×3 is rejected

- **WHEN** parameters request a 3×3 puzzle with the identity hidden
- **THEN** they are refused with "Identity hidden: the grid size must be at
  least 4."

### Requirement: Params: Hiding the identity leaves every tier but Easy

Identity hidden SHALL take every tier but Easy (the ruleset's `tiers`),
because an identity-hidden board has two blank rows and columns that only a
deduction above Easy can tell apart. Its boards SHALL be dealt from Normal up.

#### Scenario: An identity-hidden Easy deal is refused

- **WHEN** parameters about to deal a board request an identity-hidden Easy
  puzzle
- **THEN** the engine refuses them with "Difficulty must be Normal, Tricky,
  Hard or Unreasonable for Identity hidden."

### Requirement: Params: A size is refused at a tier none of its boards need

When parameters are about to deal a board, a tier no board of the size needs
SHALL be refused, by each ruleset's bounds: Unreasonable below 5×5; Hard
below 6×6; Tricky below 6×6 with the identity shown; Normal below 5×5 with the
identity shown. A 6×6 at Hard with the identity shown is rare and SHALL be
dealt (`engine-difficulty`, "A rare tier is dealt under the deadline"). A
board that arrives with its desc SHALL load at any of them.

#### Scenario: A 5×5 has no Hard board

- **WHEN** parameters about to deal a board request a 5×5 at Hard with the
  identity hidden
- **THEN** they are refused with "No 5x5 Identity hidden puzzle is Hard."

#### Scenario: The refusal says when hiding the identity brings the tier back

- **WHEN** parameters about to deal a board request a 5×5 at Tricky with the
  identity shown
- **THEN** the refusal names 5×5 Identity shown puzzles, and a 5×5 at Tricky
  with the identity hidden is dealt

### Requirement: Params: The identity flag sets how elements are lettered

The letters a board draws and reads SHALL depend on its ruleset: with the
identity shown, the identity element is lettered first, as `e`. The ruleset
SHALL NOT affect the grid description.

#### Scenario: One description, two letterings

- **WHEN** the same grid description is opened with the identity shown and
  with it hidden
- **THEN** the clues are the same elements in both, and only the letters they
  show differ

### Requirement: Params: Group's params are a size, a tier letter and an identity flag

The params encoding SHALL be the size in decimal, then in the full form `d`
and the tier's letter (`t` Easy, `n` Normal, `h` Tricky, `x` Hard, `u`
Unreasonable), then `i` when the identity is hidden. The short form SHALL
leave out the tier and keep the `i`. Decoding SHALL read a string with no `d`
as Normal and one with no `i` as showing the identity.

#### Scenario: A preset that hides its identity

- **WHEN** `8dni` is decoded
- **THEN** it is an 8×8 board at Normal with the identity hidden, and its
  short form is `8i`

#### Scenario: The tier letters are not the tier's initials

- **WHEN** `8dh` is decoded
- **THEN** it is an 8×8 board at Tricky, not Hard, with the identity shown

### Requirement: Description: Group descriptions use the upstream run-length encoding

A Group description SHALL encode the grid in reading order: each clue as a
decimal number from 1 to the grid size, each run of 1 to 26 blank cells as a
single letter `a` to `z` (a longer run split across letters), and an
underscore between two clues that would otherwise abut.

#### Scenario: A generated description round-trips

- **WHEN** `6dn:1_2_3_4_5_6_2e3b6b4d2_5a4b1_6e` is read
- **THEN** its desc is written back byte for byte

### Requirement: Description: A Group description is validated against the grid area

Validation SHALL reject a description whose cell count does not equal the grid
area, as too short for its board or as too long for it, and SHALL reject an
out-of-range number and an unknown character.

#### Scenario: A description of the wrong length is rejected

- **WHEN** a description carrying more or fewer cells than the grid area is
  validated
- **THEN** it is rejected as too long for its board or as too short for it,
  in the collection's sentence for each

### Requirement: Generation: Each Group tier adds its own deductions

Normal SHALL add associativity (with `ab`, `bc` and one bracketing of `abc`
known, the other is placed equal to it) and the filling of the identity's row
and column once the identity is known. Tricky SHALL add ruling an element out
as the identity by a filled product of it that is not the other factor, and
the Latin library's set elimination. Hard SHALL add the library's fish and
wing, and Unreasonable the engine's search, none of them Group's own.

#### Scenario: Associativity is used as a deduction

- **WHEN** a partially-filled board has `ab`, `bc` and `(ab)c` known but `a(bc)`
  blank at Normal or harder
- **THEN** the solver places `a(bc)` equal to `(ab)c`

### Requirement: Generation: A Group board is a group from the data table

Group SHALL deal a board whose solution is a group of the requested order,
drawn from the generators its description ships (upstream group.c's groups of
order 3 to 26) and multiplied out, its elements permuted, with the identity
kept first, and its row and column given, when the identity is shown.

#### Scenario: A generated board is a solvable group table

- **WHEN** a new game is dealt for a legal size and difficulty in either
  ruleset
- **THEN** its one completion is a valid group table

### Requirement: Generation: An identity-hidden board blanks two rows and columns

In identity-hidden mode, generation SHALL blank the identity's row and column
and one further row and column before it removes clues, so the identity cannot
be read directly, and the board SHALL still be solvable at its difficulty
afterward.

#### Scenario: Identity-hidden boards do not reveal the identity

- **WHEN** an identity-hidden board is generated
- **THEN** the identity's row and column, and one further row and column, are
  blank, and the board is still uniquely solvable at its difficulty

### Requirement: Solver: Group's solver accepts only an associative grid

The solver SHALL accept a completed grid only if it is associative.

#### Scenario: A Latin square that is no group

- **WHEN** the solver completes a grid that is Latin and in which the two
  bracketings of one triple differ
- **THEN** it does not accept that grid as a solution

### Requirement: Solver: Group's ladder is its description

Group's solver SHALL run the ladder of `group.description.yaml`: the
associativity, identity and not-the-identity techniques it states and the
Latin library's it places, each at the tier the description gives it, checked
sound against the description's rules, a Latin square whose product is
associative. The search above them stays the engine's.

#### Scenario: Associativity fires as its description states it

- **WHEN** `a·b`, `b·c` and `(a·b)·c` are placed, `a·(b·c)` is open and can
  still hold `(a·b)·c`, at a cap of Normal or above
- **THEN** the solver places `a·(b·c)` equal to `(a·b)·c`, saying the triple
  and the cells of the products it read

#### Scenario: A product that changes a letter rules its partner out

- **WHEN** `j·a` is placed and is not `j`, at a cap of Tricky or above
- **THEN** the solver strikes, for every `k`, the letter `k` from the cells
  `k·a` and `a·k`, in one firing, saying `a` and the least such `j` as its
  witness

### Requirement: Controls: Group selects a cell through the shared note-taking cell

Group SHALL take its selection, entry and notes from the fill board of
numbers (`engine-notes`, "The note-taking cell is one shared mechanic"). A
cell that holds no given SHALL take an entry, and only an empty cell SHALL
take a pencil mark. Group SHALL offer the sticky pencil preference.

#### Scenario: A secondary press on an empty cell

- **WHEN** the player presses the secondary button on an empty cell the
  highlight is not on
- **THEN** that cell is selected for pencil marks

### Requirement: Controls: A diagonal drag fills a whole diagonal at once

A diagonal drag from a selected cell SHALL select the cells from it to the
pointer along that diagonal, and an element entered then SHALL fill every
cell of it as one move. In pencil mode the element SHALL be noted in each
cell of it that lacks it, or struck from all where all hold it. An immutable
cell on the diagonal that already holds the element SHALL be passed over; one
that holds any other element SHALL refuse the whole entry.

#### Scenario: A diagonal multifill sets several cells at once

- **WHEN** a cell is selected and the pointer is dragged diagonally to another
  cell, then an element is entered
- **THEN** every cell along that diagonal holds the element, as one move

#### Scenario: A given of another element lies on the diagonal

- **WHEN** the selected diagonal crosses a given cell holding `b`, and `c` is
  entered
- **THEN** no cell changes and no move is made

#### Scenario: A drag from a cell selected for pencil marks

- **WHEN** pencil mode is on, a diagonal of three cells is selected by a drag,
  one of them already noting `b`, and `b` is entered
- **THEN** `b` is noted in each of the three, as one move, and entering `b`
  again strikes it from all three

### Requirement: Controls: Group's rows and columns reorder, and take subgroup dividers

Group SHALL provide two structural aids. Dragging a row or column header SHALL
reposition that element's entire row and column, so a player can group a
subgroup with its cosets. Dropping a divider between two adjacent elements
SHALL mark a boundary, and the divider SHALL be cleared when those two
elements are dragged apart.

#### Scenario: Reordering rows carries its divider correctly

- **WHEN** a row header is dragged to a new position such that a divider's two
  bordering elements are no longer adjacent
- **THEN** the affected divider is removed

### Requirement: Controls: Shift and an arrow move the cursor's row or column

Shift+Left or Shift+Right SHALL move the element of the cursor's column one
place along the order, and Shift+Up or Shift+Down the element of its row,
making the same move as dragging that heading one place. The cursor SHALL stay
on its element. On a hidden cursor the first such press SHALL only show it.

#### Scenario: Shift+Right moves a column as dragging its heading does

- **WHEN** the cursor shows on a column and the player presses Shift+Right
- **THEN** the move is the one dragging that column's heading one column right makes

#### Scenario: A hidden cursor is shown first

- **WHEN** the cursor is hidden and the player presses Shift+Right
- **THEN** the cursor shows and the table's order is unchanged

### Requirement: Controls: Two keys toggle the subgroup line beside the cursor

`|` SHALL toggle the subgroup line after the cursor's column, and `-` the line
below its row, making the same move as clicking between the two headings. At
the last column or row there is no line, and the key SHALL do nothing.

#### Scenario: `|` toggles the line a click between headings toggles

- **WHEN** the cursor shows on a column and the player presses `|`
- **THEN** the move is the one clicking between that column's heading and the next makes

#### Scenario: The last column has no line

- **WHEN** the cursor shows on the last column and the player presses `|`
- **THEN** no move is made

### Requirement: Controls: Backspace, Space and Clear empty the selected Group cells

Backspace, Space and the keypad's Clear SHALL empty the selected cells of
their letter and of their pencil marks, as one move. In pencil mode they SHALL
leave a cell that holds a letter as it is, and in either mode a given.

#### Scenario: Space on a cell that holds only marks

- **WHEN** an empty cell with pencil marks is selected and Space is pressed
- **THEN** the cell's marks are gone, and one undo brings them back

### Requirement: Controls: A letter key enters its element

A letter key, capital or small, SHALL enter the element it letters in the
selected cells, or toggle that element's pencil mark in pencil mode; a letter
no element of the board has SHALL be declined. The keypad SHALL offer a key
for each element, in the order of their numbers, then Clear.

#### Scenario: The keypad of a board that shows its identity

- **WHEN** the keypad is asked for under `6dt`
- **THEN** its keys are `e`, `a`, `b`, `c`, `d`, `f` and Clear

#### Scenario: A letter the board has no element for

- **WHEN** `k` is pressed with a cell selected on a 6×6 board
- **THEN** no move is made

### Requirement: Hint: Group's own placements lead the eliminations

Group's hint SHALL be the fill board's candidate walk on the player's notes
(`engine-candidate-hints`). Its associativity and identity techniques SHALL
lead, offered wherever the board supports them from the note-free opening on,
beside the singles the board shows. Group SHALL start on the implicit
reading (`play.hintNotes`), which has no populate step.

#### Scenario: Associativity is taught before any note is needed

- **WHEN** a hint is requested on a board with no notes where `a·b`, `b·c` and
  `(a·b)·c` are filled but `a·(b·c)` is not
- **THEN** the plan's first step is a placement, and no note is written
  before it

### Requirement: Hint: Group's hint uses no deduction above the board's tier

`hint` SHALL use no deduction above the board's own tier, and on an
Unreasonable board none above Hard.

#### Scenario: A Normal board's hint

- **WHEN** a hint is asked for on a board of the Normal tier
- **THEN** no step of its plan is a deduction only Tricky or Hard adds

### Requirement: Hint: The hint teaches Group's three deductions

An associativity placement SHALL place the fourth product: the player has
filled `a·b`, `b·c` and one bracketing of `a·b·c`, which forces the other. An
identity fill SHALL fill the identity's row and column with the element
labels once a filled `a·b = a` reveals `b` as the identity. An identity-mark
elimination (identity hidden) SHALL strike the identity marks of an element
that a filled product shows is not the identity, naming the first of `o·a`
and `a·o` that shows it.

#### Scenario: Associativity forces a placement and the hint teaches why

- **WHEN** the player asks for a hint on a board where `a·b`, `b·c` and `(a·b)·c`
  are filled but `a·(b·c)` is not
- **THEN** the hint places `a·(b·c)` at the value of `(a·b)·c`
- **AND** the narration names the three known products and states that
  `(a·b)·c = a·(b·c)` forces the fourth
- **AND** the three known-product cells are outlined as evidence and the target
  cell is ringed in the hint color

#### Scenario: Identity-hidden mode rules out an identity mark

- **WHEN** a hint is requested on an identity-hidden board where a filled
  product of `a` with `b` is not `b`
- **THEN** the hint strikes the identity marks of `a`, narrated from that
  product: it is not `b`, as it would be if `a` were the identity

### Requirement: Hint: A Group hint names cells by their letters and associativity by its triple

A step's narration SHALL refer to each cell by the element letter it shows.
The associativity step SHALL state the actual triple and the three known
products that force the fourth, teaching the technique and not merely pointing
at the cell.

#### Scenario: The associativity step names its triple

- **WHEN** an associativity step is shown
- **THEN** its narration gives the three products as equations in the letters
  the board shows, and says the other bracketing must be the same element

### Requirement: Hint: Learning the identity fills its row and column as one journey

Learning the identity forces every empty cell of its row and column at once.
Those placements SHALL be one journey, its continuation legs flagged
`continuesPrevious`, and never separate hints.

#### Scenario: The identity's row and column are filled as one journey

- **WHEN** the hint has just learned which element is the identity (from a filled
  `a·b = a`)
- **THEN** the placements filling the identity's row and column are emitted as a
  single multi-leg journey (continuation legs flagged `continuesPrevious`), not as
  separate hints

### Requirement: Look: Group draws its legend, marks and errors

Rendering SHALL draw the element legend along the top and left, lay out pencil
marks in a grid, and annotate Latin duplicates and associativity failures in
the error color.

#### Scenario: A broken product is annotated

- **WHEN** four filled cells make `(ab)c` and `a(bc)` differ
- **THEN** the two cells holding them are annotated with the triple in the
  error color

### Requirement: Look: Group draws its table on a quiet surface, with a given's cell lifted

The fill board SHALL draw every cell of the table the player fills on the
collection's cell surface, and every cell holding a given element on the
collection's lifted surface of a given. The labels SHALL stay on the board,
outside the surface.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with given elements is drawn
- **THEN** each given's cell is the lifted surface
- **AND** every other cell of the table is the cell surface

### Requirement: Look: Only a subgroup divider is drawn in ink

The line between cells and the frame round the table SHALL be the collection's
surface grid line, the frame no heavier than the line. A subgroup divider is
the player's own mark: it SHALL be drawn as an edge and SHALL stay in ink.

#### Scenario: Only a divider is heavy

- **WHEN** a board with one subgroup divider is drawn
- **THEN** the divider is ink
- **AND** every other line of the table, and its frame, is the surface grid
  line

### Requirement: Look: The leading diagonal is a stroke, not a shade

The leading diagonal, in the order the player gives the lines, SHALL be drawn
as a stroke in the grid line's color from corner to corner of each cell on it,
under the cell's element and pencil marks (`play.leadingDiagonal`), and SHALL
NOT be told by a shade of the cell's surface.

#### Scenario: A diagonal cell keeps its surface

- **WHEN** a given and a cell the player fills both lie on the leading
  diagonal of a 4×4 board
- **THEN** the given's cell is the lifted surface and the other the cell
  surface, and each of the four diagonal squares has the stroke under its
  content

### Requirement: Look: With the identity shown, number 1 is lettered e

With the identity shown, the number 1 of a description SHALL be lettered `e`,
the numbers 2 to 5 `a` to `d`, and each number above 5 by its place in the
alphabet. With the identity hidden every number SHALL be lettered by its place
in the alphabet. A letter the player types SHALL be read back the same way.

#### Scenario: The top row of a dealt board

- **WHEN** `1_2_3_4_5_6_2a6a3a3d5_4a1b2_5_3b1a6e` is opened under `6dt`
- **THEN** its top row, the numbers 1 to 6, reads `e a b c d f`
- **AND** the same six numbers on a board that hides its identity read
  `a b c d e f`

#### Scenario: A 3×3 board has no c

- **WHEN** a 3×3 board that shows its identity is opened
- **THEN** its three elements are lettered `e`, `a` and `b`

### Requirement: Look: Group draws where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each element that repeats in its row or column. For each product
the board breaks (`Game.rules`), where `(ab)c` and `a(bc)` are both filled and
differ, it SHALL annotate the `(ab)c` square with `(ab)c` above its element
and the `a(bc)` square with `a(bc)` below it, one failure to a square's side.

#### Scenario: A failed product is annotated on both sides

- **WHEN** the player fills `ab`, `bc`, `(ab)c` and `a(bc)` so the last two
  differ
- **THEN** the `(ab)c` square reads `(ab)c` and the `a(bc)` square reads
  `a(bc)`, each in the elements' letters
