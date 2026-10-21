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

Salad SHALL support both of its game modes: **ABC End View** (letters, with clues on
the grid's borders naming the first character seen looking inward) and **Number
Ball** (numbers, with in-grid ball and cross clues).

#### Scenario: Where each mode carries its clues

- **WHEN** `CfABcBc,p` is opened as a `4n3L` board and `c2b1aOXbXb3c1OOc` as a
  `5n3B` one
- **THEN** the first has its clues on the border and none in the grid, and the
  second has numbers, balls and crosses in the grid and no border clue

### Requirement: Rules: Salad checks its markers as well as its symbols and notes against the answer

Salad's `findMistakes` SHALL be the collection's check of entries and notes
(`ts-engine`, "A mistake check compares with the one answer, hidden or not"
and "A candidate note that excludes the answer is a mistake"), the answer
being the solver's from the fixed clues. A marker is an entry to it: it SHALL
report an empty marker where a symbol belongs and a not-empty marker where an
empty square belongs, and the note that a square might be empty is a
candidate like any other.

#### Scenario: A ball on a square that stays empty

- **WHEN** the player marks as holding a symbol a square the answer leaves
  empty, and mistakes are checked
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

### Requirement: Generation: Salad has two difficulties, over the Latin deductions and its border clue's

Salad SHALL offer two tiers. To the shared Latin deductions its solver SHALL
add the border-clue deduction, in ABC End View mode. Easy SHALL be that
deduction and the shared positional and numeric eliminations, and Normal
SHALL add the shared set elimination and forcing chains.

#### Scenario: A Normal board genuinely needs the Normal tier

- **WHEN** a board generated at Normal is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at Normal does

### Requirement: Solver: Salad's solver reasons about the empty square directly

Salad's solver SHALL declare the empty square to the shared cube as its repeated
symbol: `nums + 1`, appearing `order − nums` times per line. A cross SHALL be
that symbol placed and a ball that symbol struck. The empty-square deductions
SHALL be the cube's own: the solver SHALL NOT translate between holes and
candidates at the game's edge, nor keep a hand-written sync-and-count layer.
The Number Ball quality gate, whether the holes fall out with no number
entered, SHALL be asked of that cube.

#### Scenario: The empty square is reasoned about directly

- **WHEN** the solver deduces a placement that turns on where empty squares can
  and cannot go
- **THEN** that deduction is expressed over the shared cube's repeatable symbol,
  with no translation step at the game boundary

#### Scenario: A line that can hold its empties in only one way

- **WHEN** exactly `order − nums` squares of a line can still be empty
- **THEN** the cube's positional elimination places the empty-square symbol in
  each of them

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
entering a symbol, an empty marker, or a not-empty marker.

#### Scenario: Entering a symbol places it in the selected cell

- **WHEN** a cell is selected in ink mode and a valid symbol key is pressed
- **THEN** that symbol is placed in the cell and the cell is no longer empty

### Requirement: Controls: Salad's Mark-all pencils nothing into a square marked empty

Salad's fill-all-candidates action SHALL be the collection's Mark-all
(`engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate
rule"), from its `markAll` hook, with one departure: a square marked empty is
not an empty cell to it, and takes no marks.

#### Scenario: Filling in the candidates of an untouched board

- **WHEN** the action is taken on a board that carries no pencil marks
- **THEN** every square that is neither filled nor marked empty is penciled
  with its candidates

### Requirement: Controls: Salad refuses an entry on a given, and a marker its square contradicts

A square the puzzle filled with a symbol or a cross SHALL take no entry. An
empty marker on a square whose clue is a ball SHALL be refused in either mode,
since that square is not empty. A not-empty marker entered in notes mode SHALL
make no pencil mark: on a blank square it SHALL set the real marker, on one so
marked and holding no symbol clear it, and on a square marked empty leave it
as it is. A penciled symbol or empty marker SHALL toggle its mark.

#### Scenario: An empty marker on a given cross

- **WHEN** the keyboard cursor is on a given cross and the empty marker's key is
  pressed
- **THEN** no move is made

#### Scenario: An empty marker on a ball

- **WHEN** the keyboard cursor is on a square whose clue is a ball and the
  empty marker's key is pressed, with notes mode on or off
- **THEN** no move is made

#### Scenario: A penciled not-empty marker on a square marked empty

- **WHEN** notes mode is on, the cursor is on a square marked empty, and the
  not-empty marker's key is pressed
- **THEN** the square stays marked empty and Undo gains nothing

### Requirement: Controls: Salad types a symbol by its letter or its digit in either mode

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

### Requirement: Hint: Salad's hint is the candidate walk's, with steps of its own that enter a marker

Salad's hint SHALL be a plan of the shared candidate walk
(`engine-candidate-hints`, "A shared candidate-elimination hint plan"), its
marks those of its legend (`hintMarks`). Beside the walk's note steps and
placements, a step of Salad's own SHALL settle a square's emptiness by
entering an empty or a not-empty marker.

#### Scenario: A count that settles two squares

- **WHEN** one line's count settles two blank squares as empty
- **THEN** the plan holds a step for each, whose move enters the empty marker
  in its square and strikes or writes no pencil mark

### Requirement: Hint: Salad's hint narrates the hole and symbol synchronization in its own terms

The hint SHALL narrate the hole/symbol synchronization in its own terms: a
square that can hold no symbol must be empty, and a square that cannot be empty
must hold a symbol, even when which symbol is not yet known.

#### Scenario: A square's notes come down to the empty mark

- **WHEN** a square's pencil notes hold the "might be empty" mark alone
- **THEN** the hint's step marks the square empty, and explains that the
  empty-square mark is the only one left

### Requirement: Hint: Salad's hint narrates the per-line count in its own terms

The hint SHALL narrate the per-line count in its own terms: once a line's empty
squares are all marked, every other square in it holds a symbol, and once its
symbols are all placed, every square still blank in it is empty.

#### Scenario: A line whose empty squares are all found forces the rest

- **WHEN** a line already carries as many empty-square markers as it may hold
- **THEN** the hint's step marks the line's remaining blank squares as holding a
  symbol, and explains that the line's empty squares are already accounted for

### Requirement: Hint: Salad's hint narrates the border clue in its own terms

In ABC End View mode only, the hint SHALL narrate the border clue in its own
terms. Near the clue, no symbol other than the clue's may appear until the first
square that is not known-empty. Beyond the clue's reach, which is bounded by how
many empty squares the line may still hold, the clue's own symbol is ruled out.

#### Scenario: A border clue's deduction names the clue and its line of sight

- **WHEN** a hint's next deduction follows from a border clue
- **THEN** the step explains what the clue sees and why that rules the candidate
  in or out, and highlights the clue together with the squares along the line it
  reasons about

### Requirement: Hint: Salad's hint strikes a circled square's empty-square mark wherever the circle came from

Salad's hint SHALL offer the strike of a circled square's "might be empty"
pencil mark as a firing of its own whenever the board holds one, as well as the
leg that follows a circle the hint itself places. A circle reaches the board
without that leg when the player places it, or takes the hint's circle step and
then goes their own way, and the mark would then hide the placement behind it.

#### Scenario: The hint's own circle, recomputed

- **WHEN** the hint is walked one first step at a time, so each circle is placed
  without the leg that tidies it
- **THEN** the walk strikes the leftover mark and reaches a solved board

#### Scenario: The player's circle

- **WHEN** the player circles a square whose marks still include "might be
  empty", and the circle is right
- **THEN** the hint's next step strikes that mark, and the walk reaches a
  solved board

### Requirement: Hint: A set or a chain that rules a square out as empty strikes its mark

Where a set elimination or a forcing chain rules a square out as empty, no count
says it, so the hint SHALL strike that square's "might be empty" pencil mark with
the set or chain as its reason, and SHALL then mark the square as holding a
symbol because the mark is gone from its notes.

#### Scenario: A set holds all of a column's empty squares

- **WHEN** a hint is requested on the Number Ball board
  `5n3Bdx:c2b1aOXbXb3c1OOc`, where three squares of one column can hold only
  one number and the column's two empty squares
- **THEN** the hint returns a plan, a step of it strikes the "might be empty"
  mark from another square of that column and names the set and the column's
  empty squares as the reason, a later step marks that square as holding a
  number, and following the plan solves the board

#### Scenario: The mark is gone from a square's notes

- **WHEN** a square with pencil marks has lost its "might be empty" mark and
  carries no marker
- **THEN** the hint's step marks it as holding a symbol and says the mark is
  not among the square's pencil marks

### Requirement: Hint: Salad's hint prints the "might be empty" mark as X

A sentence that names the "might be empty" mark among a square's candidates
SHALL print it as the X the player pencils for it, never as a letter or a number
past the board's symbols.

#### Scenario: A chain runs through the "might be empty" mark

- **WHEN** a board with one empty square per line reaches a forcing chain whose
  squares include the "might be empty" mark among their two candidates
- **THEN** the sentence prints that mark as X and counts the squares'
  candidates as pencil marks

### Requirement: Hint: Salad's hint counts a line before it asks for pencil marks

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

### Requirement: Hint: Salad's hint pencils the candidates in and offers no other reading

Salad's hint SHALL walk the populate reading only: before its first step
that reads a pencil mark, it SHALL pencil the candidates into every undecided
square that has none, by the fill-all action, and it SHALL NOT write a
square's marks one square at a time. Salad SHALL NOT offer the `hint-notes`
preference, because the "might be empty" mark is a candidate no row or column
rules out.

#### Scenario: Salad has no hint-notes preference

- **WHEN** Salad's preferences are listed
- **THEN** `hint-notes` is not among them

#### Scenario: No step writes one square's marks

- **WHEN** a hint plan is built on a board with no pencil marks whose first
  deduction is a border clue's
- **THEN** the step before it is the fill-all, and no step of the plan
  pencils marks into a single square

### Requirement: Hint: Salad's hint takes a marker on the board as settled

Salad's hint SHALL reason from the symbols and the empty and not-empty
markers on the board, the player's included, since the mistake check flags a
wrong one, and SHALL NOT take the player's pencil marks as facts. A square
marked empty or not-empty SHALL count as decided: the hint SHALL give no step
that settles it again, and SHALL NOT hold back a step whose reason reads that
square.

#### Scenario: The player's cross is counted

- **WHEN** the player correctly marks a blank square empty, so that its row
  now shows all its empty squares, and asks for a hint
- **THEN** no step of the plan marks that square, and a step may rest on the
  row holding all its empty squares

#### Scenario: A pencil mark is not a fact

- **WHEN** the player strikes pencil marks the board does not yet rule out,
  none of them a square's answer, and asks for a hint
- **THEN** every step's reason holds on the symbols, markers and clues alone,
  and the plan solves the board

### Requirement: Status bar: Salad's status bar shows the range of its symbols

The status bar SHALL show the board's symbols as a range: `A~` and the last
letter in ABC End View, `1~` and the last number in Number Ball. A preset's
label SHALL name the symbols in the same words.

#### Scenario: The two modes

- **WHEN** a `4n3L` board and a `5n3B` board are on screen
- **THEN** the status bar reads `A~C` on the first and `1~3` on the second

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

In ABC End View mode a ball SHALL show its square's surface through it; in
Number Ball mode a given ball's inside SHALL be paper and the player's the
entry color as a wash. The hint's marks SHALL stay on the square's border.

#### Scenario: A ball the player marked, in each mode

- **WHEN** a blank square that is not selected, and that the player has marked
  as holding a symbol, is drawn
- **THEN** in ABC End View mode the inside of its ball is the cell surface
- **AND** in Number Ball mode it is the entry color's wash
