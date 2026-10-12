# seismic Specification

## Purpose
Seismic, the puzzle of numbering each area of size N with 1 to N, under either
the Seismic rule that equal numbers N in a line have at least N cells between
them or the Tectonic rule that equal numbers never touch, even diagonally. It
has note-taking, an explained hint, a size bound measured for each mode, and
an on-screen keypad sized to the largest area its generator produces.

## Requirements

### Requirement: Rules: A region holds each number once and equal numbers keep apart

The grid SHALL be partitioned into regions, and a region of size N SHALL
require one instance of each number from 1 to N. In Seismic mode two equal
numbers Z on the same row or column SHALL have at least Z cells between them;
in Tectonic mode two equal numbers SHALL NOT be orthogonally or diagonally
adjacent. The game SHALL be solved when every cell is filled and every region
and keep-apart rule is satisfied.

#### Scenario: Two equal numbers too close in a line

- **WHEN** in Seismic mode two 2s stand in one row with one cell between them
- **THEN** the board is not solved, and both are in breach of the keep-apart
  rule

#### Scenario: Completing the grid wins

- **WHEN** the last cell is filled so that every region and keep-apart rule is
  satisfied
- **THEN** the game is reported solved

### Requirement: Params: The size bound is measured, per mode, and says why

Any size bound in validation SHALL be derived from a measurement of the
shipped generator rather than inherited, and SHALL carry a reason the
Custom-type dialog can display, naming the mode it applies to. The bound SHALL
be per mode, because the two modes are stopped by different things. Where a
bound remains it SHALL reflect whichever stage is actually the limit: the
region fill or the clue-stripping loop.

#### Scenario: A board past 7×7 is generable

- **WHEN** a board larger than 7×7 is requested, within the measured bound
- **THEN** it is accepted by validation and a soluble board is produced

#### Scenario: The refusal names the mode

- **WHEN** a board over the bound of its mode is requested
- **THEN** the refusal the Custom-type dialog shows names that mode

### Requirement: Params: Tectonic's bound is what can be reached

Tectonic's limit is reachability: every size within its bound SHALL generate,
some of them slowly. A size the player types in the Custom dialog SHALL NOT be
refused in Tectonic mode only because it takes seconds to generate.

#### Scenario: The standard Hakyuu size is available where it can be built

- **WHEN** a 10×10 board is requested in Tectonic mode from the Custom dialog
- **THEN** it is accepted by validation and a soluble board is produced
- **AND** no preset offers that size, so it is reached only by a player who asked
  for it

### Requirement: Params: Seismic's bound is what is possible

Seismic's limit is possibility: a 10×10 board does not generate at all, each
attempt running until it exhausts its retry budget, and no amount of waiting
changes that. Its bound SHALL stay at the largest area whose worst
observed run is short. Raising it SHALL require repeating the slow sizes over
several seeds, and the bound SHALL NOT be set from medians.

#### Scenario: A size the generator cannot build is refused up front

- **WHEN** a 10×10 board is requested in Seismic mode
- **THEN** it is rejected with a stated reason naming the mode, rather than
  accepted and left to churn until its retry budget is exhausted

### Requirement: Params: Seismic's two bounds bind a board being dealt only

Both bounds are the generator's, so `validateParams` SHALL apply them to full
params alone. A board that arrives with its description SHALL open at any
size: another build of the puzzle has neither bound and shares such boards,
and opening one is a single run of the solver.

#### Scenario: A shared board past the bound of its mode

- **WHEN** a game ID of a 9×8 Seismic board or an 11×10 Tectonic board, each
  with its description, is opened
- **THEN** it loads, where the same size asked for in the Custom dialog is
  refused

### Requirement: Params: A preset is never a long wait

A preset SHALL NOT be a size whose worst observed run is a long wait: it is
offered to everyone who opens the Type menu, so a long generation there is a
wait nobody chose, whereas a Custom size is a wait the player asked for, and a
slow Custom size within the bound SHALL be accepted. Every preset SHALL be no
larger than `MAX_CELLS_SEISMIC`, the largest area whose worst observed run is
short, in either mode, and a test SHALL assert this.

#### Scenario: A size whose worst case is a long wait is kept out of the menu

- **WHEN** presets are enumerated
- **THEN** none of them is a size whose generation tail runs to tens of seconds,
  whatever the validation bound admits

#### Scenario: The largest preset may take a moment

- **WHEN** an 8×8 preset is dealt, in either mode
- **THEN** it is offered, though its slowest deal is seconds and not an instant,
  since no observed deal of that area is a long wait

### Requirement: Params: A Seismic params string with no mode is Seismic, and with no difficulty Easy

Seismic's params, a size, a difficulty (Easy or Normal) and a mode (Seismic
or Tectonic), SHALL be bounded and encoded as its `paramConfig` and its
declared codec give (`engine-params`, "A game declares its params encoding
once, and both codec halves are derived"), and its menu SHALL be what
`presets` gives. A bare number SHALL decode as a square grid, a string with no
`T` as Seismic mode, and one with no `d` as Easy.

#### Scenario: A Seismic preset

- **WHEN** `4x4dh` is decoded
- **THEN** it is a 4×4 Seismic board at Normal, and its short encoding is `4x4`,
  which decodes as a 4×4 Seismic board at Easy

### Requirement: Description: Seismic descriptions use the run-length wall and clue encoding

A Seismic description SHALL be two comma-separated parts: the region walls,
as the engine's wall list (`engine-params`, "The engine provides the
wall-list description grammar"), and the clue numbers in row-major order. In
the clue list a letter SHALL be a run of empty cells, `a` for 1 to `z` for 26,
and a digit `1` to `9` one given.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

#### Scenario: The 4×4 description 1a6df3,f1h1

- **WHEN** `1a6df3,f1h1` is read for a 4×4 board
- **THEN** its wall list covers the board's 24 borders: one wall, an open
  border and a wall, six walls, four open borders and a wall, six open borders
  and a wall, then three walls
- **AND** its clue list is six empty cells, a 1, eight empty cells and a 1, so
  the givens are the third cell of the second row and the last cell

### Requirement: Description: A Seismic description is validated against its regions

Validation SHALL reject a description that uses an unknown clue character,
that forms a region larger than nine cells, or that places a clue larger than
its region's size. It SHALL also reject a clue of 0, and a clue list that
does not cover the board exactly, and SHALL otherwise accept a description of
the two comma-separated parts.

#### Scenario: An over-large clue is rejected

- **WHEN** a description whose clue exceeds the size of its region is validated
- **THEN** it is rejected as an over-large clue

### Requirement: Generation: Seismic solves by candidate elimination, graded Easy or Normal

Seismic SHALL provide a solver that fills the grid by candidate elimination: a
naked single and a hidden single within a region at Easy, plus a
trial-placement deduction at Normal. It SHALL report the difficulty reached or
that the puzzle is not uniquely soluble, and SHALL enforce the mode's
keep-apart rule and the one-of-each-number-per-region rule while eliminating
candidates.

#### Scenario: The solver grades a puzzle's difficulty

- **WHEN** a uniquely soluble puzzle is solved
- **THEN** the solver reports the lowest difficulty at which its deductions
  complete the grid

### Requirement: Generation: The generator strips clues while the board stays soluble at its tier

After the fill the generator SHALL strip clues while the puzzle stays soluble
at the target difficulty.

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset
- **THEN** a board is produced whose unique solution is reachable by the solver at
  the preset's difficulty band

### Requirement: Generation: A test holds every generated board to the rules

Every generated board SHALL satisfy, by test rather than by luck: every region
is connected and holds exactly the numbers 1 to its size; the mode's
keep-apart rule holds across the whole solution; and the description
round-trips through the codec.

#### Scenario: Every region is valid by construction

- **WHEN** a board is generated at any preset
- **THEN** each of its regions is connected and holds exactly one of each number
  from 1 to that region's size, and no two equal numbers violate the mode's
  keep-apart rule

### Requirement: Controls: Seismic is played by the note-taking cell's rules

Seismic SHALL be played by the note-taking cell's rules (`engine-notes`, "The
note-taking cell is one shared mechanic"), with the cursor keys moving the
selection, and SHALL depart from them nowhere. Its two answers to the
mechanic are that a given takes no number and that a cell holding a number
takes no pencil mark.

#### Scenario: A press on a given

- **WHEN** a given is pressed with the primary button and a digit is typed
- **THEN** the highlight is not shown on the given and no number is entered

### Requirement: Controls: The on-screen keypad offers only digits a board can accept

Seismic's `requestKeys` SHALL offer the digits up to the largest region the
generator produces in the mode, plus a clear key: entry is capped at the
pressed cell's region size, so a digit no generated board accepts is a key that
does nothing. The panel SHALL derive that bound from the generator's own size
distribution and SHALL NOT restate it as a literal. The bound SHALL be the
generator's, not the format's, which admits larger regions than the generator
produces.

#### Scenario: Widening the generator widens the panel

- **WHEN** the generator's region-size distribution is changed to admit a larger
  region
- **THEN** the keypad admits the corresponding digits

### Requirement: Controls: A Seismic digit above its region's size, or on a fixed clue, is refused

A digit SHALL be entered only when it does not exceed the selected cell's
region size, and SHALL NOT change a fixed clue.

#### Scenario: A digit above the region size is rejected

- **WHEN** the player types a digit larger than the selected cell's region size
- **THEN** the board is unchanged

### Requirement: Controls: A Seismic digit enters or pencils, and Backspace, Space or 0 clears

While the highlight shows, a digit SHALL enter that number in the highlighted
cell, or in pencil mode toggle that pencil mark there. Backspace, Delete, Space
and `0` SHALL clear the cell's number, or in pencil mode every pencil mark of
the cell. In pencil mode no key SHALL change a cell that holds a number. A key
that would leave the cell as it is SHALL make no move.

#### Scenario: Clearing a cell that holds nothing

- **WHEN** Backspace is pressed on a highlighted cell that holds no number, out
  of pencil mode
- **THEN** no move is made and Undo is offered no step

#### Scenario: A pencil mark typed twice

- **WHEN** `2` is typed twice in pencil mode on an empty cell with no pencil
  marks, in a region of three
- **THEN** the cell holds no pencil mark again, and each press was a move

### Requirement: Controls: Seismic's Mark-all fills, then strikes what a placed number rules out

Seismic's `markAll` SHALL be the adaptive press of `engine-notes`, "Mark-all
is adaptive in a game with an obvious-candidate rule", by a rule of its own:
a note-less cell's candidates are the numbers from 1 to its area's size, and
an obvious candidate is a note that a placed number of the same value rules
out, one in the same area or one near enough under the board's ruleset.

#### Scenario: A second press on a filled board

- **WHEN** every empty cell has notes and the player runs mark-all
- **THEN** each note struck is a number placed in the cell's area or within
  that number of cells along its row or column
- **AND** a third press makes no move

### Requirement: Hint: The hint walks the shared candidate plan with the keep-apart reach

The plan SHALL be walked by the shared candidate walk (`runCandidatePlan`),
with Seismic's keep-apart rule as the walk's `reach`: an `n` rules `n` out of
its own area and of the cells `placeNumber` strikes.

#### Scenario: A note-less cell reads as what the rule leaves it

- **WHEN** under the implicit reading the plan writes a note-less cell's notes, or
  places a number in one as the only number left
- **THEN** the notes written, or the one number, are exactly what `placeNumber`
  leaves that cell after every number on the board is placed

### Requirement: Hint: The hint starts on the implicit reading

Seismic SHALL offer the player the "Hints pencil in" choice and start on the
implicit reading, because an Easy board falls entirely to singles the board
shows.

#### Scenario: A new player's first hint

- **WHEN** a player who has never set "Hints pencil in" asks for a hint
- **THEN** the plan is built under the implicit reading

### Requirement: Hint: The hint deduces from the player's notes

The plan SHALL deduce from the player's pencil notes, and from what a
note-less cell's area and the numbers within reach leave it, rather than from
the givens alone. That is sound only because `findMistakes` flags every empty
cell whose notes have crossed out its answer, so wherever the hint runs every
cell's notes still hold that answer.

#### Scenario: A hint resumes from the player's own narrowed notes

- **WHEN** the player has narrowed some cells' notes without crossing out an
  answer and asks for a hint
- **THEN** the plan does not fill notes again, and following it finishes the board

### Requirement: Hint: The deductions the hint makes

The hint SHALL deduce: an empty area of one cell can only hold a 1; a cell with
one candidate left can only hold it; a number with one cell left in its area
must go there, unless that cell's candidates are down to it already, which is
the previous deduction; and a number is struck from every cell outside an area
that clashes, under the mode's keep-apart rule, with every cell the area still
has for it. The last SHALL be taken only when no other applies.

#### Scenario: An area starved of a number rules it out of every cell that clashes with all its homes

- **WHEN** every cell an area still notes for 3 lies within 3 cells, along a row
  or column, of a cell outside the area that also notes 3, and a hint is requested
  at that point in Seismic mode
- **THEN** the step strikes 3 from every such cell at once, rings those cells,
  hatches the area, and says the area can put its 3 only within that reach of them

#### Scenario: A number's last home that has one candidate left is a one-candidate step

- **WHEN** a number has one cell left in its area and that cell's notes are
  already down to that number
- **THEN** the step is narrated as a cell with one candidate left, and the
  one-cell-left narration is used only where the cell still notes another number

### Requirement: Hint: The starved-area deduction is the solver's trial rung

The starved-area deduction is the solver's trial rung in the form a player can
see: it SHALL strike exactly the candidates the trial rung rejects wherever it
is the next step, and every cell ruled out by one area and one number SHALL be
one step. It is a Check, so it SHALL be narrated directly. It SHALL never be
needed on an Easy board, whose certification uses the singles alone.

#### Scenario: An Easy board is never taught the trial

- **WHEN** a hint plan is followed from the deal to the end of an Easy board
- **THEN** no step of it is the starved-area deduction

### Requirement: Hint: The generator does not call the hint

The generator SHALL NOT call the hint, so no generated board changes with it.

#### Scenario: The hint's code changes

- **WHEN** a hint deduction is added or reworded
- **THEN** every seed deals the board it dealt before

### Requirement: Hint: A note-less Seismic cell is told by what stands within reach

Where the hint places the one number left for a cell with no notes, it SHALL
ring the cell and say what rules the others out in the mode's own words:
"Every other number is already in this cell's area or within reach along its
row or column, so it can only be 2." in Seismic mode, and "Every other number
is already in this cell's area or in a cell touching it, so it can only be 4."
in Tectonic mode.

#### Scenario: Notes written for a deduction say the same reach

- **WHEN** a Seismic-mode step first writes a note-less cell's notes, and the
  cell's area and the numbers within reach leave it 1 and 3
- **THEN** it says "Only 1 and 3 aren't already in this cell's area or within
  reach along its row or column, so pencil them in."

#### Scenario: A cell nothing reaches yet

- **WHEN** a step writes the notes of a cell no placed number rules anything
  out of
- **THEN** it says "No number stands near enough to rule one out here yet, so
  pencil in every one."

### Requirement: Look: Seismic draws its numbers, its notes and a broken rule

Rendering SHALL draw the region boundaries, the placed numbers, and the pencil
marks, and SHALL highlight a duplicate-in-region or a keep-apart violation in
an error color as it is entered.

#### Scenario: A duplicate in a region is shown as it is entered

- **WHEN** the player enters a number its region already holds
- **THEN** the number entered is drawn in the error color on the next frame

### Requirement: Look: A flagged cell carries its own mistake overlay

The cells Check flags SHALL be rendered with a mistake overlay of their own,
an inset double outline that reads apart from the red number a broken rule
gets, and the overlay SHALL appear on the frame after the check, on a cell
whose contents did not change included.

#### Scenario: A mistake appears on a cell whose contents did not change

- **WHEN** Check flags a cell and nothing else about that cell changes
- **THEN** the cell is repainted with the overlay on the next frame

### Requirement: Look: Seismic draws its cells on a quiet surface and keeps its walls

`redraw` SHALL draw every cell the player fills on the collection's cell
surface and a cell holding a given number on the collection's lifted surface
of a given, with the given's number in ink and the player's in the entry
color. The line between two cells of one region SHALL be the collection's
surface grid line.

#### Scenario: A given is told by the cell under it

- **WHEN** the opening frame of a board is drawn
- **THEN** every cell holding a given is the lifted surface and every other
  cell is the plain cell surface

### Requirement: Look: A region's wall is content

A region's wall, the frame round the board included, is content: it SHALL stay
in ink at its full width, and where two walls turn round a cell's corner they
SHALL meet in a solid corner.

#### Scenario: A wall is stronger than a grid line

- **WHEN** a board with a region of two or more cells is drawn
- **THEN** the line between two cells of that region is the surface's grid line
- **AND** the line between two regions is ink

### Requirement: Look: The completion flash lights each cell's surface

The completion flash SHALL light each cell, a given's as a player's, by its
place in the grid (`ts-engine`, "A game gives each element a position, and
the route is which position it gives"), and SHALL fill it inside its region's
walls. The cursor's highlight SHALL be hidden while the flash plays.

#### Scenario: The flash moves

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** the first lit cell is the bottom-left one, and every cell, given or
  not, is lit on some frame
