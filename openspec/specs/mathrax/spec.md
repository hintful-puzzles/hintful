# mathrax Specification

## Purpose
Mathrax, the Latin-square puzzle whose clues sit on grid intersections and
constrain the four digits around each: its rules, its parameters and
descriptions, its controls, its mistake check against the unique solution,
what separates its tiers, what its hint says and marks, and the look that is
its own.

## Requirements

### Requirement: Rules: Mathrax is solved when the filled grid breaks no rule

The objective SHALL be to fill the grid with digits from 1 to the grid size so
that no digit repeats in any row or column and every clue is satisfied. The
game SHALL be reported solved when every cell is filled with no row, column or
clue violation.

#### Scenario: Completing the grid correctly wins

- **WHEN** the last cell is filled so that every row, column and clue is satisfied
- **THEN** the game is reported solved

#### Scenario: A full grid that repeats a digit is not the objective

- **WHEN** every cell is filled and one row holds the same digit twice
- **THEN** the game is not reported solved

### Requirement: Rules: Mathrax clues constrain the four digits around each intersection

Clues SHALL sit on the interior grid intersections. Each clue SHALL constrain the four
digits diagonally adjacent to it. An arithmetic clue (add, subtract, multiply, divide)
SHALL require the operation to give the same result on both diagonal pairs and SHALL
display that result; an equality clue SHALL require each diagonal pair to be equal; an
even clue SHALL require all four digits to be even and an odd clue all four to be odd.

#### Scenario: An arithmetic clue is satisfied on both diagonals

- **WHEN** the four digits around an addition clue showing `n` are examined
- **THEN** the two diagonally-opposite pairs each sum to `n`

### Requirement: Rules: Mathrax's mistake check re-solves from its givens and clues

Mathrax's `findMistakes` SHALL judge the board against the answer it re-solves
from the given digits and the clues.

#### Scenario: A wrong digit that breaks no rule

- **WHEN** the player enters a digit that repeats nothing in its row or
  column, contradicts no clue as the board stands, and is not the answer's
- **THEN** that cell is reported as a mistake

### Requirement: Params: Mathrax refuses to deal with no clue type enabled

`validateParams` SHALL refuse, when validating for generation, a parameter set
with no clue type enabled.

#### Scenario: Every clue type unchecked

- **WHEN** a parameter set with all six clue types off is validated for
  generation
- **THEN** it is refused: "At least one clue type must be enabled."

### Requirement: Params: Mathrax offers only the difficulties a size can support

Mathrax SHALL refuse to *generate* a size-3 board at Normal or at the top tier,
because a 3×3 grid's four intersections cannot separate those tiers from their
neighbors. The refusal SHALL name the tiers from the game's tier list, as the
difficulty menu does. Size 3 at Tricky SHALL be unaffected.

#### Scenario: An unsupported size and tier are refused

- **WHEN** a full parameter set requesting size 3 at Normal or the top tier is
  validated
- **THEN** it is rejected with a message naming the size, and Normal and the
  top tier exactly as the difficulty menu does
- **AND** the same parameters validate successfully when a description is supplied

### Requirement: Params: Mathrax's params are the size, a tier letter and the clue-type letters

The params string SHALL be the size in decimal, then `d` and one of `e`, `n`,
`t`, `r` for the four tiers in order, then a letter for each enabled clue
type in the order `A` (addition), `S` (subtraction), `M` (multiplication),
`D` (division), `E` (equality), `O` (even/odd), and no letter when all six
are enabled. The short form SHALL be the size alone and SHALL decode to Easy
with every clue type. `decodeParams` SHALL read each clue letter once and
refuse one out of that order.

#### Scenario: A restricted clue set

- **WHEN** `7dtAM` is decoded
- **THEN** it is a size-7 Tricky board with only addition and multiplication
  clues, and its short form is `7`

#### Scenario: Clue letters out of order

- **WHEN** `6dnDS` is decoded
- **THEN** it is refused for its `S`, because `S` is looked for before `D`

#### Scenario: The short form

- **WHEN** `5` is decoded and encoded in full
- **THEN** the result is `5de`

### Requirement: Params: A Mathrax label names a restricted clue set by the shorter list

A params label SHALL say nothing of clue types when all six are enabled.
Otherwise it SHALL end, after a comma, with `only` and the enabled types when
they are no more than the disabled ones, and with `no` and the disabled types
when those are fewer, joined by `/` in the order of the Custom dialog. The
words SHALL be `addition`, `subtraction`, `multiplication`, `division`,
`equality` and `even-odd`.

#### Scenario: Two types enabled

- **WHEN** the params `7dtAM` are labeled
- **THEN** the label is "7x7 Tricky, only addition/multiplication"

#### Scenario: One type disabled

- **WHEN** `7dtASMDE`, size-7 Tricky params with every type but even/odd, are
  labeled
- **THEN** the label is "7x7 Tricky, no even-odd"

### Requirement: Description: Mathrax descriptions use the run-length grid-and-clue encoding

A Mathrax description SHALL encode the immutable given digits and then the clues, in
two comma-separated run-length parts. In the grid part each square SHALL be a digit or
part of a run of empty squares; in the clue part each intersection SHALL be an
arithmetic clue with its number, an equality, even or odd marker, or part of a run of
empty intersections. Encoding and decoding SHALL be exact inverses.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: Description: Mathrax's reading of a description refuses a malformed one

The reading `newState` builds a board from SHALL refuse a description whose
grid part carries more squares than the grid holds, that contains a digit
larger than the grid size, that uses an unknown character, that names an
unknown clue or a clue number outside what that clue can show on a board of
that size, or whose grid or clue part stops short of covering the grid.

#### Scenario: An out-of-range digit is rejected

- **WHEN** a description containing a given digit larger than the grid size is
  validated
- **THEN** it is rejected

#### Scenario: A clue number the board cannot show is rejected

- **WHEN** a description of a size-5 board carries an addition clue of 11
- **THEN** it is rejected

#### Scenario: A quotient of 1 is rejected

- **WHEN** a description carries a division clue of 1
- **THEN** it is rejected, because two equal cells are shown by the `=` clue,
  which is a difference of 0

### Requirement: Description: A Mathrax description spells a run in lowercase and a clue in uppercase

Each part SHALL list its entries row by row: the squares, a `,`, then the
interior intersections. A letter `a` to `z` SHALL stand for a run of 1 to 26
empty entries, and a longer run SHALL be written as `z` and then the rest. A
given SHALL be its digit. A clue SHALL be `A`, `S`, `M` or `D` (add, subtract,
multiply, divide) followed by its number in decimal, or `E` or `O` (even, odd)
alone. The equality clue SHALL be written `S0`.

#### Scenario: A dealt size-5 board

- **WHEN** `e4p3a5,A6iA5bS1b` is read at size 5
- **THEN** the givens are a 4 at the start of the second row and a 3 and a 5
  in the third and fifth squares of the last row
- **AND** the clues are `6+` at the first intersection, `5+` at the third of
  the third row, and `1−` at the second of the last row

#### Scenario: The equality clue

- **WHEN** `m1g1c,aS2cS1S3dS0d` is read at size 5
- **THEN** the clue at the last intersection of the third row is drawn `=`

#### Scenario: A run longer than the alphabet

- **WHEN** a size-6 board with no given and no clue is written
- **THEN** the description is `zj,y`: 26 and 10 empty squares, then 25 empty
  intersections

### Requirement: Description: A Mathrax clue number is one that two digits of the board can make

On a board of size `o`, the reading SHALL accept a sum from 2 to 2`o`, a
difference from 0 to `o`−1, a product from 1 to `o`², and a quotient from 2 to
`o`, and SHALL refuse any other. It SHALL refuse an arithmetic clue with no
number, an `E` or `O` followed by one, a description with no `,` after the
last square, and anything after the last intersection.

#### Scenario: The largest number of each kind on a size-3 board

- **WHEN** `i,A6S2M9D3` is read at size 3
- **THEN** it loads, with the clues `6+`, `2−`, `9×` and `3÷`

#### Scenario: A difference the digits cannot reach

- **WHEN** `i,S3c` is read at size 3
- **THEN** it is refused as a number out of range for the board

#### Scenario: A parity clue with a number

- **WHEN** `i,E5c` is read at size 3
- **THEN** it is refused at the `5`

### Requirement: Generation: An ambiguous verdict does not let Mathrax's generator keep removing

While it removes givens and clues from a board, the generator SHALL NOT take
an ambiguous solver verdict as grounds to keep removing.

#### Scenario: Even the guess-and-verify tier yields a unique solution

- **WHEN** a board is generated at the `Unreasonable` difficulty
- **THEN** it has exactly one solution, and it cannot be solved without the
  guess-and-verify step

### Requirement: Generation: What separates Mathrax's difficulty tiers

Beside the Latin deductions, Mathrax's clue deduction SHALL keep in a
cell only the digits every clue at its corners permits, given the candidates of
the cell across that clue. Easy SHALL read an arithmetic clue only when the cell
across it is down to one digit. Easy and Normal SHALL act only where one digit
is left; Tricky SHALL strike all that is ruled out. Normal SHALL add the
set elimination, Tricky the harder one and the wing, and Unreasonable
forcing chains and guess-and-verify.

#### Scenario: The solver solves a generated board

- **WHEN** a generated board is solved
- **THEN** the returned grid is the board's unique Latin-square solution and satisfies
  every clue

### Requirement: Controls: Mathrax enters digits through the shared note-taking cell

Mathrax SHALL take its selection from the engine's note-taking cell
(`engine-notes`, "The note-taking cell is one shared mechanic"). With a cell
selected, a digit key SHALL enter that digit, or in pencil mode toggle its
pencil mark, and backspace, space or zero SHALL clear the cell. In pencil mode
no key SHALL change a cell that holds a digit. Immutable given cells SHALL NOT
be editable.

#### Scenario: A digit is entered into a selected cell

- **WHEN** an empty mutable cell is selected and a digit within range is typed
- **THEN** that digit is placed in the cell

#### Scenario: A given takes no entry

- **WHEN** the cursor is on a given cell and a different digit is typed
- **THEN** no move is made

#### Scenario: A clear key in pencil mode on a filled cell

- **WHEN** pencil mode is on, the cursor is on a cell holding a digit, and
  Backspace is pressed
- **THEN** no move is made and the digit stays

### Requirement: Preferences: Auto-pencil strikes a placed digit from its row and column

When auto-pencil is on a placement SHALL remove its digit from the pencil
marks of the rest of its row and column.

#### Scenario: A placement clears its digit from its row and column

- **WHEN** the auto-pencil preference is on and a digit is entered in a cell
  whose row and column hold that digit as a pencil mark
- **THEN** those pencil marks are removed with the entry

### Requirement: Hint: Mathrax's hint plan is the shared candidate-elimination walk

The plan SHALL be built by the shared candidate-elimination walk over Mathrax's
row and column regions (`engine-candidate-hints`, "A row/column Latin square
answers no question its regions already settle"); a clue is not a region.
Mathrax SHALL start on the
reading that pencils in only the notes a deduction needs, because a clue reads
the cell across it and the rest is singles, so a plan writes notes into few
cells.

#### Scenario: A hint with no Ui pencils in only what it needs

- **WHEN** a hint is requested with no `Ui` on a board with no notes
- **THEN** no step of the plan is the fill-all move

### Requirement: Hint: A recorded clue elimination names one clue acting on one cell

A recorded clue elimination SHALL name exactly one clue acting on exactly one
cell. Mathrax's deduction intersects a cell's candidates across the up to four
clues at its corners at once, so the recording path SHALL attribute each
elimination to a clue whose options exclude it and commit one clue's
eliminations per firing.

#### Scenario: A clue step strikes only the one cell it acts on

- **WHEN** a clue's deduction is hinted
- **THEN** the step names one clue and strikes only candidates of the one cell
  it acts on

### Requirement: Hint: Recording does not change what the Mathrax solver commits

The recording path SHALL NOT change what the deduction commits: the difficulty
gate SHALL still wait on the intersection across every incident clue, so the
solver reaches the same verdict and the same grid with and without a recorder,
and the solver-gated generator produces the same boards.

#### Scenario: The recorder does not change the solver's verdict

- **WHEN** the same board is solved at the same difficulty cap with and without a
  deduction recorder
- **THEN** both solves return the same verdict and write back the same grid

### Requirement: Hint: A clue step names its clue and what lies across it

A clue step's sentence SHALL name the clue as the board draws it and state the
operation in words. Whether it names a digit across the clue SHALL be decided by
the working board and not by the recorded deduction: it SHALL say so only
when a digit is written there, and otherwise SHALL speak of what is still open
across the clue.

#### Scenario: A clue read against a digit across it names that digit

- **WHEN** a hint is requested on a board where a clue's deduction acts on a cell
  whose diagonal partner across that clue holds a digit
- **THEN** the step names the clue as the board draws it, states what the two
  cells on that diagonal must do, names the partner's digit, and strikes only
  candidates of the one cell it acts on

#### Scenario: A clue read against an open cell speaks of what is still open

- **WHEN** the same deduction acts on a cell whose diagonal partner across the
  clue is still empty
- **THEN** the step says that nothing open across that clue pairs with the values
  it strikes, and names no digit across the clue

### Requirement: Hint: A clue step outlines the cells that identify its clue

A clue step SHALL outline as its evidence the cells that identify the clue: the
diagonal pair for an arithmetic or equality clue, all four cells around the
intersection for an even or odd clue. The clue sits on an intersection the
board has no mark for, and each of those sets meets at exactly one
intersection.

#### Scenario: An even or odd clue outlines all four cells around it

- **WHEN** an `E` or `O` clue's deduction is hinted
- **THEN** the step says all four numbers around the clue are even or odd, and
  outlines the block of four cells around that intersection

### Requirement: Hint: Mathrax's hint deduces at the tier of the board's params

Where the board's params name a tier below `Unreasonable`, the recording solve
SHALL run at that tier, so a hint uses no deduction its board's tier does not.

#### Scenario: A board whose params say Easy

- **WHEN** a hint is requested on a board whose params name Easy
- **THEN** the recording solve runs at Easy, so no step is a set elimination
  or a chain, and an arithmetic clue is read only where one digit is left
  across it

### Requirement: Look: Mathrax draws its cells on a quiet surface and lifts a given

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, with the collection's surface grid line between cells and a frame
round the grid no heavier than that line. A cell holding a given number SHALL
sit on the collection's lifted surface of a given, with its number in ink, and
a number the player entered SHALL keep the player's entry color on the plain
surface, unless it repeats in its row or column.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with a given number is drawn
- **THEN** the given's cell is the lifted surface and every empty cell is the
  plain cell surface

#### Scenario: The grid is quiet

- **WHEN** the opening frame is drawn
- **THEN** the lines between cells and the frame are the surface's grid line
- **AND** nothing but a number, a clue's ring and a clue's label is drawn in ink

### Requirement: Look: A Mathrax clue is a lifted disc with a ring and a label in ink

A clue SHALL be a disc in the lifted surface's color with a ring and a label in
ink, so a clue reads as the puzzle's own in both schemes. The quarter of a clue
in a cell whose digit contradicts it is excepted: its disc and ring take the
error colors.

#### Scenario: A clue is drawn as the puzzle's own

- **WHEN** a board with a satisfied clue is drawn
- **THEN** the clue's disc is the lifted surface's color and its ring and label
  are ink
