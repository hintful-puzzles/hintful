# salad Specification

## Purpose
Salad, the Latin-square puzzle in which some squares stay empty, clued mainly by
the letter seen first from each edge in ABC End View mode, or by balls and
crosses in Number Ball mode. Its solver is a consumer of the shared Latin-square
solver that reasons about the empty square directly, its tiers are graded, and
its hint is explained as pencil-note deductions.

## Requirements

### Requirement: Salad game implements the Game interface

The engine SHALL provide `src/games/salad/` implementing the `Game` interface
for Salad, registered so the puzzle is served by the TypeScript engine. Salad
SHALL support both of its game modes: **ABC End View** (letters, with clues on
the grid's borders naming the first character seen looking inward) and **Number
Ball** (numbers, with in-grid ball and cross clues).

#### Scenario: Every preset produces a uniquely-solvable board

- **WHEN** a new game is generated for any preset or legal size, in either mode
- **THEN** a board is produced whose clues admit exactly one completion under the
  solver at the puzzle's difficulty

### Requirement: Salad's parameters

Parameters SHALL be a grid size (`order`), a symbol count (`nums`), a game mode,
and a difficulty. The bounds the params declare SHALL hold `order` to at least 3
and `nums` to at least 2 and at most 9, and `validateParams` SHALL refuse a
`nums` that is not less than `order`. A game ID SHALL encode the size, symbol
count, mode and difficulty and round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same size, symbol count, game mode and difficulty are recovered

#### Scenario: As many symbols as the size

- **WHEN** parameters whose `nums` equals their `order` are validated
- **THEN** `validateParams` refuses them

### Requirement: Salad declares a mistake check and an on-screen keypad

Salad SHALL declare a `findMistakes` hook, because it has a unique solution, and
SHALL surface its `nums` symbol keys plus the empty and not-empty markers as an
on-screen keypad.

#### Scenario: The keypad of a three-symbol board

- **WHEN** the keys are requested for a board of three symbols
- **THEN** they hold the three symbol keys in the mode's own characters, and the
  X and O marker keys

### Requirement: Salad descriptions use the upstream run-length block encoding

A Salad description SHALL encode its clue arrays in canonical order using a
run-length block encoding: a run of empty squares as a single lowercase letter,
an empty-marker square as `X`, a must-contain-a-symbol square as `O`, and a
symbol as a character offset from a per-array base. In ABC End View mode the
description SHALL be the border clues, a comma, then the grid clues; in Number
Ball mode it SHALL be the grid clues alone.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Salad description is validated against its arrays

Validation SHALL reject a description that carries more or fewer squares than
the relevant array holds, with a message that tells too many from too few, one
that contains an out-of-range clue value, and one that uses an unknown
character. The messages SHALL be the collection's shared description errors.

#### Scenario: A description with the wrong number of squares is rejected

- **WHEN** a description carrying more or fewer squares than its array has cells is
  validated
- **THEN** it is rejected with a message distinguishing too much from too little

### Requirement: Salad ports the solver as a shared Latin-square consumer

Salad SHALL provide a solver built on the shared `engine/latin.ts` framework,
adding as its own deduction the border-clue deduction, in ABC End View mode. The
solver SHALL provide two difficulties, Easy and Normal, and both SHALL be
solvable by pure deduction without guessing.

#### Scenario: The solver deduces the unique solution without guessing

- **WHEN** a generated board is solved at its difficulty
- **THEN** the solver reaches the unique completion using only its deductive
  techniques, never backtracking search

### Requirement: Salad's solver reasons about the empty square directly

Salad's solver SHALL declare the empty square to the shared cube as its repeated
symbol: `nums + 1`, appearing `order − nums` times per line. A cross SHALL be
that symbol placed and a ball that symbol struck, and the board's marker array
SHALL be read back off the solved cube. The solver SHALL NOT translate between
holes and candidates at the game's edge.

#### Scenario: The empty square is reasoned about directly

- **WHEN** the solver deduces a placement that turns on where empty squares can
  and cannot go
- **THEN** that deduction is expressed over the shared cube's repeatable symbol,
  with no translation step at the game boundary

### Requirement: Salad's empty-square deductions are the shared cube's own

The empty-square deductions SHALL be the shared cube's own: positional
elimination with the symbol's multiplicity, numeric elimination, the line strike
once a line holds all its empties, and multiplicity-aware set elimination. They
SHALL NOT be a hand-written sync-and-count layer. The Number Ball quality gate, which asks
whether the holes fall out with no number entered, SHALL ask it of that cube.

#### Scenario: A line that can hold its empties in only one way

- **WHEN** exactly `order − nums` squares of a line can still be empty
- **THEN** the cube's positional elimination places the empty-square symbol in
  each of them

### Requirement: Salad's generator strips clues while the board stays uniquely solvable

The generator SHALL use the solver to keep every board uniquely solvable: it
SHALL generate a full Latin square, then remove clues in a randomized order,
keeping a removal only while the puzzle stays uniquely solvable at the target
difficulty. Generation from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

### Requirement: Salad's Normal tier is never soluble at Easy

A Salad board generated at Normal SHALL NOT be soluble at Easy.

#### Scenario: A Normal board genuinely needs the Normal tier

- **WHEN** a board generated at Normal is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at Normal does

#### Scenario: A generated board is uniquely solvable at its stated tier

- **WHEN** a board is generated at any tier
- **THEN** the solver finds exactly one solution, and finds it at that tier and
  not at the tier below

### Requirement: Salad's generation retry bound outlasts a legal seed

The generation retry bound SHALL be set high enough that a legal seed cannot
exhaust it, since Normal boards are rare in the Number Ball mode and exhaustion
is a failure a player sees.

#### Scenario: A Normal Number Ball board is dealt

- **WHEN** the Normal preset of the Number Ball mode is dealt
- **THEN** generation returns a board and does not run its retry bound out

### Requirement: Salad selects a square and enters a symbol or a marker

Salad SHALL be played by selecting a cell and entering a symbol, an empty marker,
or a not-empty marker, with pencil marks available for tentative notes. With the
sticky pencil preference off, a left press SHALL select a cell for ink entry and
a right press for pencil entry; with it on, a right press SHALL switch pencil
mode and a left press SHALL select in the mode that is on. The arrow keys SHALL
move a keyboard cursor and the select key SHALL toggle between ink and pencil
entry.

#### Scenario: Entering a symbol places it in the selected cell

- **WHEN** a cell is selected in ink mode and a valid symbol key is pressed
- **THEN** that symbol is placed in the cell and the cell is no longer empty

### Requirement: Salad offers a fill-all-candidates action

A fill-all-candidates action SHALL be available.

#### Scenario: Filling in the candidates of an untouched board

- **WHEN** the action is taken on a board that carries no pencil marks
- **THEN** every square that is neither filled nor marked empty is penciled
  with its candidates

### Requirement: A Salad move that would not change the board is a no-op

A move that would not change the board SHALL be a no-op.

#### Scenario: An empty marker on a given cross

- **WHEN** the keyboard cursor is on a given cross and the empty marker's key is
  pressed
- **THEN** no move is made

### Requirement: Salad flags mistakes against the unique solution

Salad SHALL flag mistakes on demand: given the board, `findMistakes` SHALL
re-solve from the fixed clues and report every player entry that contradicts the
unique solution: a wrong symbol, an empty marker where a symbol belongs, and a
not-empty marker where an empty square belongs. It SHALL also report every empty
cell whose pencil notes have crossed out its solution value.

#### Scenario: Check flags a contradicting entry

- **WHEN** the board holds a player entry that contradicts the unique solution and
  mistakes are checked
- **THEN** that entry is reported as a mistake and highlighted

### Requirement: Salad is solved when every line and every border clue is satisfied

The game SHALL be reported solved and SHALL flash when every line holds each
symbol exactly once with the correct empty squares and all border clues are
satisfied.

#### Scenario: Completing every line to the rules wins

- **WHEN** the last entry makes every row and column hold each symbol once with the
  correct empty squares, satisfying all clues
- **THEN** the game is reported solved and flashes

### Requirement: What Salad draws

Rendering SHALL draw symbols, balls and crosses, pencil-mark candidate grids,
border clues in the surrounding margin, a live highlight of rule violations, and
a completion flash. Rendering SHALL aim at a neat presentation and SHALL NOT be
held to pixel parity with upstream's.

#### Scenario: A symbol repeated in a line

- **WHEN** the player enters a symbol a second time in one row
- **THEN** each copy the player entered is drawn in the error color while the
  board is still in play

### Requirement: Salad explains every hint as a pencil-note deduction

Salad SHALL implement the `hint` hook as a **candidate-elimination** hint: the
plan sets and strikes pencil notes, settles a square's emptiness with an
empty/not-empty marker, and places a symbol at the moment a square's notes
collapse to one. Every step SHALL explain *why* its move is forced in terms of
the board the player can see, never merely naming the move.

#### Scenario: One deduction forcing several squares is one hint

- **WHEN** a single deduction forces changes to more than one square
- **THEN** they are presented as one multi-leg hint journey rather than several
  unrelated hints

### Requirement: Salad's hint narrates the hole and symbol synchronization in its own terms

The hint SHALL narrate the hole/symbol synchronization in its own terms: a
square that can hold no symbol must be empty, and a square that cannot be empty
must hold a symbol, even when which symbol is not yet known.

#### Scenario: A square's notes come down to the empty mark

- **WHEN** a square's pencil notes hold the "might be empty" mark alone
- **THEN** the hint's step marks the square empty, and explains that the
  empty-square mark is the only one left

### Requirement: Salad's hint narrates the per-line count in its own terms

The hint SHALL narrate the per-line count in its own terms: once a line's empty
squares are all marked, every other square in it holds a symbol, and once its
symbols are all placed, every square still blank in it is empty.

#### Scenario: A line whose empty squares are all found forces the rest

- **WHEN** a line already carries as many empty-square markers as it may hold
- **THEN** the hint's step marks the line's remaining blank squares as holding a
  symbol, and explains that the line's empty squares are already accounted for

### Requirement: Salad's hint narrates the border clue in its own terms

In ABC End View mode only, the hint SHALL narrate the border clue in its own
terms. Near the clue, no symbol other than the clue's may appear until the first
square that is not known-empty. Beyond the clue's reach, which is bounded by how
many empty squares the line may still hold, the clue's own symbol is ruled out.

#### Scenario: A border clue's deduction names the clue and its line of sight

- **WHEN** a hint's next deduction follows from a border clue
- **THEN** the step explains what the clue sees and why that rules the candidate
  in or out, and highlights the clue together with the squares along the line it
  reasons about

### Requirement: Salad's hint narrates the Latin deductions it inherits and needs no fallback

The generic Latin deductions Salad inherits (forced singles, duplicate
elimination, set elimination and forcing chains) SHALL be narrated too, so no
accepted board can reach a step the hint cannot explain. Because both of Salad's
difficulties are solvable by pure deduction, the hint SHALL never need a
non-deductive fallback step.

#### Scenario: A Normal board is walked to its end

- **WHEN** the hint is followed step by step on a board dealt at Normal
- **THEN** every step carries its reason, and the walk reaches a solved board
  with no step that guesses

### Requirement: A Salad hint is refused on a wrong or a complete board

A hint SHALL be refused, with the board's mistakes highlighted, when the current
board contradicts the unique solution, and SHALL be refused when the board is
already complete.

#### Scenario: A hint is refused while the board holds a mistake

- **WHEN** a hint is requested on a board that contradicts the unique solution
- **THEN** no plan is shown, the contradicting squares are highlighted, and the
  refusal says a mistake must be fixed first

### Requirement: Salad's hint plan is recomputable from any position

The hint plan SHALL be recomputable from any mid-game position: a plan computed
after the player has made some of its moves by hand SHALL neither repeat those
moves nor stall.

#### Scenario: A hint plan resumes from a partly-followed position

- **WHEN** the player performs some of a plan's moves by hand and a hint is
  requested again
- **THEN** the new plan starts from the current board, repeating none of the moves
  already reflected on it

### Requirement: Computing a hint leaves Salad's generation unchanged

Computing a hint SHALL NOT change which puzzles Salad generates: the deduction
recorder the hint reads SHALL be inert on the generator's solving path.

#### Scenario: Recording a hint's deductions leaves generation unchanged

- **WHEN** a board is generated from a seed, with the hint's deduction recorder
  in the codebase
- **THEN** its description is byte-for-byte the one generated without the
  recorder

### Requirement: Salad's hint strikes a circled square's empty-square mark wherever the circle came from

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

### Requirement: Salad's hint teaches every deduction that rules a square out as empty

Salad's hint SHALL teach each deduction that rules a square out as empty, on
every board Salad deals at either difficulty. Where a line already holds all its
empty squares, the hint SHALL say so as a count and mark the line's other
squares as holding a symbol.

#### Scenario: A line holds all its empty squares

- **WHEN** a line carries every empty-square marker it may hold, and other
  squares of it are still blank
- **THEN** the hint's step gives the count as its reason and marks those squares
  as holding a symbol

### Requirement: A set or a chain that rules a square out as empty strikes its mark

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

### Requirement: Salad's hint prints the "might be empty" mark as X

A sentence that names the "might be empty" mark among a square's candidates
SHALL print it as the X the player pencils for it, never as a letter or a number
past the board's symbols.

#### Scenario: A chain runs through the "might be empty" mark

- **WHEN** a board with one empty square per line reaches a forcing chain whose
  squares include the "might be empty" mark among their two candidates
- **THEN** the sentence prints that mark as X and counts the squares'
  candidates as pencil marks

### Requirement: Salad's menu offers both of its difficulties

Salad's presets SHALL include boards at each difficulty the game deals, so a
player reaches Normal from the menu and every cross-game guard that deals from a
game's presets deals a Normal Salad board. The Normal presets SHALL be shapes
whose deal stays well under a second. The menu SHALL hold one section for each
game mode, and within a section each shape's Normal preset SHALL follow its Easy
one.

#### Scenario: Normal is on the menu

- **WHEN** Salad's preset menu is read
- **THEN** it holds presets titled Normal as well as Easy, in both game modes,
  and a shape offered at both has its Normal line straight after its Easy one

#### Scenario: A cross-game guard deals a Normal board

- **WHEN** a cross-game guard takes Salad's presets one per value of every
  field they vary
- **THEN** difficulty is one of those fields, and a Normal board is among the
  boards it deals

#### Scenario: Each mode has a section

- **WHEN** Salad's preset menu is read
- **THEN** its top level is two sections, one for each game mode, and every
  preset sits in the section of its own mode

### Requirement: Salad draws its squares on a quiet surface, with a given's lifted

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

### Requirement: Salad's selection and hint marks keep the square's surface

The selection's wash and its pencil-mode corner SHALL be drawn over whichever
surface the square has. In ABC End View mode a ball SHALL show that surface
through it; in Number Ball mode a given ball's inside SHALL be paper and the
player's the entry color as a wash. The hint's marks SHALL stay on the square's
border.

#### Scenario: A blank square is selected beside a given

- **WHEN** a blank square is selected for entry, next to a given square
- **THEN** the selection's wash is drawn on the blank square, and the given
  square keeps the lifted surface
