## MODIFIED Requirements

### Requirement: Rules: Mathrax's mistake check re-solves from its givens and clues

Mathrax's `findMistakes` SHALL judge the board against its one answer, which
its givens and clues decide (`described-fill-game`).

#### Scenario: A wrong digit that breaks no rule

- **WHEN** the player enters a digit that repeats nothing in its row or
  column, contradicts no clue as the board stands, and is not the answer's
- **THEN** that cell is reported as a mistake

### Requirement: Params: Mathrax refuses to deal with no clue type enabled

A full parameter set with no clue type enabled, which only the Custom dialog
can make since a params string with no letter means all six, SHALL be
refused.

#### Scenario: Every clue type unchecked

- **WHEN** a parameter set with all six clue types off is validated in full
- **THEN** it is refused: "At least one clue type must be enabled."

### Requirement: Params: Mathrax offers only the difficulties a size can support

When a board is to be dealt, a size-3 board at Normal or Unreasonable SHALL
be refused, in the collection's sentence for a size that has no board of the
tier, because a 3×3 grid's four corners cannot separate those tiers from
their neighbors. A size-3 board at Easy or Tricky SHALL be dealt, and a
size-3 board of any tier that arrives with its desc SHALL load.

#### Scenario: An unsupported size and tier are refused

- **WHEN** a board of `3dn` or `3dr` is to be dealt
- **THEN** it is refused: "No 3x3 puzzle is Normal." or "No 3x3 puzzle is
  Unreasonable."
- **AND** a board of `3dt` is dealt

### Requirement: Description: Mathrax's reading of a description refuses a malformed one

The reading of the desc SHALL refuse one whose grid part carries more
squares than the grid holds, that contains a digit larger than the grid
size, that uses an unknown character, that names an unknown clue or a clue
number outside what that clue can show on a board of that size, whose grid
or clue part stops short of covering the grid, or whose givens and clues
have no answer or more than one.

#### Scenario: An out-of-range digit is rejected

- **WHEN** a description containing a given digit larger than the grid size is
  validated
- **THEN** it is rejected

#### Scenario: A clue number the board cannot show is rejected

- **WHEN** a description of a size-5 board carries an addition clue of 11
- **THEN** it is rejected

#### Scenario: A quotient of 1 is rejected

- **WHEN** a description carries a division clue of 1
- **THEN** it is rejected, because two equal cells are shown by the `=` clue

#### Scenario: A board with several answers is rejected

- **WHEN** upstream's Unreasonable `4dr:p,i`, no given and no clue, is read
- **THEN** it is refused as having more than one answer

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

- **WHEN** `zj,y` is read at size 6
- **THEN** it reads as 26 and 10 empty squares, then 25 empty intersections,
  and is refused only for having more than one answer

### Requirement: Description: A Mathrax clue number is one that two digits of the board can make

On a board of size `w`, the reading SHALL accept a sum from 2 to 2`w`, a
difference from 0 to `w`−1, a difference of 0 being the equality clue, a
product from 1 to `w`², and a quotient from 2 to `w`, and SHALL refuse any
other. It SHALL refuse an arithmetic clue with no number, an `E` or `O`
followed by one, a description with no `,` after the last square, and
anything after the last intersection.

#### Scenario: The largest number of each kind on a size-3 board

- **WHEN** `i,A6S2M9D3` is read at size 3
- **THEN** each number is in range, and the board is refused only because its
  clues contradict each other

#### Scenario: A difference the digits cannot reach

- **WHEN** `i,S3c` is read at size 3
- **THEN** it is refused as a number out of range for the board

#### Scenario: A parity clue with a number

- **WHEN** `i,E5c` is read at size 3
- **THEN** it is refused at the `5`

### Requirement: Generation: What separates Mathrax's difficulty tiers

Beside the Latin deductions, Mathrax's clue deduction SHALL keep in a
cell only the digits every clue at its corners permits, given the candidates of
the cell across that clue. Easy SHALL read an arithmetic clue only when the cell
across it is down to one digit. Easy and Normal SHALL act only where one digit
is left; Tricky SHALL strike all that is ruled out. Normal SHALL add the
set elimination, and Tricky the harder one and the wing. Unreasonable
SHALL need the search.

#### Scenario: The solver solves a generated board

- **WHEN** a generated board is solved
- **THEN** the returned grid is the board's unique Latin-square solution and satisfies
  every clue

### Requirement: Hint: Mathrax's hint plan is the shared candidate-elimination walk

The plan SHALL be the fill board's candidate walk over Mathrax's row and
column regions (`described-fill-game`, `engine-candidate-hints`); a clue is
not a region. Mathrax SHALL start on the reading that pencils in only the
notes a deduction needs (`play.hintNotes`), because a clue reads the cell
across it and the rest is singles, so a plan writes notes into few cells.

#### Scenario: A hint with no Ui pencils in only what it needs

- **WHEN** a hint is requested with no `Ui` on a board with no notes
- **THEN** no step of the plan is the fill-all move

### Requirement: Hint: A clue step names its clue and what lies across it

A clue step's sentence SHALL name the clue as the board draws it and state the
operation in words. Whether it names a digit across the clue SHALL be decided
by the board the step is read on, as the description states it (`known` and
`value` of the cell across the corner): it SHALL say so only when a digit is
written there, and otherwise SHALL speak of what is still open across the
clue. A clue's number SHALL be said as a number, never as a value's glyph.

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

### Requirement: Look: A Mathrax clue is a lifted disc with a ring and a label in ink

A clue SHALL be a disc in the lifted surface's color with a ring and a label in
ink, where the four squares meet, so a clue reads as the puzzle's own in both
schemes. A clue the board breaks is excepted: its ring and label take the
error color.

#### Scenario: A clue is drawn as the puzzle's own

- **WHEN** a board with a satisfied clue is drawn
- **THEN** the clue's disc is the lifted surface's color and its ring and label
  are ink

### Requirement: Look: Mathrax draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each entered digit that repeats in its row or column, and each
corner clue the board breaks (`Game.rules`): a clue is broken when no digit
the cell across it could hold, or holds, makes the clue with a cell's own.

#### Scenario: A digit nothing across its clue pairs with

- **WHEN** the player enters a digit that no digit of the board's size, across
  a clue, makes that clue with
- **THEN** the clue's ring and label are drawn red, whole, not a quarter in
  each cell

#### Scenario: A repeated digit

- **WHEN** the same digit is entered twice in a row
- **THEN** each entered one is drawn red

## ADDED Requirements

### Requirement: Generation: A Mathrax corner deals the first clue its answer makes there

At each corner the deal SHALL derive the first kind, of those the params
switch on, that the answer's two diagonal pairs make there, in upstream's
order: a sum, a difference other than 0, equality, a product, a ratio other
than 1, then even or odd. It SHALL then hide the givens first and the clues
after, each while the board still finishes at its tier, so an Easy board
keeps some clues as upstream's does.

#### Scenario: Four odd digits that add alike

- **WHEN** a corner's pairs are all odd and add to the same number, with
  every kind switched on
- **THEN** the corner's clue is the sum, not `O`

#### Scenario: An Easy board shows clues

- **WHEN** 5x5 Easy boards are dealt
- **THEN** each keeps a few givens and some corner clues, not givens alone
