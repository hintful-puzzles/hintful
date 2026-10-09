# group Specification

## Purpose
Group, the Latin-square puzzle whose completed grid must be a group's Cayley
table: Latin and associative. It rides on the shared Latin solver and adds its
own associativity and identity deductions, the reordering of rows and columns,
subgroup dividers, an explained hint and Check & Save.

## Requirements

### Requirement: Group game implements the Game interface

The engine SHALL provide `src/games/group/` implementing the `Game` interface
for Group, registered so the puzzle is served by the TypeScript engine. A
board SHALL be solved when every cell is filled and the grid is a valid group
Cayley table: Latin and associative. Because a board has one solution, Group
SHALL provide `findMistakes`, so Check & Save applies.

#### Scenario: A generated board is a solvable group table

- **WHEN** a new game is generated for a legal size and difficulty in either
  identity mode
- **THEN** its clues admit exactly one completion, that completion is a valid
  group table, and the solver grades it at the requested difficulty

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
columns that only a deduction above Easy can tell apart. The engine SHALL
build the refusal of an identity-hidden Easy deal from that declaration. A
board that arrives already written SHALL NOT be held to it, since nothing
reads its tier.

#### Scenario: An identity-hidden Easy deal is refused

- **WHEN** parameters about to deal a board request an identity-hidden Easy
  puzzle
- **THEN** the engine refuses them with a reason

#### Scenario: The Custom dialog hides the identity with Easy chosen

- **WHEN** the player unticks "Show identity" while Easy is chosen
- **THEN** Easy is disabled and the difficulty shows Normal, and OK deals a
  board with no refusal

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

### Requirement: Group ports the graded group-axiom solver over the shared Latin solver

Group SHALL solve using the shared `src/engine/latin.ts` engine, supplying
only its group-specific deductions and its validator. A completed grid SHALL
be accepted only if it is associative. The solver SHALL NOT have a tier beyond
its five, and SHALL NOT implement an inverse-based, a hard-mode-associativity
or an element-order technique: the difficulty grading depends on their
absence.

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

### Requirement: Group generation from the group data table

Group SHALL generate a board by selecting a group of the requested order from
the transcribed group data table, decompressing its generators into the full
Cayley table by breadth-first search, permuting its elements (fixing the
identity in place when the identity is shown), then removing clues one at a
time while the board stays uniquely solvable at the requested difficulty.
Generation SHALL reject a board that is solvable one tier below the target.

#### Scenario: A board is never a tier too easy

- **WHEN** a board is generated above Easy
- **THEN** the solver capped one tier below the requested difficulty does not
  solve it

### Requirement: An identity-hidden board blanks two rows and columns

In identity-hidden mode, generation SHALL blank the identity's row and column
and one further row and column before it removes clues, so the identity cannot
be read directly, and SHALL check that the board is still solvable at its
difficulty afterward, starting again when it is not.

#### Scenario: Identity-hidden boards do not reveal the identity

- **WHEN** an identity-hidden board is generated
- **THEN** the identity's row and column, and one further row and column, are
  blank, and the board is still uniquely solvable at its difficulty

### Requirement: Group fills a cell from a selection

Group SHALL be played with mouse and keyboard: selecting a cell and typing an
element's letter fills it, and a right-click selects a cell for pencil marks.
Filling a cell SHALL be idempotent. Setting an immutable cell to the value it
already holds SHALL be permitted, so a multifill need not detour around it.

#### Scenario: Typing the letter a cell already holds

- **WHEN** a selected cell holds an element and the player types that
  element's letter
- **THEN** the cell still holds it

### Requirement: A diagonal drag fills a whole diagonal at once

A diagonal drag from a selected cell SHALL extend the selection along that
diagonal, and an element entered then SHALL fill every cell of it at once.

#### Scenario: A diagonal multifill sets several cells at once

- **WHEN** a cell is selected and the pointer is dragged diagonally to another
  cell, then an element is entered
- **THEN** every cell along that diagonal is set to the element, skipping any
  immutable cell that already holds it

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

### Requirement: Group's table order and subgroup lines have keyboard routes

Every change Group's pointer makes to the table's arrangement SHALL also be
reachable by the keyboard alone, each making the same move as its pointer
route.

#### Scenario: The keyboard and the pointer make one move

- **WHEN** the cursor shows on a column and the player presses Shift+Right
- **THEN** the move is the one dragging that column's heading one column right
  makes

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
the surface.

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

### Requirement: The selection and the hint keep clear of a cell's surface

The selection's wash and its pencil-mode corner SHALL be drawn over whichever
surface the cell has. The hint's marks SHALL stay at the cell's edge.

#### Scenario: A hint rings a cell

- **WHEN** a hint step acts on a cell
- **THEN** its ring is drawn on the cell's border, and the cell's element or
  pencil marks are not painted over

### Requirement: Group provides an explained deduction hint

The game SHALL implement `hint(state, aux?, ui?)`, returning a plan of
`HintStep`s that teaches the player the next deduction. The plan SHALL be
built by walking a working copy of the board the way a person solves it, over
a sound candidate cube seeded from the placed entries only and never from the
player's pencil notes: a note can be wrong, which is what `findMistakes`
flags.

#### Scenario: A wrong note does not steer the deduction

- **WHEN** the solver records its deductions for a hint on a board whose empty
  cells carry notes
- **THEN** the deductions recorded are the ones it records for the same placed
  entries with no notes

### Requirement: Group's own placements lead the eliminations

The plan SHALL prefer a naked single, placed by a `set` move: an empty cell
whose notes have collapsed to one candidate. Next SHALL come an associativity placement or an identity
fill wherever the board shows its premise, and, until the notes are set up,
any single the board shows. Then SHALL come the eliminations, and last a
forced generic placement.

#### Scenario: Associativity is taught before any note is needed

- **WHEN** a hint is requested on a board with no notes where `a·b`, `b·c` and
  `(a·b)·c` are filled but `a·(b·c)` is not
- **THEN** the plan's first step is a placement, and no note is written
  before it

### Requirement: Notes are penciled in only when an elimination needs them

Under the populate reading, a populate step SHALL fill every empty cell's
candidate notes by the `pencilAll` move, and SHALL be emitted only when some
empty cell lacks notes. Group SHALL start on the
implicit reading, which has no populate step. Each placement SHALL teach the
row and column eliminations its value implies, struck by a `pencilStrike`
move.

#### Scenario: A placement teaches its cull

- **WHEN** a hint places an element in a cell whose row or column holds notes
  of that element
- **THEN** a strike of those notes continues the placement's journey

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

### Requirement: A generic placement says whether it is naked or hidden

A forced generic placement SHALL be narrated and highlighted by which it is: a
naked single (the cell's own candidates collapsed to one) or a hidden single
(a value that fits only one cell of a row or column, the cell still showing
several candidates). The recorded reason does not tell them apart, so the
reason SHALL be re-derived from the working board.

#### Scenario: A hidden single names its line

- **WHEN** the hint places a value that fits only one cell of a row, in a cell
  that still shows several candidates
- **THEN** the step is narrated as a hidden single in that row, and not as a
  naked single

### Requirement: A Group hint's narration explains why

Each step SHALL carry a narration meeting the hint quality bar: it leads with
the spotted indication, then the reasoning, then a conclusion in the voice of
necessity. It SHALL refer to each cell by the element letter it shows. The
associativity step SHALL state the actual triple and the three known products
that force the fourth, teaching the technique and not merely pointing at the
cell.

#### Scenario: The associativity step names its triple

- **WHEN** an associativity step is shown
- **THEN** its narration gives the three products as equations in the letters
  the board shows, and says the other bracketing must be the same element

### Requirement: One firing of a deduction is one journey

A single firing that forces several cells (the identity fill) SHALL be one
journey, its continuation legs flagged `continuesPrevious`, and equivalent
placements of one firing SHALL share the target hint color. One recorded
firing SHALL map to exactly one `group`, so a hint step never mixes
deductions.

#### Scenario: The identity's row and column are filled as one journey

- **WHEN** the hint has just learned which element is the identity (from a filled
  `a·b = a`)
- **THEN** the placements filling the identity's row and column are emitted as a
  single multi-leg journey (continuation legs flagged `continuesPrevious`), not as
  separate hints

### Requirement: A Group hint is refused on a solved or mistaken board

A hint SHALL be refused when the board is solved or when `findMistakes` is
non-empty, by the midend before it asks the game, and the mistakes refusal
SHALL light the mistake overlay.

#### Scenario: The hint refuses on a board with mistakes

- **WHEN** a hint is requested while `findMistakes` is non-empty
- **THEN** the hint refuses and the engine lights the mistake overlay

### Requirement: The hint never teaches a guess

The deduction SHALL be capped below recursion, since a guess is not a
teachable step. When no forced move exists below recursion the hint SHALL
refuse honestly and SHALL NOT invent one.

#### Scenario: Only a guess is left

- **WHEN** a hint is requested on a board whose next cell only recursion
  decides
- **THEN** the hint refuses

### Requirement: Every hint step is monotone progress

Every step SHALL be monotone progress, never undone by the hint: a note added,
a note removed by a strike, or a cell filled by a placement. A freshly
recomputed hint from any solvable, mistake-free mid-game position SHALL
therefore make progress and lead to a solved board. On recompute the plan
SHALL skip any operation already reflected on the board.

#### Scenario: The hint resumes from a self-played mid-game position

- **WHEN** a hint is requested from a solvable, mistake-free board the player
  reached by their own placements
- **THEN** the freshly-recomputed hint makes progress and, applied step by step
  with recompute, leads to a solved board

### Requirement: A stored Group plan follows the player's moves

`hintKeepTrack` SHALL advance the plan when the player's move matches the
displayed step's intent: a `set` of the hinted value is `completed`, and a
pencil strike clearing a subset of the step's marks is `onTrack` or
`completed`. Any other move SHALL drop the plan (`off`). `refreshHintStep`
SHALL drop a stored step's dead marks, or resolve the step, before each
display, so a kept plan never tells the player to act on something already
resolved.

#### Scenario: The player strikes one of a step's marks

- **WHEN** the displayed step strikes several marks and the player clears one
  of them
- **THEN** the verdict is `onTrack`, and the step is shown again without that
  mark

### Requirement: Recording leaves the solver's verdicts alone

Every recording branch of the solver SHALL be gated on the recorder, so that
with recording off the generator and solve path is byte-for-byte unchanged.

#### Scenario: The generator solves with no recorder

- **WHEN** the generator or `solve` runs the solver, which passes no recorder
- **THEN** no recording branch runs

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
