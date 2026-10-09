# seismic Specification

## Purpose
Seismic, the puzzle of numbering each area of size N with 1 to N, under either
the Seismic rule that equal numbers N in a line have at least N cells between
them or the Tectonic rule that equal numbers never touch, even diagonally. It
has note-taking, an explained hint, a size bound measured for each mode, and
an on-screen keypad sized to the largest area its generator produces.

## Requirements

### Requirement: Seismic's parameters

Parameters SHALL be a width, a height, a difficulty (Easy or Normal), and a
game mode (Seismic or Tectonic). A width or a height below 4, and an unknown
difficulty, SHALL be refused. A game ID SHALL encode the width, height, mode
and difficulty and round-trip through decode, with a bare number decoding as a
square grid.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, mode and difficulty are recovered

### Requirement: A region holds each number once and equal numbers keep apart

The grid SHALL be partitioned into regions, and a region of size N SHALL
require one instance of each number from 1 to N. In Seismic mode two equal
numbers Z on the same row or column SHALL have at least Z cells between them;
in Tectonic mode two equal numbers SHALL NOT be orthogonally or diagonally
adjacent.

#### Scenario: Two equal numbers too close in a line

- **WHEN** in Seismic mode two 2s stand in one row with one cell between them
- **THEN** the board is not solved, and both are in breach of the keep-apart
  rule

### Requirement: The size bound is measured, per mode, and says why

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

### Requirement: Tectonic's bound is what can be reached

Tectonic's limit is reachability: every size within its bound SHALL generate,
some of them slowly. A size the player types in the Custom dialog SHALL NOT be
refused in Tectonic mode only because it takes seconds to generate.

#### Scenario: The standard Hakyuu size is available where it can be built

- **WHEN** a 10×10 board is requested in Tectonic mode from the Custom dialog
- **THEN** it is accepted by validation and a soluble board is produced
- **AND** no preset offers that size, so it is reached only by a player who asked
  for it

### Requirement: Seismic's bound is what is possible

Seismic's limit is possibility: a 10×10 board does not generate at all, each
attempt running until it exhausts its retry budget, and no amount of waiting
changes that. Its bound SHALL stay at the largest area whose worst
observed run is short. Raising it SHALL require repeating the slow sizes over
several seeds, and the bound SHALL NOT be set from medians.

#### Scenario: A size the generator cannot build is refused up front

- **WHEN** a 10×10 board is requested in Seismic mode
- **THEN** it is rejected with a stated reason naming the mode, rather than
  accepted and left to churn until its retry budget is exhausted

### Requirement: A preset is never a long wait

A preset SHALL NOT be a size whose worst observed run is a long wait: it is
offered to everyone who opens the Type menu, so a long generation there is a
wait nobody chose, whereas a Custom size is a wait the player asked for, and a
slow Custom size within the bound SHALL be accepted. Every preset SHALL pass
validation and SHALL be no larger than `MAX_CELLS_SEISMIC`, the largest area
whose worst observed run is short, in either mode, and a test SHALL assert
this.

#### Scenario: A size whose worst case is a long wait is kept out of the menu

- **WHEN** presets are enumerated
- **THEN** none of them is a size whose generation tail runs to tens of seconds,
  whatever the validation bound admits

#### Scenario: The largest preset may take a moment

- **WHEN** an 8×8 preset is dealt, in either mode
- **THEN** it is offered, though its slowest deal is seconds and not an instant,
  since no observed deal of that area is a long wait

### Requirement: Seismic descriptions use the run-length wall and clue encoding

A Seismic description SHALL encode two comma-separated parts: a run-length
list of the region walls, over the borders between the cells of each row first
and then the borders between rows, and a run-length list of the clue numbers
in row-major order. Runs of walls SHALL be written as decimal counts and runs
of non-walls as letters, and runs of empty clue cells SHALL be abbreviated
with letters; a clue cell SHALL carry its digit.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Seismic description is validated against its regions

Validation SHALL reject a description that uses an unknown wall or clue
character, that forms a region larger than nine cells, or that places a clue
larger than its region's size. It SHALL also reject a clue of 0, and a wall
list or a clue list that does not cover the board exactly, and SHALL otherwise
accept a description of the two comma-separated parts.

#### Scenario: An over-large clue is rejected

- **WHEN** a description whose clue exceeds the size of its region is validated
- **THEN** it is rejected as an over-large clue

### Requirement: Seismic input, note-taking and completion

Seismic SHALL be played by the note-taking cell's rules and SHALL offer a
sticky pencil mode preference, on by default.
With it on, a right press SHALL switch pencil mode and a left press SHALL
select the cell in the mode that is on; with it off, a left press SHALL select
a cell for number entry and a right press for pencil marks. The cursor keys
SHALL move the selection. The game SHALL be solved when every cell is filled
and every region and keep-apart rule is satisfied.

#### Scenario: Completing the grid wins

- **WHEN** the last cell is filled so that every region and keep-apart rule is
  satisfied
- **THEN** the game is reported solved and flashes

### Requirement: A digit is entered only where its region can hold it

A digit SHALL be entered only when it does not exceed the selected cell's
region size, and SHALL NOT change a fixed clue. A digit or a clear that would
not change the cell SHALL make no move: the number the cell already holds,
and, in pencil mode, a clear on a cell with no notes.

#### Scenario: A digit above the region size is rejected

- **WHEN** the player types a digit larger than the selected cell's region size
- **THEN** the board is unchanged

#### Scenario: Clearing notes a cell has not got leaves no history

- **WHEN** pencil mode is on and a clear key is pressed on an empty cell with no
  notes
- **THEN** no move is made and Undo gains nothing

### Requirement: Mark-all fills a note-less cell with its region's candidates

The game SHALL offer a mark-all action that fills every empty cell holding no
notes with all of its region's candidates. It SHALL NOT reset a cell whose
notes the player has narrowed, and SHALL make no move when no empty cell lacks
notes.

#### Scenario: Mark-all leaves a narrowed cell alone

- **WHEN** the player has narrowed one empty cell's notes and runs mark-all
- **THEN** every note-less empty cell holds the numbers from 1 to its region's
  size, and the narrowed cell's notes are as the player left them

### Requirement: Seismic draws its numbers, its notes and a broken rule

Rendering SHALL draw the region boundaries, the placed numbers, and the pencil
marks, and SHALL highlight a duplicate-in-region or a keep-apart violation in
an error color as it is entered. There SHALL be no move animation.

#### Scenario: A duplicate in a region is shown as it is entered

- **WHEN** the player enters a number its region already holds
- **THEN** the number entered is drawn in the error color on the next frame

### Requirement: A flagged cell carries its own mistake overlay

The cells Check flags SHALL be rendered with a distinct mistake overlay, and
the overlay SHALL appear on the frame after the check, on a cell whose contents
did not change included.

#### Scenario: A mistake appears on a cell whose contents did not change

- **WHEN** Check flags a cell and nothing else about that cell changes
- **THEN** the cell is repainted with the overlay on the next frame

### Requirement: The on-screen keypad offers only digits a board can accept

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

### Requirement: Seismic solves by candidate elimination, graded Easy or Normal

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

### Requirement: The generator strips clues and accepts only a board of its tier

After the fill the generator SHALL strip clues while the puzzle stays soluble
at the target difficulty, and SHALL accept a puzzle only when it is soluble at
that difficulty and not at the difficulty below. Generation from a given seed
SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset
- **THEN** a board is produced whose unique solution is reachable by the solver at
  the preset's difficulty band

### Requirement: A test holds every generated board to the rules

Every generated board SHALL satisfy, by test rather than by luck: every region
is connected and holds exactly the numbers 1 to its size; the mode's
keep-apart rule holds across the whole solution; and the description
round-trips through the codec.

#### Scenario: Every region is valid by construction

- **WHEN** a board is generated at any preset
- **THEN** each of its regions is connected and holds exactly one of each number
  from 1 to that region's size, and no two equal numbers violate the mode's
  keep-apart rule

### Requirement: Seismic explains the next deduction

`hint(state)` SHALL return the forced steps from the player's own board as an
ordered plan, each step narrating why its move is forced from premises the
sentence itself states. Asking SHALL leave the state unchanged, the region
partition every state of the game shares included.

#### Scenario: Asking for a hint leaves the board untouched

- **WHEN** a hint is requested on a freshly dealt board
- **THEN** the state, including the region partition every state of the game
  shares, is unchanged

### Requirement: The hint walks the shared candidate plan with the keep-apart reach

The plan SHALL be walked by the shared candidate walk (`runCandidatePlan`),
with Seismic's keep-apart rule as the walk's `reach`: an `n` rules `n` out of
its own area and of the cells `placeNumber` strikes.

#### Scenario: A note-less cell reads as what the rule leaves it

- **WHEN** under the implicit reading the plan writes a note-less cell's notes, or
  places a number in one as the only number left
- **THEN** the notes written, or the one number, are exactly what `placeNumber`
  leaves that cell after every number on the board is placed

### Requirement: The hint starts on the implicit reading

Seismic SHALL offer the player the "Hints pencil in" choice and start on the
implicit reading, because an Easy board falls entirely to singles the board
shows.

#### Scenario: A new player's first hint

- **WHEN** a player who has never set "Hints pencil in" asks for a hint
- **THEN** the plan is built under the implicit reading

### Requirement: The hint deduces from the player's notes

The plan SHALL deduce from the player's pencil notes, and from what a
note-less cell's area and the numbers within reach leave it, rather than from
the givens alone. That is sound only because `findMistakes` flags every empty
cell whose notes have crossed out its answer, so wherever the hint runs every
cell's notes still hold that answer.

#### Scenario: A hint resumes from the player's own narrowed notes

- **WHEN** the player has narrowed some cells' notes without crossing out an
  answer and asks for a hint
- **THEN** the plan does not fill notes again, and following it finishes the board

### Requirement: The deductions the hint makes

The hint's deductions SHALL be: an empty area of one cell can only hold a 1; a
cell with one candidate left can only hold that number; a number with one cell
left in its area must go there, unless that cell's candidates are already down
to the number, which is the previous deduction; and a number is struck from
every cell outside an area that clashes, under the mode's keep-apart rule,
with every cell the area still has for that number. The last SHALL be taken
only when no other is available.

#### Scenario: An area starved of a number rules it out of every cell that clashes with all its homes

- **WHEN** every cell an area still notes for 3 lies within 3 cells, along a row
  or column, of a cell outside the area that also notes 3, and a hint is requested
  at that point in Seismic mode
- **THEN** the step strikes 3 from every such cell at once, rings those cells,
  hatches the area, and says the area can put its 3 only within that reach of them

#### Scenario: The naked-single phrasing is never used on a multi-candidate cell

- **WHEN** any Latin-family hint emits a placement step whose narration says "ruled
  out in this cell"
- **THEN** the cell's working notes are genuinely a single candidate (a true naked
  single); a hidden single uses its own narration instead

### Requirement: The starved-area deduction is the solver's trial rung

The starved-area deduction is the solver's trial rung in the form a player can
see: it SHALL strike exactly the candidates the trial rung rejects wherever it
is the next step, and every cell ruled out by one area and one number SHALL be
one step. It is a Check, so it SHALL be narrated directly. It SHALL never be
needed on an Easy board, whose certification uses the singles alone.

#### Scenario: An Easy board is never taught the trial

- **WHEN** a hint plan is followed from the deal to the end of an Easy board
- **THEN** no step of it is the starved-area deduction

### Requirement: The generator does not call the hint

The generator SHALL NOT call the hint, so no generated board changes with it.

#### Scenario: The hint's code changes

- **WHEN** a hint deduction is added or reworded
- **THEN** every seed deals the board it dealt before

### Requirement: Seismic draws its cells on a quiet surface and keeps its walls

`redraw` SHALL draw every cell the player fills on the collection's cell
surface and a cell holding a given number on the collection's lifted surface
of a given, with the given's number in ink and the player's in the entry
color. The line between two cells of one region SHALL be the collection's
surface grid line.

#### Scenario: A given is told by the cell under it

- **WHEN** the opening frame of a board is drawn
- **THEN** every cell holding a given is the lifted surface and every other
  cell is the plain cell surface

### Requirement: A region's wall is content

A region's wall, the frame round the board included, is content: it SHALL stay
in ink at its full width, and where two walls turn round a cell's corner they
SHALL meet in a solid corner.

#### Scenario: A wall is stronger than a grid line

- **WHEN** a board with a region of two or more cells is drawn
- **THEN** the line between two cells of that region is the surface's grid line
- **AND** the line between two regions is ink

### Requirement: The completion flash sweeps two beats over each cell's surface

The completion flash SHALL sweep a bright beat and a dim beat across the board
over each cell's own surface, in colors that read in both schemes.

#### Scenario: The flash moves

- **WHEN** the completion flash is drawn at three successive beats
- **THEN** the three frames differ, and each shows both the bright and the dim
  beat
