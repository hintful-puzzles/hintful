## ADDED Requirements

### Requirement: Salad params are a size, n, a symbol count and a mode letter

Params SHALL encode as `{order}n{nums}`, then `L` for ABC End View or `B` for
Number Ball, then, in the full form only, `d` and the difficulty's letter: `e`
for Easy or `x` for Normal. A string with no mode letter SHALL decode as ABC
End View, and one with no `d` as Easy. A `d`
followed by any other letter SHALL decode to a difficulty out of range, which
validation refuses.

#### Scenario: A Number Ball preset

- **WHEN** `5n4Bdx` is decoded
- **THEN** the board is 5×5 Number Ball with the numbers 1 to 4 at Normal, and
  its short form is `5n4B`

#### Scenario: A string with no difficulty

- **WHEN** `4n3L` is decoded
- **THEN** the board is 4×4 ABC End View with A to C at Easy, and its full
  encoding is `4n3Lde`

#### Scenario: A letter that is no difficulty

- **WHEN** the `x` of `5n4Bdx` is changed to `z`
- **THEN** the params are refused with "Difficulty must be one of Easy,
  Normal."

### Requirement: Salad refuses two symbols at Normal where no board has it

When a board is to be dealt at Normal with two symbols, `validateParams` SHALL
refuse an ABC End View board smaller than 8×8 and a Number Ball board up to
4×4 with the sentence that no such puzzle is Normal, and a Number Ball board
of 5×5, or of 8×8 and larger, with the sentence for a tier too rare to deal. A
board that arrives with its description SHALL NOT be refused for this.

#### Scenario: Two letters at Normal

- **WHEN** the `3` of `5n3Ldx` is changed to `2` and the params are checked for
  dealing
- **THEN** they are refused with "No 5x5 Letters puzzle with 2 symbols is
  Normal."
- **AND** they are not refused for a board that arrives with its description

#### Scenario: Two numbers at Normal

- **WHEN** the `4` of `5n4Bdx` is changed to `2` and the params are checked for
  dealing
- **THEN** they are refused with "Normal 5x5 Numbers puzzles with 2 symbols
  are too rare to deal."
- **AND** a 6×6 Number Ball board with two symbols is admitted at Normal

### Requirement: A Salad description writes letters in ABC End View and digits in Number Ball

A symbol SHALL be written `A`–`I` in ABC End View, in the border and the grid
alike, and `1`–`9` in Number Ball, and `a`–`z` SHALL be a run of 1 to 26 blank
entries. The border clues SHALL run along the top, the left, the bottom and
the right, each in reading order. An ABC End View grid SHALL take `X` and no
`O`; a Number Ball grid SHALL take both. A symbol above `nums` SHALL be
refused.

#### Scenario: A dealt 4×4 board

- **WHEN** `CfABcBc,p` is read as a `4n3L` board
- **THEN** a C is above the first column, an A left of the last row, a B below
  the first column and a B right of the first row, and the grid is empty

#### Scenario: A letter past the board's symbols

- **WHEN** the `C` of that description is changed to `D`
- **THEN** the board is refused with "This game ID has a number out of range
  for its board."

### Requirement: Salad types a symbol by its letter or its digit in either mode

With a square selected, the digits `1`–`9` and the letters `A`–`I`, in either
case, SHALL each enter the symbol of that rank in either mode, and one above
`nums` SHALL be ignored. `X` in either case, `-` or `_` SHALL enter the empty
marker, and `O` in either case, `+` or `=` the not-empty marker. `0`,
Backspace, Delete and Space SHALL clear the square.

#### Scenario: A letter on a Number Ball board

- **WHEN** `b` is typed on a selected blank square of a Number Ball board
- **THEN** a 2 is entered

#### Scenario: A symbol the board does not have

- **WHEN** `4` is typed on a selected square of a board with three symbols
- **THEN** no move is made

#### Scenario: The markers' other keys

- **WHEN** `-` and then `+` are typed on a selected blank square
- **THEN** the square is marked empty, and then marked as holding a symbol

### Requirement: Salad's status bar shows the range of its symbols

The status bar SHALL show the board's symbols as a range: `A~` and the last
letter in ABC End View, `1~` and the last number in Number Ball. A preset's
label SHALL name the symbols in the same words.

#### Scenario: The two modes

- **WHEN** a `4n3L` board and a `5n3B` board are on screen
- **THEN** the status bar reads `A~C` on the first and `1~3` on the second

### Requirement: Salad's hint counts a line before it asks for pencil marks

Salad's own steps SHALL sit in the walk's ladder in this order: a line
whose empty squares, or whose symbols, are all found, the rows before the
columns; a square whose marks are down to the empty-square mark or have lost
it; and the leftover empty-square mark of a circled square. They read no
pencil mark the board lacks, so the hint SHALL take them before it pencils in
the candidates. The border-clue deductions and the Latin ones are the solver's
record and SHALL wait for the candidates.

#### Scenario: A Number Ball board opens on a count

- **WHEN** a hint is asked on a Number Ball board with no pencil marks, one of
  whose rows has all its empty squares given as crosses and a blank square
  left
- **THEN** the first step is a line's count, and no step pencils anything in
  while a count is left to take

#### Scenario: An ABC End View board opens on the candidates

- **WHEN** a hint is asked on the dealt board `CfABcBc,p` of `4n3L`, which has
  no square marked
- **THEN** the first step pencils in the candidates, and the second is a
  border clue's

## MODIFIED Requirements

### Requirement: Salad descriptions use the upstream run-length block encoding

A Salad description SHALL encode its clue arrays in canonical order using a
run-length block encoding: a run of empty squares as a single lowercase letter,
an empty-marker square as `X`, a must-contain-a-symbol square as `O`, and a
symbol as a letter from `A` in ABC End View and a digit from `1` in Number
Ball. In ABC End View mode the description SHALL be the border clues, a comma,
then the grid clues; in Number Ball mode it SHALL be the grid clues alone.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description
