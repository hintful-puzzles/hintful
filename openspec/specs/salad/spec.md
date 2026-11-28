# salad Specification

## Purpose
Salad, the Latin-square puzzle in which some squares stay empty, clued mainly by
the letter seen first from each edge in ABC End View mode, or by balls and
crosses in Number Ball mode. This spec holds its two modes, its parameters and
description format, its controls, what its two difficulties hold, the
decision that its solver reasons about the empty square in the
shared Latin cube, its look, and what its hint teaches and says.

## Requirements

### Requirement: Rules: Salad has two game modes

Salad SHALL be played from its description alone (`described-fill-game`),
and SHALL support both of its game modes, each a ruleset: **ABC End View**
(letters, with clues on the grid's borders naming the first character seen
looking inward) and **Number Ball** (numbers, with in-grid ball and cross
clues).

#### Scenario: Where each mode carries its clues

- **WHEN** `CfABcBc,p` is opened as a `4n3L` board and `c2b1aOXbXb3c1OOc` as a
  `5n3B` one
- **THEN** the first has its clues on the border and none in the grid, and the
  second has numbers, balls and crosses in the grid and no border clue

### Requirement: Rules: Salad checks its markers as well as its symbols and notes against the answer

Salad's `findMistakes` SHALL be the collection's check of entries and notes
(`ts-engine`, "A mistake check compares with the one answer, hidden or not"
and "A candidate note that excludes the answer is a mistake"). The empty
square is a value like a symbol: a cross is that value entered, and a ball is
that value struck from the square's notes. A cross where a symbol belongs is
a wrong entry, and a ball on a square the answer leaves empty is a note that
excludes the answer.

#### Scenario: A ball on a square that stays empty

- **WHEN** the player puts a ball on a square the answer leaves empty, and
  mistakes are checked
- **THEN** that square is reported, though it holds no symbol to be wrong

### Requirement: Rules: Salad is solved when every line and every border clue is satisfied

The game SHALL be reported solved when every line holds each symbol exactly
once with the correct empty squares and all border clues are satisfied.

#### Scenario: Completing every line to the rules wins

- **WHEN** the last entry makes every row and column hold each symbol once with the
  correct empty squares, satisfying all clues
- **THEN** the game is reported solved

### Requirement: Params: Salad's Normal presets are the shapes that deal quickly

Salad's Normal presets SHALL be shapes whose deal stays well under a second.

#### Scenario: A shape that is slow at Normal

- **WHEN** Salad's preset menu is read
- **THEN** the 7×7 and 8×8 boards of either mode are offered at Easy and not
  at Normal

### Requirement: Params: A Salad params string is its declared codec's, and one with no mode letter is ABC End View

Salad's params (a grid size, a symbol count, a game mode and a difficulty),
their bounds and their encoding SHALL be those its `paramConfig` and its
declared codec give (`engine-params`, "A game declares its params encoding
once, and both codec halves are derived"), with no departure from the codec
grammar. A string with no mode letter SHALL decode as ABC End View, and one
with no `d` as Easy. `validateParams` SHALL refuse a symbol count that is not
less than the grid size.

#### Scenario: A Number Ball preset

- **WHEN** `5n4Bdx` is decoded
- **THEN** the board is 5×5 Number Ball with the numbers 1 to 4 at Normal, and
  its short form is `5n4B`

#### Scenario: A string with no difficulty

- **WHEN** `4n3L` is decoded
- **THEN** the board is 4×4 ABC End View with A to C at Easy, and its full
  encoding is `4n3Lde`

#### Scenario: As many symbols as the size

- **WHEN** parameters whose `nums` equals their `order` are validated
- **THEN** `validateParams` refuses them

### Requirement: Params: Salad refuses two symbols at Normal where no board has it

When a board is to be dealt at Normal with two symbols, `validateParams` SHALL
refuse an ABC End View board smaller than 8×8 and a Number Ball board up to
4×4 with the sentence that no such puzzle is Normal. A Number Ball board of
5×5 or larger is rare at that tier and SHALL be dealt (`engine-difficulty`,
"A rare tier is dealt under the deadline").

#### Scenario: Two letters at Normal

- **WHEN** the `3` of `5n3Ldx` is changed to `2` and the params are checked for
  dealing
- **THEN** they are refused with "No 5x5 Letters puzzle with 2 symbols is
  Normal."
- **AND** they are not refused for a board that arrives with its description

#### Scenario: Two numbers at Normal

- **WHEN** the `4` of `5n4Bdx` is changed to `2` and the params are checked for
  dealing
- **THEN** they are not refused
- **AND** a 4×4 Number Ball board with two symbols is refused with "No 4x4
  Numbers puzzle with 2 symbols is Normal."

### Requirement: Description: Salad descriptions use the upstream run-length block encoding

A Salad description SHALL encode its clue arrays in canonical order using a
run-length block encoding: a run of empty squares as a single lowercase letter,
an empty-marker square as `X`, a must-contain-a-symbol square as `O`, and a
symbol as a letter from `A` in ABC End View and a digit from `1` in Number
Ball. In ABC End View mode the description SHALL be the border clues, a comma,
then the grid clues; in Number Ball mode it SHALL be the grid clues alone.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: Description: A Salad description is validated against its arrays

Validation SHALL reject a description that carries more or fewer squares than
the relevant array holds, with a message that tells too many from too few, one
that contains an out-of-range clue value, and one that uses an unknown
character. An ABC End View border section that stops short is met at its
separator, and SHALL be rejected there as a character out of place and not as
too few squares.

#### Scenario: A description with the wrong number of squares is rejected

- **WHEN** a description carrying more or fewer squares than its array has cells is
  validated
- **THEN** it is rejected with a message distinguishing too much from too little

#### Scenario: A short border section is refused at its comma

- **WHEN** an ABC End View description whose border section covers fewer clues
  than the border has, followed by its comma and a grid section, is validated
- **THEN** the refusal names the comma as a character the game ID cannot have
  there

### Requirement: Description: A Salad description writes letters in ABC End View and digits in Number Ball

A symbol SHALL be written `A`–`I` in ABC End View, in the border and the grid
alike, and `1`–`9` in Number Ball, and `a`–`z` SHALL be a run of 1 to 26 blank
entries. The border clues SHALL run along the top, the left, the bottom and
the right, each in reading order. An ABC End View grid SHALL take `X` and no
`O`; a Number Ball grid SHALL take both. A symbol above the board's count
SHALL be refused as a character the game ID cannot have there.

#### Scenario: A dealt 4×4 board

- **WHEN** `CfABcBc,p` is read as a `4n3L` board
- **THEN** a C is above the first column, an A left of the last row, a B below
  the first column and a B right of the first row, and the grid is empty

#### Scenario: A letter past the board's symbols

- **WHEN** the `C` of `4n3Lde:CaCbAfBaAa,p` is changed to `I`
- **THEN** the board is refused with "This game ID has "I" where it can't have
  one."

### Requirement: Generation: Salad has two difficulties, over the Latin deductions and its border clue's

Salad SHALL offer two tiers. Easy SHALL be the description's own techniques
(the border clue's two arms in ABC End View, a given ball's, and the empty
square placed in a line and in a square) with the Latin library's placement,
hidden single and naked single; Normal SHALL add the library's set, fish and
wing. Salad SHALL follow no forcing chain at either tier, since a chain is a
search and Salad has no Unreasonable.

#### Scenario: A Normal board genuinely needs the Normal tier

- **WHEN** a board generated at Normal is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at Normal does

#### Scenario: A 4×4 of three letters at Normal deals

- **WHEN** a board is to be dealt from the params `4n3Ldx`
- **THEN** it is not refused, and the board dealt needs Normal

### Requirement: Solver: Salad's solver reasons about the empty square directly

Salad's answer SHALL hold the empty square as its repeated value: `n + 1`,
appearing `w − n` times per line. A cross SHALL be that value placed and a
ball that value struck. The empty-square deductions SHALL read its
multiplicity, with no translation between holes and candidates at the game's
edge. Number Ball's quality gate, refusing a board whose empty squares all
fall with no number placed, SHALL be asked of the description's own
techniques for the empty square (`deal.refuse`).

#### Scenario: The empty square is reasoned about directly

- **WHEN** the solver deduces a placement that turns on where empty squares can
  and cannot go
- **THEN** that deduction is expressed over the repeated value, with no
  translation step at the game boundary

#### Scenario: A line that can hold its empties in only one way

- **WHEN** exactly as many squares of a line can still be empty as it has
  empty squares left to place
- **THEN** the line's technique places the empty square in each of them

### Requirement: Solver: Salad's ladder is its description

Salad's solver SHALL run the ladder of `salad.description.yaml`, compiled:
the border clue's near and far arms, the given ball's strike, the empty
square in a line and in a square, and the Latin library's placement, hidden
single, naked single, set, fish and wing, each at the tier the description
gives it and each reading the empty square's multiplicity, every one checked
sound against the description's rules.

#### Scenario: A border letter's reach

- **WHEN** a column's top clue is B on a 5x5 board of three letters, and the
  column's bottom square is known empty
- **THEN** the border deduction strikes B from the column's third, fourth and
  fifth squares, since of the column's two empties the bottom square is one,
  so at most one stands before the B

### Requirement: Controls: Salad's keypad holds its symbols and the two markers

Salad SHALL surface its `nums` symbol keys plus the empty and not-empty markers
as an on-screen keypad, with the collection's Clear key last.

#### Scenario: The keypad of a three-symbol board

- **WHEN** the keys are requested for a board of three symbols
- **THEN** they hold the three symbol keys in the mode's own characters, the
  X and O marker keys, and Clear

### Requirement: Controls: Salad selects a square and enters a symbol or a marker

Salad SHALL be played by selecting a cell, through the engine's note-taking
cell (`engine-notes`, "The note-taking cell is one shared mechanic"), and
entering a symbol or the cross, or noting a ball.

#### Scenario: Entering a symbol places it in the selected cell

- **WHEN** a cell is selected in ink mode and a valid symbol key is pressed
- **THEN** that symbol is placed in the cell and the cell is no longer empty

### Requirement: Controls: Salad's Mark-all pencils nothing into a square marked empty

Salad's fill-all-candidates action SHALL be the collection's Mark-all
(`engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate
rule"). A crossed square holds a value, so it takes no marks.

#### Scenario: Filling in the candidates of an untouched board

- **WHEN** the action is taken on a board that carries no pencil marks
- **THEN** every square that holds neither a symbol nor a cross is penciled
  with its candidates, the empty square's X among them

### Requirement: Controls: Salad types a symbol by its letter or its digit in either mode

With a square selected, the digits `1`–`9` and the letters `A`–`I`, in either
case, SHALL each enter the symbol of that rank in either mode, and one above
the board's count SHALL be ignored. `X` in either case, `-` or `_` SHALL
enter the cross, and `O` in either case, `+` or `=` note a ball. Backspace,
Delete and Space SHALL clear the square.

#### Scenario: A letter on a Number Ball board

- **WHEN** `c` is typed on a selected blank square of a Number Ball board
- **THEN** a 3 is entered

#### Scenario: A symbol the board does not have

- **WHEN** `4` is typed on a selected square of a board with three symbols
- **THEN** no move is made

#### Scenario: The markers' other keys

- **WHEN** `-` is typed on a selected blank square, and `+` on another
- **THEN** the first holds the cross, and the second notes a ball

### Requirement: Controls: Salad takes no entry on a given, and `O` notes a ball

A square the puzzle filled with a symbol or a cross SHALL take no entry. `O`
SHALL note a ball, striking the empty square from the square's notes, and on
a square so noted put it back; on a square holding a symbol or a cross it
SHALL do nothing.

#### Scenario: A cross on a given cross

- **WHEN** the keyboard cursor is on a given cross and `X` is pressed
- **THEN** no move is made

#### Scenario: A ball on a square holding a symbol

- **WHEN** the keyboard cursor is on a square the player filled with a symbol
  and `O` is pressed
- **THEN** no move is made, and the symbol stays

### Requirement: Hint: Salad's hint is the candidate walk's, with steps of its own that enter a marker

Salad's hint SHALL be the described game's candidate walk
(`described-fill-game`), its words the description's. The empty square is a
value the walk places, but never as a single: the description's techniques
for a line and for a square place it, and a cross that fills its line is
followed by the cull of its line's other X notes, said as the line's last.

#### Scenario: A count that settles two squares

- **WHEN** one line's count settles two blank squares as empty
- **THEN** the plan holds a step that places the cross in each, said as the
  line's count

### Requirement: Hint: Salad's hint narrates the hole and symbol synchronization in its own terms

The hint SHALL narrate a square that can hold no symbol in its own terms:
every symbol is ruled out of it, so it must be empty.

#### Scenario: A square's notes come down to the empty mark

- **WHEN** a square's pencil notes hold the "might be empty" mark alone
- **THEN** the hint's step places the cross there, saying that every symbol
  is ruled out of the square

### Requirement: Hint: Salad's hint narrates the per-line count in its own terms

The hint SHALL narrate the per-line count in its own terms: once a line's
symbols are all placed, every square still blank in it is empty; once only
as many of its squares can be empty as it still needs, they are; and once
its last cross is placed, its other squares' X goes, said as the line's
last.

#### Scenario: A line whose empty squares are all found forces the rest

- **WHEN** the hint places a line's last cross, and another square of the
  line still notes X
- **THEN** the next step strikes that X, saying the X just placed is the last
  empty square of its line

#### Scenario: A line whose symbols are all placed forces the rest

- **WHEN** a line already holds every one of its symbols
- **THEN** the hint's step places the cross in its blank squares, saying that
  all of the line's symbols are already placed

### Requirement: Hint: Salad's hint narrates the border clue in its own terms

In ABC End View mode only, the hint SHALL narrate the border clue in two
steps of its own. Near the clue, the first square not known empty can hold
only the clue's letter or be empty, the empty squares before it outlined.
Beyond the clue's reach, bounded by how many empty squares the line may still
hold before it, or past a square known to hold a letter, the clue's letter is
ruled out.

#### Scenario: A border clue's deduction names the clue and its line of sight

- **WHEN** a hint's next deduction follows from a border clue
- **THEN** the step outlines the clue and explains what it sees first, and
  why that rules the candidate out

### Requirement: Hint: Salad's hint names the "might be empty" mark as X

A sentence that names the "might be empty" mark SHALL print it as the X the
player pencils for it, never as a letter or a number past the board's symbols.

#### Scenario: The empty square is confined across lines

- **WHEN** a set confines the "might be empty" mark of several rows to the
  same columns
- **THEN** the sentence names the mark as X

### Requirement: Hint: Salad's hint strikes a given ball's empty-square mark

Salad's hint SHALL strike the "might be empty" mark of a square whose clue is
a ball, as a step of its own that outlines the ball. A ball the player notes
is that mark struck, and needs no step.

#### Scenario: A given ball

- **WHEN** a Number Ball board's notes are penciled in and a square whose clue
  is a ball still notes X
- **THEN** a step of the hint strikes it, saying "The outlined ball means its
  square holds a number, so the X must go."

### Requirement: Hint: A set holding a line's empty squares says it holds every one

Where a set elimination's values include the empty square, its cells hold
every copy of it their line still needs, and the hint SHALL say so: they
"already account for every X their line still needs", and the X notes of the
line's other squares go.

#### Scenario: A set holds all of a line's empty squares

- **WHEN** a hint's step is a set whose cells hold all the empty squares
  their line has left
- **THEN** its sentence says the outlined squares already account for every X
  their line still needs, and strikes the other squares' X

### Requirement: Look: What Salad draws

Rendering SHALL draw symbols, balls and crosses, pencil-mark candidate grids,
border clues in the surrounding margin, and a live highlight of rule
violations.

#### Scenario: A symbol repeated in a line

- **WHEN** the player enters a symbol a second time in one row
- **THEN** each copy the player entered is drawn in the error color while the
  board is still in play

### Requirement: Look: Salad draws its squares on a quiet surface, with a given's lifted

`redraw` SHALL draw every square the player fills on the collection's cell
surface, and every square the puzzle filled (a given character, ball or cross)
on the collection's lifted surface of a given, so that a given is told by the
square under it as well as by its ink. The line between squares and the frame
round the grid SHALL be the collection's surface grid line. The border clues
SHALL stay on the board, outside the surface.

#### Scenario: A given is told by the square under it

- **WHEN** a board with given squares is drawn
- **THEN** each given's square is the lifted surface
- **AND** every other square is the cell surface, bordered by the surface grid
  line

### Requirement: Look: A Salad ball shows its square's surface, and the hint's marks stay on the border

A ball SHALL be an unfilled ring, a given one in ink and one the player noted
in the entry color, showing its square's surface through it. A ball's notes
SHALL be drawn inside its ring. The hint's marks SHALL stay on the square's
border.

#### Scenario: A ball the player marked, in each mode

- **WHEN** a blank square that is not selected, and that the player has noted
  as holding a symbol, is drawn
- **THEN** in either mode its ball is a ring in the entry color, its square's
  surface showing inside it

#### Scenario: A ball holding notes

- **WHEN** a square whose clue is a ball holds pencil notes
- **THEN** the notes are drawn inside the ring, clear of its stroke

### Requirement: Look: Salad draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each symbol that repeats in its row or column, the crosses of a
line holding more crosses than it has empty squares, and each border clue its
line can no longer show first (`Game.rules`).

#### Scenario: The first symbol in a clue's line is another

- **WHEN** the player enters, nearest a border clue in its line, a symbol
  other than the clue's
- **THEN** the border clue is drawn red

#### Scenario: Too many crosses in a line

- **WHEN** the player crosses more squares in a line than it has empty squares
- **THEN** each of its crosses is drawn red
