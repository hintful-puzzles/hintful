# group Specification

## Purpose
Group, the Latin-square puzzle whose completed grid must be a group's Cayley
table: Latin and associative. It rides on the shared Latin solver and the
shared candidate hint walk, and this spec holds what is Group's own: its tiers
and their associativity and identity deductions, the hidden identity, the
reordering of rows and columns, subgroup dividers, what its hint teaches, and
that Check & Save flags pencil marks that have crossed out the answer.

## Requirements

### Requirement: A Group board is solved by a group table

A board SHALL be solved when every cell is filled and the grid is a valid group
Cayley table: Latin and associative. Because a board has one solution, Group
SHALL provide `findMistakes`, so Check & Save applies.

#### Scenario: A completed valid table wins

- **WHEN** every cell is filled so the grid is Latin and associative
- **THEN** the game is reported solved and flashes

### Requirement: Group's parameters

Group SHALL accept a grid size (the group's order) between 3 and 26, a
difficulty of Easy, Normal, Tricky, Hard or Unreasonable, and a "show
identity" flag. `validateParams` SHALL reject an identity-hidden 3×3 puzzle
with a reason, because a 3×3 board is never harder than Easy and an Easy board
cannot hide its identity.

#### Scenario: An identity-hidden 3×3 is rejected

- **WHEN** parameters request a 3×3 puzzle with the identity hidden
- **THEN** `validateParams` rejects them with a reason

### Requirement: Hiding the identity leaves every tier but Easy

Group SHALL declare that hiding the identity leaves every tier but Easy (the
modifier's `only`), because an identity-hidden board has two blank rows and
columns that only a deduction above Easy can tell apart.

#### Scenario: An identity-hidden Easy deal is refused

- **WHEN** parameters about to deal a board request an identity-hidden Easy
  puzzle
- **THEN** the engine refuses them with a reason

### Requirement: A size is refused at a tier none of its boards need

When parameters are about to deal a board, `validateParams` SHALL refuse a
tier no board of the size needs, and SHALL NOT deal an easier board in its
place: Unreasonable below 5×5; Hard below 6×6; Tricky below 4×4, and below 6×6
with the identity shown; Normal below 4×4, and at 4×4 with the identity shown.
It SHALL refuse a 6×6 at Hard with the identity shown as too rare to deal.

#### Scenario: A 5×5 has no Hard board

- **WHEN** parameters about to deal a board request a 5×5 at Hard
- **THEN** `validateParams` refuses them, saying no such puzzle is Hard

#### Scenario: The refusal says when hiding the identity brings the tier back

- **WHEN** parameters about to deal a board request a 5×5 at Tricky with the
  identity shown
- **THEN** the refusal names 5×5 puzzles that show their identity

### Requirement: The identity flag sets how elements are lettered

The element numbering used for display and keyboard input SHALL depend on the
"show identity" flag: with the identity shown, the identity element is
presented first. The flag SHALL affect the solution encoding and the on-screen
labels, and SHALL NOT affect the grid description.

#### Scenario: One description, two letterings

- **WHEN** the same grid description is opened with the identity shown and
  with it hidden
- **THEN** the clues are the same elements in both, and only the letters they
  show differ

### Requirement: Group descriptions use the upstream run-length encoding

A Group description SHALL encode the grid in reading order: each clue as a
decimal number from 1 to the grid size, each run of 1 to 26 blank cells as a
single letter `a` to `z` (a longer run split across letters), and an
underscore between two clues that would otherwise abut. The solution SHALL be
encoded separately, in the identity-dependent element letters and not in
decimal numbers.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded
- **THEN** the resulting clues are identical, and re-encoding yields the same
  description

### Requirement: A Group description is validated against the grid area

Validation SHALL reject a description whose cell count does not equal the grid
area, telling "not enough data" from "too much", and SHALL reject an
out-of-range number and an unknown character.

#### Scenario: A description of the wrong length is rejected

- **WHEN** a description carrying more or fewer cells than the grid area is
  validated
- **THEN** it is rejected with a message distinguishing which

### Requirement: Group's solver has five tiers and no technique beyond them

A completed grid SHALL be accepted only if it is associative. The solver SHALL
NOT have a tier beyond its five, and SHALL NOT implement an inverse-based, a
hard-mode-associativity or an element-order technique: the difficulty grading
depends on their absence.

#### Scenario: The solver grades a board at the intended difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** it is solvable at that difficulty and not at the tier below

### Requirement: Each Group tier adds its own deductions

Normal SHALL add associativity (with `ab`, `bc` and one bracketing of `abc`
known, the other is placed equal to it) and the filling of the identity's row
and column once the identity is known. Tricky SHALL add ruling an element out
as the identity by a filled product of it that is not the other factor, and
the generic set elimination. Hard SHALL add the harder set elimination and
forcing, and Unreasonable the generic guess-and-verify recursion, neither with
a Group-specific technique.

#### Scenario: Associativity is used as a deduction

- **WHEN** a partially-filled board has `ab`, `bc` and `(ab)c` known but `a(bc)`
  blank at Normal or harder
- **THEN** the solver places `a(bc)` equal to `(ab)c`

### Requirement: A Group board is a group from the data table

Group SHALL deal a board whose solution is a group of the requested order
taken from the transcribed group data table, its elements permuted, with the
identity kept in place when the identity is shown. Its clues SHALL admit
exactly one completion, at the requested difficulty.

#### Scenario: A generated board is a solvable group table

- **WHEN** a new game is generated for a legal size and difficulty in either
  identity mode
- **THEN** its clues admit exactly one completion, that completion is a valid
  group table, and the solver grades it at the requested difficulty

### Requirement: An identity-hidden board blanks two rows and columns

In identity-hidden mode, generation SHALL blank the identity's row and column
and one further row and column before it removes clues, so the identity cannot
be read directly, and the board SHALL still be solvable at its difficulty
afterward.

#### Scenario: Identity-hidden boards do not reveal the identity

- **WHEN** an identity-hidden board is generated
- **THEN** the identity's row and column, and one further row and column, are
  blank, and the board is still uniquely solvable at its difficulty

### Requirement: A diagonal drag fills a whole diagonal at once

A diagonal drag from a cell selected for entry SHALL extend the selection
along that diagonal, and an element entered then SHALL fill every cell of it
at once. With pencil mode on a drag SHALL select no run, and a mark goes in
the one cell. Filling a cell SHALL be idempotent. An immutable cell on the
diagonal that already holds the element SHALL be part of the move and left as
it was; one that holds any other element SHALL refuse the whole entry.

#### Scenario: A diagonal multifill sets several cells at once

- **WHEN** a cell is selected and the pointer is dragged diagonally to another
  cell, then an element is entered
- **THEN** every cell along that diagonal holds the element, an immutable cell
  that already held it included

#### Scenario: A given of another element lies on the diagonal

- **WHEN** the selected diagonal crosses a given cell holding `b`, and `c` is
  entered
- **THEN** no cell changes and no move is made

#### Scenario: A drag from a cell selected for pencil marks

- **WHEN** a cell is selected with the right button and the pointer is dragged
  diagonally, then an element is entered
- **THEN** only the selected cell takes the mark

### Requirement: Group's rows and columns reorder, and take subgroup dividers

Group SHALL provide two structural aids. Dragging a row or column header SHALL
reposition that element's entire row and column, so a player can group a
subgroup with its cosets. Dropping a divider between two adjacent elements
SHALL mark a boundary, and the divider SHALL be cleared when those two
elements are dragged apart.

#### Scenario: Reordering rows carries its divider correctly

- **WHEN** a row header is dragged to a new position such that a divider's two
  bordering elements are no longer adjacent
- **THEN** the affected divider is removed

### Requirement: Shift and an arrow move the cursor's row or column

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

### Requirement: Two keys toggle the subgroup line beside the cursor

`|` SHALL toggle the subgroup line after the cursor's column, and `-` the line
below its row, making the same move as clicking between the two headings. At
the last column or row there is no line, and the key SHALL do nothing.

#### Scenario: `|` toggles the line a click between headings toggles

- **WHEN** the cursor shows on a column and the player presses `|`
- **THEN** the move is the one clicking between that column's heading and the next makes

#### Scenario: The last column has no line

- **WHEN** the cursor shows on the last column and the player presses `|`
- **THEN** no move is made

### Requirement: Group draws its legend, marks and errors

Rendering SHALL draw the element legend along the top and left, lay out pencil
marks in a grid, highlight the selection, annotate Latin duplicates and
associativity failures in the error color, and flash on completion.

#### Scenario: A broken product is annotated

- **WHEN** four filled cells make `(ab)c` and `a(bc)` differ
- **THEN** the two cells holding them are annotated with the triple in the
  error color

### Requirement: Group draws its table on a quiet surface, with a given's cell lifted

`redraw` SHALL draw every cell of the table the player fills on the
collection's cell surface, and every cell holding a given element on the
collection's lifted surface of a given, so that a given is told by the cell
under it as well as by its ink. The legend SHALL stay on the board, outside
the surface. The selection's wash and its pencil-mode corner SHALL be drawn
over whichever surface the cell has.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with given elements is drawn
- **THEN** each given's cell is the lifted surface
- **AND** every other cell of the table is the cell surface

### Requirement: Only a subgroup divider is drawn in ink

The line between cells and the frame round the table SHALL be the collection's
surface grid line, the frame no heavier than the line. A subgroup divider is
the player's own mark: it SHALL be drawn as an edge and SHALL stay in ink.

#### Scenario: Only a divider is heavy

- **WHEN** a board with one subgroup divider is drawn
- **THEN** the divider is ink
- **AND** every other line of the table, and its frame, is the surface grid
  line

### Requirement: The leading diagonal is a stroke, not a shade

The leading diagonal SHALL be drawn as a stroke in the surface grid line's
color from corner to corner of each cell on it, under the cell's element and
pencil marks, and SHALL NOT be told by a shade of the cell's surface.

#### Scenario: A diagonal cell keeps its surface

- **WHEN** a given and a cell the player fills both lie on the leading diagonal
- **THEN** the given's cell is the lifted surface and the other the cell
  surface, each with the stroke under its content

### Requirement: Group's hint deduces from the placed entries, never the notes

The hint's plan SHALL be deduced over a sound candidate cube seeded from the
placed entries only and never from the player's pencil notes: a note can be
wrong, which is what `findMistakes` flags.

#### Scenario: A wrong note does not steer the deduction

- **WHEN** the solver records its deductions for a hint on a board whose empty
  cells carry notes
- **THEN** the deductions recorded are the ones it records for the same placed
  entries with no notes

### Requirement: Group's own placements lead the eliminations

The plan SHALL prefer a naked single, placed by a `set` move: an empty cell
whose notes have collapsed to one candidate. Next SHALL come an associativity
placement or an identity fill wherever the board shows its premise, and, until
the notes are set up, any single the board shows. Then SHALL come the
eliminations, and last a forced generic placement. Group SHALL start on the
implicit reading, which has no populate step.

#### Scenario: Associativity is taught before any note is needed

- **WHEN** a hint is requested on a board with no notes where `a·b`, `b·c` and
  `(a·b)·c` are filled but `a·(b·c)` is not
- **THEN** the plan's first step is a placement, and no note is written
  before it

### Requirement: The hint teaches Group's three deductions

An associativity placement SHALL place the fourth product by a `set` move: the
player has filled `a·b`, `b·c` and one bracketing of `a·b·c`, which forces the
other. An identity fill SHALL fill the identity's row and column with the
element labels once a filled `a·b = a` reveals `b` as the identity. An
identity-mark elimination (identity-hidden mode) SHALL strike, by a
`pencilStrike` move, the identity marks of an element that a filled product
shows is not the identity.

#### Scenario: Associativity forces a placement and the hint teaches why

- **WHEN** the player asks for a hint on a board where `a·b`, `b·c` and `(a·b)·c`
  are filled but `a·(b·c)` is not
- **THEN** the hint returns a `set` step placing `a·(b·c)` to the value of
  `(a·b)·c`
- **AND** the narration names the three known products and states that
  `(a·b)·c = a·(b·c)` forces the fourth
- **AND** the three known-product cells are outlined as evidence and the target
  cell is ringed in the hint color

#### Scenario: Identity-hidden mode rules out an identity mark

- **WHEN** a hint is requested on an identity-hidden board where a filled
  product of `a` with `b` is not `b`
- **THEN** the hint returns a `pencilStrike` step striking the identity marks
  of `a`, narrated from that product: it is not `b`, as it would be if `a`
  were the identity

### Requirement: A Group hint names cells by their letters and associativity by its triple

A step's narration SHALL refer to each cell by the element letter it shows.
The associativity step SHALL state the actual triple and the three known
products that force the fourth, teaching the technique and not merely pointing
at the cell.

#### Scenario: The associativity step names its triple

- **WHEN** an associativity step is shown
- **THEN** its narration gives the three products as equations in the letters
  the board shows, and says the other bracketing must be the same element

### Requirement: Learning the identity fills its row and column as one journey

Learning the identity forces every empty cell of its row and column at once.
Those placements SHALL be one journey, its continuation legs flagged
`continuesPrevious`, and never separate hints.

#### Scenario: The identity's row and column are filled as one journey

- **WHEN** the hint has just learned which element is the identity (from a filled
  `a·b = a`)
- **THEN** the placements filling the identity's row and column are emitted as a
  single multi-leg journey (continuation legs flagged `continuesPrevious`), not as
  separate hints

### Requirement: Group's Check & Save flags pencil marks that have crossed out the answer

Group's `findMistakes` SHALL report, beside every entry that contradicts the
unique solution, every empty cell whose non-empty pencil marks leave out that
cell's solution element, as a `note` mistake drawn in the same mistake
outline. Marks that include the answer beside other candidates SHALL NOT be
reported. Because the hint reasons from the marks, it SHALL refuse while such
a mark set stands.

#### Scenario: Marks without the answer are a mistake and the hint refuses

- **WHEN** an empty cell's pencil marks hold only elements other than its solution
- **THEN** `findMistakes` reports that cell as a `note` mistake, and a hint request
  refuses asking the player to fix the highlighted mistakes first

#### Scenario: Extra candidates beside the answer are not a mistake

- **WHEN** an empty cell's pencil marks hold its solution element and others
- **THEN** `findMistakes` reports nothing for that cell
