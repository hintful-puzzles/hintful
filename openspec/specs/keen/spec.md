# keen Specification

## Purpose
Keen (KenKen), the Latin-square puzzle whose cages each carry an arithmetic clue
their digits must satisfy: its rules, its params and description formats, what
each tier asks of the solver, its controls and preferences, how it looks, and
what its hint says of a cage. What it shares with every note-taking and
candidate-hint game is in `engine-notes` and `engine-candidate-hints`.

## Requirements

### Requirement: Keen is a Latin square with arithmetic cages

The player SHALL place a digit `1..w` in every cell of a `w × w` grid so that
each row and column contains every digit exactly once. The grid SHALL be
partitioned into contiguous cages, each labeled with a target value and an
operation (`+`, `−`, `×`, `÷`) that the cage's digits must satisfy. Subtraction
and division cages SHALL always have area 2.

#### Scenario: A division domino reads either way round

- **WHEN** a two-cell cage carries the clue `2÷`
- **THEN** the digits 3 and 6 satisfy it in either order
- **AND** the digits 2 and 5 do not

### Requirement: Keen's parameters

Params SHALL be `w`, `diff` and `multiplicationOnly`. `diff` SHALL be one of
Easy, Normal, Tricky, Hard or Unreasonable, held as the keys `"easy"`,
`"normal"`, `"hard"`, `"extreme"` and `"unreasonable"`, so the Tricky tier is
`"hard"`. The grid size SHALL be refused outside `3 ≤ w ≤ 9`, by the bounds its
`paramConfig` item declares.

#### Scenario: Invalid params are rejected

- **WHEN** the engine's params check is given `w < 3` or `w > 9`
- **THEN** it returns a non-null error sentence naming the grid size

### Requirement: Keen's params encoding

Params SHALL be encoded `{w}` without `full` and `{w}d{c}{m?}` with `full`,
where `c` is `e`, `n`, `h`, `x` or `u` for the five tiers in order and a
trailing `m` marks a multiplication-only puzzle.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, diff: "hard", multiplicationOnly: false }` (the Tricky
  tier) are encoded with `full = true`
- **THEN** the result is `6dh`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`
- **AND** a multiplication-only puzzle's full encoding ends with `m`

### Requirement: A 3×3 Keen is not dealt above Normal

When a board is to be generated, `validateParams` SHALL refuse a 3×3 puzzle at
any tier above Normal, in the collection's sentence for a size that has no
board of the tier, because no 3×3 board needs more than Normal.

#### Scenario: A 3×3 Tricky is asked for

- **WHEN** `validateParams` is called with `full = true` on
  `{ w: 3, diff: "hard" }`
- **THEN** it returns "No 3x3 puzzle is Tricky."
- **AND** called with `full = false` on the same params it returns null

### Requirement: Keen descriptions encode the block structure and cage clues

The desc SHALL consist of the block structure followed by a comma and the clue
list. The clue list SHALL give, for each cage in the order of the cages'
minimal cells, an operation tag (`a` add, `s` subtract, `m` multiply, `d`
divide) followed by the decimal target value. Every cell SHALL start blank:
Keen has no givens.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board is generated and its desc decoded by `newState`
- **THEN** the cage partition and per-cage clues match what was encoded
- **AND** every cell starts empty with no pencil marks

### Requirement: The block structure is run lengths between dividing lines

The block structure SHALL encode the pattern of internal dividing lines as
run lengths of non-edges over the `2·w·(w−1)` internal grid lines (vertical
lines in reading order, then horizontal lines in transposed order), using `_`
for a run of 0, `a`–`y` for 1–25, and `z` for 25 non-edges and no following
edge. A run of three or more of the same letter SHALL be written as that letter
followed by a decimal repeat count.

#### Scenario: Repeated letters are compressed

- **WHEN** the run lengths give the same letter four times in a row
- **THEN** the block structure holds that letter followed by `4`
- **AND** the same letter twice in a row is written as the letter twice

### Requirement: A malformed Keen description is refused

A desc SHALL be refused when its block structure is malformed, when it gives
the wrong number of clues, when a clue tag is unrecognized, and when it gives a
subtraction or division clue to a cage whose area is not 2.

#### Scenario: Malformed description is rejected

- **WHEN** a desc with a malformed block structure, too few or too many clues,
  or an unknown clue tag is loaded
- **THEN** it is refused with a non-null error string

#### Scenario: A subtraction clue on a cage of three cells

- **WHEN** a desc gives a subtraction or division clue to a cage that is not a
  domino
- **THEN** it is refused: "This game ID gives a subtraction or division clue to
  a block that isn't two cells."

### Requirement: Keen's tiers are the Latin-square deductions a board needs

The solver SHALL accept a completed grid only when every cage's digits satisfy
its clue. Of the shared Latin-square deductions, Easy SHALL allow the simple
ones, Tricky the set deductions, Hard the deeper set deductions and forcing
chains, and Unreasonable recursion.

#### Scenario: Solver grades a known board

- **WHEN** `solveKeen` is run on a generated board at its difficulty
- **THEN** it returns that difficulty and fills the grid with the unique solution

### Requirement: A cage deduction enumerates the cage's layouts

The cage deductions SHALL enumerate, for each cage, the digit layouts
consistent with the current candidate cube and the cage's operation and value,
and SHALL prune the candidate cube accordingly: at Easy by amalgamating all
values, at Normal by per-square value bitmaps, and at Tricky by the cross-cage
"a digit required in this row or column" intersection.

#### Scenario: A cage needs a digit in one row

- **WHEN** at Tricky every consistent layout of a cage places a 1 somewhere
  along one row
- **THEN** 1 is removed from the candidates of that row's cells outside the cage

### Requirement: Keen selects a cell through the shared note-taking cell

Keen SHALL take its selection from the engine's note-taking cell. Every cell
SHALL take an entry, since Keen has no givens, and only an empty cell SHALL
take a pencil mark. The cursor-select key on a showing highlight SHALL toggle
pencil mode, and the cursor keys SHALL move the highlight.

#### Scenario: A right press on a filled cell without sticky mode

- **WHEN** sticky pencil mode is off and the player right-presses a cell that
  holds a digit
- **THEN** the highlight moves to that cell and is not shown, because the cell
  can take no pencil mark

### Requirement: Keen interprets digit, pencil, and mark-all input

With a cell highlighted, a digit key `1..w` SHALL enter that digit, or in
pencil mode toggle that pencil mark, and backspace or space, which is the
cursor-select2 key, SHALL clear the cell. Entering a digit that equals the
cell's current contents, with no pencil marks, SHALL be a no-op that hides the
mouse highlight.

#### Scenario: Placing and penciling digits

- **WHEN** a cell is highlighted and a digit key is pressed
- **THEN** that digit is placed in the cell, or in pencil mode its pencil mark
  is toggled

### Requirement: Keen's mark-all key fills, then cleans

While any empty cell has no notes, the `M`/`m` key SHALL fill every empty cell
that has none with all candidate pencil marks. On a board whose every empty
cell is noted it SHALL strike the candidates already placed in each cell's row
or column, and SHALL NOT strike a candidate for standing elsewhere in the
cell's cage.

#### Scenario: Mark-all fills pencil candidates

- **WHEN** the `M` key is pressed on a board with an empty cell that has no
  notes
- **THEN** `interpretMove` yields a `pencilAll` move
- **AND** `executeMove` fills every empty cell that has no notes with all
  candidate pencil marks, and leaves a cell the player has narrowed as it is

### Requirement: Auto-pencil strikes a placed digit from its row and column

With auto-pencil enabled, a real placement SHALL additionally strike that digit
from the pencil marks of every other cell in its row and column.

#### Scenario: A digit is placed with auto-pencil on

- **WHEN** auto-pencil is on and the player places a 4 in a cell whose row and
  column hold cells penciled with 4
- **THEN** the new state has no 4 among the pencil marks of that row and column

### Requirement: A Keen board is solved when its grid is complete without errors

`status` SHALL report solved exactly when every row and column holds each digit
once and every cage's digits satisfy its clue, so a placement that completes
the grid with no errors completes the game.

#### Scenario: The last digit goes in

- **WHEN** a placement fills the last empty cell and leaves no cage or line in
  error
- **THEN** `status` reports solved

### Requirement: Keen draws a cell's digit or its pencil marks

`redraw` SHALL draw in each cell its placed digit, centered, or its pencil
marks in a grid sized to the number of marks.

#### Scenario: A placed digit is drawn

- **WHEN** a board is rendered to a recording drawing
- **THEN** a placed digit is drawn centered in its cell

### Requirement: A cage's clue is drawn at its minimal cell

`redraw` SHALL draw each cage's clue, its target value and its operation
symbol, at the cage's minimal cell. The symbol SHALL be omitted for area-1
cages and for multiplication-only puzzles.

#### Scenario: Cage clue is drawn

- **WHEN** a board is rendered to a recording drawing
- **THEN** the cage clue text appears at each cage's minimal cell

#### Scenario: A multiplication-only puzzle shows no symbol

- **WHEN** a multiplication-only board is rendered
- **THEN** each clue is its target value alone

### Requirement: Keen shows rule violations and mistakes on the board

`redraw` SHALL show live rule-violation errors, a cage whose filled digits
violate its clue and duplicate digits in a row or column, and the Check & Save
mistake overlay.

#### Scenario: A digit repeats in a row

- **WHEN** a row holds the same digit in two cells
- **THEN** both digits are drawn in the error color

### Requirement: Keen flags mistakes against its unique solution

The game SHALL implement `findMistakes`: re-solve from the cage clue structure
to the unique solution, deriving it from the clues only and never the player's
notes, and return every player cell that contradicts it: a filled cell whose
digit is wrong (`"cell"`), and an empty cell whose non-empty pencil notes have
crossed out its solution digit (`"note"`). When the board is not uniquely
solvable from the clues the result SHALL be empty.

#### Scenario: A wrong digit and a wrong note are flagged

- **WHEN** the player fills a cell with a digit other than its solution value, or
  pencils out the solution digit in an empty cell
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose notes merely carry extra (non-solution) candidates is not
  flagged

### Requirement: Keen exposes pencil-mark preferences

The game SHALL offer a sticky-pencil-mode preference (default on: right-click
toggles a persistent pencil mode) and an auto-pencil preference (default off,
so the player cleans notes with the mark-all control or a hint).

#### Scenario: Pencil preferences are exposed with their defaults

- **WHEN** the game's preferences are read
- **THEN** they include a sticky-pencil-mode boolean defaulting to on
- **AND** an auto-pencil boolean defaulting to off

### Requirement: Keen provides an explained deduction hint

The hint SHALL teach the player the next deduction in pencil-notes terms. Its
deductions SHALL be recorded on a sound candidate cube seeded from the placed
entries only, never from the player's pencil notes, since a note can be wrong,
and SHALL be capped below recursion, because a guess is not a teachable note
strike.

#### Scenario: A wrong-looking note does not steer the deduction

- **WHEN** a hint is asked for on a mistake-free board whose notes the player
  has narrowed
- **THEN** the recording solver is given the placed digits alone and reads no
  note

#### Scenario: A hint on an Unreasonable board

- **WHEN** a hint is asked for on a board of the Unreasonable tier
- **THEN** the recording solver runs with its cap at Hard, and no step rests on
  a trial

### Requirement: A cage elimination is one firing, struck as one journey

A cage elimination SHALL be taught as one firing: no layout of the cage's
digits consistent with its clue leaves a candidate possible in a cage cell, or,
at the harder level, a digit the cage requires along a row or column is ruled
out elsewhere in that line. A firing SHALL be one cage's, so a hint step never
mixes cages. It SHALL strike what it rules out through `pencilStrike` moves
linked as one journey, and every cell it strikes in SHALL be marked in the one
acted-on hint color.

#### Scenario: A cage elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a cage's
  arithmetic clue rules a digit out of one of its cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the cage's cells are striped, the cell is ringed in the hint color and
  the struck candidates are shown with a line through them

#### Scenario: Two cages could prune at once

- **WHEN** the recording solver reaches a board on which two cages each rule a
  candidate out
- **THEN** each cage's eliminations are recorded under a `group` of their own

### Requirement: A cage deduction's sentence names the cage by its clue

A cage step's narration SHALL lead with the spotted indication, the cage named
by its clue's goal ("sum to N", "multiply to N", "differ by N", "have a ratio
of N"), then give the reasoning, then end in a necessity-voice conclusion.

#### Scenario: A sum cage rules two digits out of a cell

- **WHEN** a cage with the clue `8+` allows neither 1 nor 4 in one of its cells
- **THEN** the step reads "No way to make this cage sum to 8 puts 1 or 4 in this
  cell, so we must cross them out."

#### Scenario: A cage places a digit along its row

- **WHEN** every way to fill a `10×` cage places a 1 in its row
- **THEN** the step's sentence begins "This cage must multiply to 10, and every
  way to fill it places a 1 in its row"

### Requirement: Every Keen hint step is monotone progress

Every step SHALL be monotone progress: a note written, a note removed by a
strike, or a cell filled by a placement, never undone by the hint. A freshly
recomputed hint from any solvable, mistake-free mid-game position SHALL
therefore make progress and lead to a solved board, and on recompute the plan
SHALL skip any operation already reflected on the board.

#### Scenario: The hint resumes from a self-played mid-game position

- **WHEN** a hint is requested from a solvable, mistake-free board the player
  reached by their own notes and placements
- **THEN** the freshly-recomputed hint makes progress and, applied step by step
  with recompute, leads to a solved board

### Requirement: Keen keeps a hint plan while the player follows it

`hintKeepTrack` SHALL advance the plan when the player's move matches the
displayed step's intent: a pencil toggle clearing one of a strike step's marks
is `onTrack`, the step shrinking in place, or `completed` when it clears the
last, and a move that makes the whole step, a placement of the hinted value
among them, is `completed`. Any other move SHALL drop the plan (`off`).

#### Scenario: The player clears one of two struck candidates

- **WHEN** a step strikes two candidates and the player toggles one of them off
- **THEN** the verdict is `onTrack` and the step strikes only the other

### Requirement: Keen provides on-screen key labels

Keen SHALL implement `requestKeys(params)` returning one button per digit `1..w`
(labeled by the digit character) followed by a clear key (button code `8`,
labeled `"Clear"`).

#### Scenario: The keypad covers the grid's digits plus clear

- **WHEN** the key labels are requested for a `6×6` Keen board
- **THEN** the result is the buttons `1,2,…,6` followed by a clear key

### Requirement: Keen generates boards uniquely solvable at exactly the requested difficulty

`newDesc` SHALL deal a board only when the graded solver solves it at exactly
the requested difficulty: solvable at `diff` and not at `diff − 1`. Every cage
SHALL have area at most 6, and the generator SHALL assign a balanced mix of
cage operations and values that avoids low-quality clues. It SHALL regenerate
otherwise, under a capped-iteration backstop that throws and does not hang.

#### Scenario: Generated board is uniquely solvable at its difficulty

- **WHEN** a board is generated for given params
- **THEN** the solver solves it uniquely at the requested difficulty
- **AND** the solver fails to solve it at one difficulty level lower (for
  difficulties above Easy)
- **AND** no cage has more than 6 cells, and every subtraction or division
  cage has area 2

### Requirement: Keen draws its digits on a quiet surface inside heavy cages

`redraw` SHALL draw every cell on the collection's cell surface. The line
between two cells of one cage SHALL be the collection's surface grid line. A
cage's boundary and the frame round the grid, which is the boundary of the
cages along it, SHALL stay in ink, as SHALL each cage's clue. Keen has no given
digits, so no cell takes the lifted surface of a given.

#### Scenario: Only a cage's boundary is heavy

- **WHEN** a board is drawn
- **THEN** every cell is the cell surface
- **AND** the line between two cells of one cage is the surface grid line
- **AND** the line between two cages, and the frame, are ink

### Requirement: The selection is drawn under the clue, and the hint's ring in the gutter

The selection's wash and its pencil-mode corner SHALL be drawn over the cell's
surface, under the cage's clue. The hint's ring and its outline SHALL stay in
the gutter at the cell's edge.

#### Scenario: A cage's minimal cell is selected for a pencil mark

- **WHEN** the cell that carries a cage's clue is highlighted in pencil mode
- **THEN** the corner triangle is painted before the clue, and the clue is drawn
  whole on top of it
