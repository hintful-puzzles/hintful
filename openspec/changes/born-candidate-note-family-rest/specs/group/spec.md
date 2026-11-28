## MODIFIED Requirements

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

### Requirement: Description: Group descriptions use the upstream run-length encoding

A Group description SHALL encode the grid in reading order: each clue as a
decimal number from 1 to the grid size, each run of 1 to 26 blank cells as a
single letter `a` to `z` (a longer run split across letters), and an
underscore between two clues that would otherwise abut.

#### Scenario: A generated description round-trips

- **WHEN** `6dn:1_2_3_4_5_6_2e3b6b4d2_5a4b1_6e` is read
- **THEN** its desc is written back byte for byte

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

### Requirement: Look: Group draws its table on a quiet surface, with a given's cell lifted

The fill board SHALL draw every cell of the table the player fills on the
collection's cell surface, and every cell holding a given element on the
collection's lifted surface of a given. The labels SHALL stay on the board,
outside the surface.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with given elements is drawn
- **THEN** each given's cell is the lifted surface
- **AND** every other cell of the table is the cell surface

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
