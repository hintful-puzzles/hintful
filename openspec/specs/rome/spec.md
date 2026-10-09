# rome Specification

## Purpose
Rome, the puzzle of filling empty cells with arrows so that no outlined area
repeats an arrow and following the arrows from anywhere leads to a goal, with
pencil marks and a mistake check that also reports an arrow which breaks no
rule but contradicts the unique solution.

## Requirements

### Requirement: Rome game implements the Game interface

The engine SHALL provide `src/games/rome/` implementing the `Game` interface
for Rome (Nikoli's *Roma*), registered so the puzzle is served by the
TypeScript engine. Because a Rome board has one solution and every difficulty
tier is pure deduction, the game SHALL implement `findMistakes`, and Check &
Save SHALL hard-block while any mistake is present.

#### Scenario: A mistake blocks the save

- **WHEN** Check & Save is run on a board `findMistakes` reports a mistake on
- **THEN** the save is refused

### Requirement: Rome's parameters

Parameters SHALL be a width, a height, and a difficulty (Easy, Normal or
Tricky). Validation SHALL require a width of at least 3, a height of at least
3, and a difficulty within range. A game ID SHALL encode the width, the height
and the difficulty and round-trip through decode, treating an absent `x` as a
square board.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered

### Requirement: Rome's two highlight preferences

Rome SHALL offer two highlight preferences: one highlighting the squares whose
arrows reach a goal, on by default, and one highlighting the squares of a
loop, off by default.

#### Scenario: A new game starts with the defaults

- **WHEN** a game is started with no stored preference
- **THEN** the squares whose arrows reach a goal are highlighted and the
  squares of a loop are not

### Requirement: Rome descriptions use the region-border and clue encoding

A Rome description SHALL encode the outlined-region layout as a run-length
list over the inter-cell edges: a decimal number for a run of walls and a
letter for a run of non-walls, with the letter `z` denoting a maximal run with
no trailing wall. The clue grid SHALL follow as a run-length sequence in which
a letter denotes a run of empty squares and the characters `U`, `D`, `L`, `R`
and `X` denote fixed up, down, left and right arrows and goals.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board and
  re-encoded
- **THEN** the resulting description is identical

### Requirement: Rome rejects a description that breaks its shape

Validation SHALL reject a description that uses invalid region-border
characters, that uses invalid clue characters, that contains a region larger
than four cells, or that places a goal in a region whose size is not exactly
one.

#### Scenario: A goal in an oversized region is rejected

- **WHEN** a description placing a goal in a region larger than a single cell is
  validated
- **THEN** it is rejected

### Requirement: Rome places an arrow or a mark by drag or by keyboard cursor

Rome SHALL be played by grabbing a square and dragging a direction to place an
arrow, by right-dragging or using the pencil key to toggle a pencil mark, or by
moving a keyboard cursor and placing an arrow or a mark.

#### Scenario: Dragging a direction places an arrow

- **WHEN** a non-fixed square is grabbed and a direction is dragged and released
- **THEN** an arrow in that direction is placed in the square

### Requirement: An input that changes nothing adds no history

A move onto a fixed clue, a move off the grid, or a placement that repeats the
existing arrow SHALL produce no state change and no history entry.

#### Scenario: A fixed clue cannot be grabbed

- **WHEN** a square holding a fixed arrow is pressed
- **THEN** no move is made and the board is unchanged

### Requirement: Pencil marks are part of Rome's state

Pencil marks SHALL be part of the state and SHALL round-trip through the save
codec.

#### Scenario: A saved game keeps its marks

- **WHEN** a game holding pencil marks is saved and loaded
- **THEN** every square carries the marks it had

### Requirement: Rome is complete when every arrow leads to a goal

Placing an arrow SHALL show it. Completing the board SHALL report the game
solved, and a board is complete when every square is filled with arrows
leading to a goal, with no loop, no off-grid arrow and no duplicate arrow
within a region.

#### Scenario: Completing the grid wins

- **WHEN** the final arrow is placed so every square leads to a goal with no loop
  and no duplicate arrow in any region
- **THEN** the game is reported solved and flashes

### Requirement: What Rome draws

Rendering SHALL draw the region outlines, arrows and goals, pencil marks in
the cell quadrants, an optional highlight of squares whose arrows reach a goal,
an inline error tint on the square of an off-grid arrow, a duplicate arrow
the player placed in the error color, and a completion flash. There SHALL be no interpolated arrow
animation.

#### Scenario: An arrow appears at once

- **WHEN** an arrow is placed
- **THEN** the next frame shows it whole, with no animation between

### Requirement: Rome's solver deduces and never guesses

Rome SHALL provide a solver that fills the grid by pure deduction, or reports
that the board is invalid or incomplete. The solver SHALL apply its deduction
rules gated by difficulty: the Easy rules, then the additional Normal rules,
then the additional Tricky rule. It SHALL NOT backtrack or guess at any
difficulty.

#### Scenario: The solver completes a soluble board without guessing

- **WHEN** a soluble board is solved at its difficulty
- **THEN** every square is filled by deduction and the result reaches a goal from
  every square with no loops and no duplicate arrows in any region

### Requirement: Rome judges validity with a forest of arrows

Validity SHALL be judged by merging each arrow with the square it points at
into a disjoint-set forest and flagging any arrow that points off the grid,
any duplicate arrow within an outlined region, and any arrow that forms a
loop.

#### Scenario: Arrows that chase each other are a loop

- **WHEN** two adjacent squares hold arrows pointing at each other
- **THEN** both arrows are flagged as a loop and the board is not valid

### Requirement: Rome's generator keeps every board soluble at its tier

The generator SHALL use the solver to keep every board soluble. It SHALL fill
the grid with arrows in single-cell regions, merge outlined regions randomly
while keeping arrows within a region distinct, and remove redundant clues. It
SHALL accept a board only when it is soluble at the target difficulty and not
soluble at the difficulty below.

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset or legal size and difficulty
- **THEN** a board is produced that is solvable by pure deduction at exactly that
  difficulty

### Requirement: Rome generation is reproducible from a seed

Generation from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same size, difficulty and seed are used twice
- **THEN** both runs produce the identical board description

### Requirement: Mistake-checking reports the rule violations the board shows

Mistake-checking SHALL report the rule violations the board already shows as
the player works: an arrow pointing off the grid, an arrow duplicated inside
an outlined region, and an arrow that forms a loop.

#### Scenario: A duplicate arrow in a region is flagged as a mistake

- **WHEN** two squares in the same outlined region hold the same arrow direction
- **THEN** `findMistakes` flags both squares and Check & Save is hard-blocked

### Requirement: Rome mistake-checking covers arrows and marks that break no rule

Mistake-checking SHALL report, separately from the rule violations, any arrow
the player has placed that contradicts the puzzle's unique solution even
though it breaks no rule. The unique solution SHALL be re-derived from the
fixed clues alone, never from anything the player has entered, and when the
board is not deducible from those clues no contradiction SHALL be reported.

#### Scenario: A legal-looking arrow that contradicts the solution is flagged

- **WHEN** an arrow is placed that breaks no rule but differs from the unique
  solution's arrow for that square
- **THEN** it is reported as a mistake and Check & Save is hard-blocked

### Requirement: Marks that rule out the answer are a mistake

A pencil mark SHALL claim that its arrow is still possible for that square, so
an empty square whose marks are non-empty and exclude the solution's arrow
SHALL be reported as a mistake of its own kind, `note`. An empty square
carrying no marks SHALL NOT be reported as a mistake.

#### Scenario: Marks that rule out the answer are a mistake

- **WHEN** an empty square carries pencil marks that exclude the solution's
  direction for that square
- **THEN** a `note` mistake is reported for that square and Check & Save is
  hard-blocked

#### Scenario: A square with no marks at all is not a mistake

- **WHEN** an empty square carries no pencil marks
- **THEN** no mistake is reported for it, because it is claiming nothing

### Requirement: Rome fills and cleans candidate marks in one press

Rome SHALL answer the Mark-all press and declare `canMarkAll`. The press SHALL
be adaptive: while any empty square has no marks it SHALL fill every such
square with the arrows that square could legally hold, and otherwise it SHALL
strike from each empty square every arrow already placed in that square's own
outlined region, returning no move when there is nothing left to strike.

#### Scenario: A later press removes only, and converges

- **WHEN** Mark-all is pressed repeatedly on a fully marked board
- **THEN** each press only ever removes marks, and a press on a fully cleaned
  board is a true no-op that adds no history entry

### Requirement: The arrows a square can hold are counted per square

The set of arrows a square can legally hold SHALL be per square: all four less
any that would point off the grid. It SHALL be the same set the solver seeds
its candidates with and the hint's populate step fills. The Mark-all fill
SHALL be additive: a square the player has already narrowed keeps its marks.

#### Scenario: The first press fills only what the grid's edges allow

- **WHEN** Mark-all is pressed on a board with unmarked empty squares
- **THEN** every such square gains the arrows it could legally hold, a top-row
  square gains no up arrow, and a square the player had already narrowed is left
  bit-for-bit alone

### Requirement: Rome explains its next deduction

Rome SHALL provide an explained `hint()` meeting the project's hint quality
bar, built on the shared candidate-elimination plan. A hint SHALL refuse on a
solved board and on a board the mistake check flags, and SHALL otherwise
narrate the next forced move by the premise that forces it, in Rome's own
vocabulary of arrows, squares and areas.

#### Scenario: A hint can be followed to a finished board

- **WHEN** the hint's move is applied repeatedly from any mid-game position
- **THEN** the board reaches a solved state, and every step changes the board
  when it is reached

### Requirement: A Rome hint rests on what the player can see or mark

Every sentence of a hint SHALL rest only on facts the player can see on the
board or record with Rome's own marks. A step's evidence SHALL be marked on
the board, the squares it reasons from by an outline and an area it names by
stripes, and the square the step acts on SHALL be ringed rather than filled.

#### Scenario: The square a step decides is ringed

- **WHEN** a hint step that places an arrow is shown
- **THEN** the square it acts on is ringed and not filled

### Requirement: A walk in a Rome hint is numbered square by square

Where a firing's premise is a walk, an arrow chain that leads back to the
square being struck, the chain SHALL be outlined in order, numbered, so the
claim the sentence makes is one the player can follow square by square. The
chain SHALL be computed rather than assumed.

#### Scenario: A deduction is narrated by its premise, not by its move

- **WHEN** the hint's next step strikes an arrow that would close a loop
- **THEN** the sentence states that following the arrows from the named
  neighboring square leads back to this one, and the arrow chain is outlined in
  order with each square's place in the walk drawn on it

### Requirement: The hint's recorder changes nothing the solver decides

The hint SHALL derive its script from a recording projection of Rome's own
solver. That projection SHALL NOT change any deduction the solver makes,
because the generator keeps a blanked clue only while the solver still
finishes the board, and so every published description depends on the solver's
verdict on every intermediate clue set.

#### Scenario: The recorder changes nothing the solver decides

- **WHEN** a board is solved with the recorder attached and again without it
- **THEN** both runs finish with the same grid and the same candidate set,
  square for square

### Requirement: Rome offers one key per arrow, and a Clear key

Rome SHALL offer an on-screen key for each of the four arrows, and a Clear key.
Pressing an arrow key SHALL place that arrow in the selected square, or toggle
it as a mark while notes mode is on; Clear SHALL empty whichever of the two the
mode is entering. Dragging a direction out of a square SHALL keep working as it
does without the keys: the keys are a second way in and SHALL NOT replace the
drag.

#### Scenario: A square is entered without dragging

- **WHEN** an empty, non-fixed square is tapped and an arrow key is pressed
- **THEN** that arrow is placed in it

#### Scenario: The same key marks while notes mode is on

- **WHEN** notes mode is armed, a square is tapped, and an arrow key is pressed
- **THEN** that arrow is toggled as a pencil mark rather than placed, and Clear
  empties the square's marks rather than its arrow

### Requirement: A tap that commits no move selects the square

A press and release on one square that commits no move SHALL select that
square, in both modes. Rome's keys act at the keyboard cursor, and a player
without a keyboard has no other way to put the cursor anywhere, so without the
selection the keys cannot be reached at all.

#### Scenario: A tap that commits nothing still selects

- **WHEN** a press and release land on the same square, in either mode
- **THEN** no move is made and the cursor is left on that square

### Requirement: A Rome selection follows the note-taking cell's rule

What a tap's selection does to the highlight and to notes mode SHALL be the
note-taking cell's rule, with the button the gesture used: a right tap selects
for notes, or latches them with the sticky preference, and the highlight shows
only where the mode could write. A mouse-driven highlight SHALL go away after
an arrow is placed and stay through a mark, as the note-taking games' does.

#### Scenario: Placing an arrow lets the highlight go

- **WHEN** a square is selected by a tap, with notes mode off, and an arrow key
  places an arrow in it
- **THEN** the square's highlight goes away

### Requirement: The selected square is drawn with the note-taking cell's picture

The selected square SHALL be drawn with the note-taking cell's picture. A
keyboard cursor armed to await a direction SHALL additionally show a `?` in the
ink of the arrow or the mark that direction will make, which is what tells an
armed cursor from a resting one.

#### Scenario: An armed cursor prompts for its direction

- **WHEN** the keyboard cursor is armed to place an arrow, or to place a mark
- **THEN** the square shows the entry wash or the notes triangle respectively,
  with a `?` in the ink the arrow or the mark will take

### Requirement: Rome refuses a pencil mark pointing off the grid

Rome SHALL refuse a pencil mark for an arrow that points off the grid, on every
way into notes: the armed keyboard cursor, a typed or on-screen arrow key in
notes mode, and a pencil drag. Such a drag SHALL preview no mark, and its
release SHALL select the square as a drag that commits nothing does. Mark-all
never offers that mark and the solver never considers that arrow, so a hint
meeting one would have no strike to teach.

#### Scenario: Each way into notes refuses an off-grid mark

- **WHEN** the player, in notes mode on a top-row square, presses up with the
  armed cursor, presses the up arrow key, or pencil-drags off the top edge
- **THEN** no move is made, and the drag previews no mark

### Requirement: A replayed off-grid mark leaves no note

Executing a pencil move SHALL leave no mark pointing off the grid, so a move
log that holds such a mark replays without one.

#### Scenario: A replayed off-grid mark leaves no note

- **WHEN** a pencil move for an arrow pointing off the grid is executed
- **THEN** the square's marks are unchanged by it

#### Scenario: The hint survives a move log ending in an off-grid mark

- **WHEN** the hint is asked on a board after a move log that ends in a pencil
  mark pointing off the grid
- **THEN** the hint answers instead of throwing

### Requirement: An arrow placed pointing off the grid stays a move

Placing an arrow that points off the grid as a real entry SHALL remain a move,
which the board flags as an error.

#### Scenario: An up arrow in the top row is placed and flagged

- **WHEN** an up arrow is placed in a top-row square
- **THEN** the arrow is placed, and the square is flagged as an error

### Requirement: Rome draws its squares on a quiet surface and keeps its outlines

`redraw` SHALL draw every square the player fills on the collection's cell
surface, and a square holding an arrow the puzzle fixed, or a goal, on the
collection's lifted surface of a given, with the fixed arrow in ink and the
player's in the entry color. The line between two squares of one region SHALL
be the collection's surface grid line.

#### Scenario: A fixed arrow is told by the square under it

- **WHEN** the opening frame of a board is drawn
- **THEN** every square holding a fixed arrow is the lifted surface and every
  empty square is the plain cell surface

### Requirement: A region's outline is content

A region's outline, the frame round the board included, is content: it SHALL
stay in ink at its full width, and where two outlines turn round a square's
corner they SHALL meet in a solid corner.

#### Scenario: An outline is stronger than a grid line

- **WHEN** a board with a region of two or more squares is drawn
- **THEN** the line between two squares of that region is the surface's grid
  line
- **AND** the line between two regions is ink

### Requirement: Rome's goal takes the color for where the player is going

A goal SHALL be a disc in the collection's color for where the player is going
(the theme pair's second member), and the tint of a square whose arrows reach
a goal SHALL be that color's wash, so the squares that are settled take the
goal's hue. That tint, the error tint and the selected square's wash SHALL
each replace the square's surface.

#### Scenario: A settled square takes the goal's hue

- **WHEN** a square whose arrows reach a goal is drawn with that highlight on
- **THEN** the square is filled with the goal color's wash in place of its
  surface

### Requirement: Rome's completion flash sweeps the board

The completion flash SHALL sweep a bright beat and a dim beat across the board
over each square's own surface, in colors that read in both schemes.

#### Scenario: The flash moves

- **WHEN** the completion flash is drawn at two different beats
- **THEN** the frames differ, and a frame shows both the bright and the dim beat
