# rome Specification

## Purpose
Rome, the puzzle of filling empty cells with arrows so that no outlined area
repeats an arrow and following the arrows from anywhere leads to a goal. This
capability specifies its port to the TS engine, with pencil marks and
mistake-checking that also reports an arrow which breaks no rule but contradicts
the unique solution.

## Requirements

### Requirement: Rome game implements the Game interface

The engine SHALL provide `src/games/rome/` implementing the `Game`
interface for Rome (Nikoli's *Roma*), registered so the puzzle is served by the
TypeScript engine.

Parameters SHALL be a width, a height, and a difficulty (Easy, Normal or
Tricky). Validation SHALL require width at least 3 and height at least 3 and a
difficulty within range, matching upstream. A game ID SHALL encode the width,
height and difficulty and round-trip through decode, treating an absent `x` as a
square board.

Because Rome is a uniquely-solvable logic puzzle whose difficulty tiers are all
pure deduction, it SHALL implement `findMistakes`, and Check & Save SHALL
hard-block while any mistake is present.

Rome SHALL offer the two upstream highlight preferences — highlighting the
squares whose arrows reach a goal, and highlighting the squares of a loop —
with upstream's defaults (the first on, the second off).

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset or legal size and difficulty
- **THEN** a board is produced that is solvable by pure deduction at exactly that
  difficulty

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered

### Requirement: Rome descriptions use the region-border and clue encoding

A Rome description SHALL encode the outlined-region layout as a run-length list
over the inter-cell edges — a digit for a run of walls, a letter for a run of
non-walls (with the letter `z` denoting a maximal run with no trailing wall) —
followed by the clue grid as a run-length sequence in which letters denote runs
of empty squares and the characters `U`, `D`, `L`, `R` and `X` denote fixed
up/down/left/right arrows and goals.

Validation SHALL reject a description that uses invalid region-border
characters, that uses invalid clue characters, that contains a region larger
than four cells, or that places a goal in a region whose size is not exactly one.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board and
  re-encoded
- **THEN** the resulting description is identical

#### Scenario: A goal in an oversized region is rejected

- **WHEN** a description placing a goal in a region larger than a single cell is
  validated
- **THEN** it is rejected

### Requirement: Rome input, arrow placement, pencil marks and completion

Rome SHALL be played by grabbing a square and dragging a direction to place an
arrow, by right-dragging or using the pencil key to toggle a pencil mark, or by
moving a keyboard cursor and placing an arrow or mark. A move onto a fixed clue,
a move off the grid, or a placement that repeats the existing arrow SHALL
produce no state change and no history entry. Pencil marks SHALL be part of the
state and SHALL round-trip through the save codec.

Placing an arrow SHALL show it, and completing the board — every square filled
with arrows leading to a goal, no loop, no off-grid arrow and no duplicate arrow
within a region — SHALL report the game solved. Rendering SHALL draw the region
outlines, arrows and goals, pencil marks in the cell quadrants, an optional
highlight of squares whose arrows reach a goal, an inline error tint for
off-grid and duplicate arrows, and a completion flash. There SHALL be no
interpolated arrow animation.

#### Scenario: Dragging a direction places an arrow

- **WHEN** a non-fixed square is grabbed and a direction is dragged and released
- **THEN** an arrow in that direction is placed in the square

#### Scenario: Completing the grid wins

- **WHEN** the final arrow is placed so every square leads to a goal with no loop
  and no duplicate arrow in any region
- **THEN** the game is reported solved and flashes

#### Scenario: A duplicate arrow in a region is flagged as a mistake

- **WHEN** two squares in the same outlined region hold the same arrow direction
- **THEN** `findMistakes` flags both squares and Check & Save is hard-blocked

### Requirement: Rome solves by deduction and generates soluble boards

Rome SHALL provide a solver that fills the grid by pure deduction, or reports
that the board is invalid or incomplete. Validity SHALL be judged by merging
each arrow with the square it points at into a disjoint-set forest and flagging
any arrow that points off the grid, any duplicate arrow within an outlined
region, and any arrow that forms a loop. The solver SHALL apply its
deduction rules gated by difficulty — Easy, then the
additional Normal rules, then the additional Tricky rule — and SHALL NOT
backtrack or guess at any difficulty.

The generator SHALL use the solver to keep every board soluble: it SHALL fill
the grid with arrows in single-cell regions, merge outlined regions randomly
while keeping arrows within a region distinct, and remove redundant clues,
accepting a board only when it is soluble at the target difficulty and not
soluble at the difficulty below. Generation from a given seed SHALL be
reproducible.

#### Scenario: The solver completes a soluble board without guessing

- **WHEN** a soluble board is solved at its difficulty
- **THEN** every square is filled by deduction and the result reaches a goal from
  every square with no loops and no duplicate arrows in any region

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same size, difficulty and seed are used twice
- **THEN** both runs produce the identical board description

### Requirement: Rome mistake-checking covers arrows and marks that break no rule

Mistake-checking SHALL report both the rule violations the board already shows
as the player works — an arrow pointing off the grid, an arrow duplicated inside
an outlined region, and an arrow that forms a loop — and, separately, any arrow
the player has placed that contradicts the puzzle's unique solution even though
it breaks no rule. The unique solution SHALL be re-derived from the fixed clues
alone, never from anything the player has entered, and when the board is not
deducible from those clues no contradiction SHALL be reported.

An empty square carrying no marks SHALL NOT be reported as a mistake. A pencil
mark SHALL claim that its arrow is still possible for that square, so an empty
square whose marks are non-empty and exclude the solution's arrow SHALL be
reported as a mistake of its own kind, exactly as every other note-taking game
in the collection reports one.

#### Scenario: A legal-looking arrow that contradicts the solution is flagged

- **WHEN** an arrow is placed that breaks no rule but differs from the unique
  solution's arrow for that square
- **THEN** it is reported as a mistake and Check & Save is hard-blocked

#### Scenario: A duplicate arrow in a region is flagged as a mistake

- **WHEN** two squares in the same outlined region hold the same arrow direction
- **THEN** `findMistakes` flags both squares and Check & Save is hard-blocked

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
be adaptive: while any empty square has no marks it SHALL fill every such square
with the arrows that square could legally hold, and otherwise it SHALL strike
from each empty square every arrow already placed in that square's own outlined
region, returning no move when there is nothing left to strike.

The set of arrows a square can legally hold SHALL be **per square** — all four
less any that would point off the grid — and SHALL be the same set the solver
seeds its candidates with and the hint's populate step fills. The fill SHALL be
additive: a square the player has already narrowed keeps its marks.

#### Scenario: The first press fills only what the grid's edges allow

- **WHEN** Mark-all is pressed on a board with unmarked empty squares
- **THEN** every such square gains the arrows it could legally hold, a top-row
  square gains no up arrow, and a square the player had already narrowed is left
  bit-for-bit alone

#### Scenario: A later press removes only, and converges

- **WHEN** Mark-all is pressed repeatedly on a fully marked board
- **THEN** each press only ever removes marks, and a press on a fully cleaned
  board is a true no-op that adds no history entry

### Requirement: Rome explains its next deduction

Rome SHALL provide an explained `hint()` meeting the project's hint quality bar,
built on the shared candidate-elimination plan. A hint SHALL refuse on a solved
board and on a board the mistake check flags, and SHALL otherwise narrate the
next forced move by the premise that forces it, in Rome's own vocabulary of
arrows, squares and areas.

Every sentence SHALL rest only on facts the player can see on the board or
record with Rome's own marks. A step's evidence SHALL be shaded and the square
it acts on SHALL be ringed rather than filled. Where a firing's premise is a
**walk** — an arrow chain that leads back to the square being struck — the chain
SHALL be shaded in order, numbered, so the claim the sentence makes is one the
player can follow square by square; the chain SHALL be computed rather than
assumed.

The hint SHALL derive its script from a recording projection of Rome's own
solver. That projection SHALL NOT change any deduction the solver makes, because
the generator keeps a blanked clue only while the solver still finishes the
board and so every published description depends on the solver's verdict on
every intermediate clue set.

#### Scenario: A deduction is narrated by its premise, not by its move

- **WHEN** the hint's next step strikes an arrow that would close a loop
- **THEN** the sentence states that following the arrows from the named
  neighboring square leads back to this one, and the arrow chain is shaded in
  order with each square's place in the walk drawn on it

#### Scenario: The recorder changes nothing the solver decides

- **WHEN** a board is solved with the recorder attached and again without it
- **THEN** both runs finish with the same grid and the same candidate set,
  square for square

#### Scenario: A hint can be followed to a finished board

- **WHEN** the hint's move is applied repeatedly from any mid-game position
- **THEN** the board reaches a solved state, and every step changes the board
  when it is reached

### Requirement: Rome offers one key per arrow, and a tap selects a square

Rome SHALL offer an on-screen key for each of the four arrows, and a Clear key.
Pressing an arrow key SHALL place that arrow in the selected square, or toggle
it as a mark while notes mode is on; Clear SHALL empty whichever of the two the
mode is entering.

A press and release on one square that commits no move SHALL **select** that
square, in both modes. Rome's keys act at the keyboard cursor, and a player
without a keyboard has no other way to put the cursor anywhere, so without this
the whole panel is unreachable rather than merely awkward.

Dragging a direction out of a square SHALL continue to work unchanged. The panel
is a second way in, not a replacement.

#### Scenario: A square is entered without dragging

- **WHEN** an empty, non-fixed square is tapped and an arrow key is pressed
- **THEN** that arrow is placed in it

#### Scenario: The same key marks while notes mode is on

- **WHEN** notes mode is armed, a square is tapped, and an arrow key is pressed
- **THEN** that arrow is toggled as a pencil mark rather than placed, and Clear
  empties the square's marks rather than its arrow

#### Scenario: A tap that commits nothing still selects

- **WHEN** a press and release land on the same square, in either mode
- **THEN** no move is made and the cursor is left on that square

### Requirement: Rome refuses a pencil mark pointing off the grid

Rome SHALL refuse a pencil mark for an arrow that points off the grid, on every
way into notes: the armed keyboard cursor, a typed or on-screen arrow key in
notes mode, and a pencil drag. Such a drag SHALL preview no mark, and its
release SHALL select the square as a drag that commits nothing does. Mark-all
never offers that mark and the solver never considers that arrow, so a hint
meeting one would have no strike to teach. Executing a pencil move SHALL leave
no mark pointing off the grid, so a move log saved before the refusal replays
without one. Placing such an arrow as a real entry SHALL remain a move, which
the board flags as an error.

#### Scenario: Each way into notes refuses an off-grid mark

- **WHEN** the player, in notes mode on a top-row square, presses up with the
  armed cursor, presses the up arrow key, or pencil-drags off the top edge
- **THEN** no move is made, and the drag previews no mark

#### Scenario: A replayed off-grid mark leaves no note

- **WHEN** a pencil move for an arrow pointing off the grid is executed
- **THEN** the square's marks are unchanged by it

#### Scenario: The hint survives the board that found this

- **WHEN** the hint is asked on the pinned board after its move log, which ends
  in the player's off-grid mark
- **THEN** the hint answers instead of throwing
