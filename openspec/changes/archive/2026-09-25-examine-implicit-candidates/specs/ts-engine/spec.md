## ADDED Requirements

### Requirement: A candidate hint plan SHALL read an unmarked cell the way the player chose

The candidate-elimination plan walk SHALL take a **reading** of a blank cell that
carries no notes, and a game on the walk SHALL offer the player the choice through the
shared `hint-notes` preference:

- **`populate`**: the cell is not filled in yet. The plan pencils every candidate in
  (the fill-all move), clears the obvious ones, and reads the notes alone from then on.
- **`implicit`**: the cell holds every value its no-repeat regions do not already hold.
  The plan SHALL emit no fill-all step. Before a firing's own steps it SHALL write, as
  legs continuing the firing's journey, the notes of every blank, note-less cell the
  firing strikes, outlines as evidence, or names as read (`StepWords.reads`), each with
  the candidates that reading gives it, and never of a cell the firing places a value
  in. A note-less cell whose regions leave one value SHALL be placed as a single in its
  own words ("its row and column already hold every other number"), not as a cell
  whose notes collapsed.

The notes the plan writes SHALL go on through a move that only adds notes
(`pencilAdd`), which `keepCandidateHintTrack` follows toggle by toggle and
`refreshCandidateHintStep` shrinks to the notes still unwritten, and which draws no
struck marks.

Each game SHALL start on a reading it states in its `newUi`: the convention is
`populate`, and a game overriding it SHALL say why. A caller asking for a hint without
a `Ui` SHALL get the game's own default. A plan whose game supplies its own setup SHALL
walk the populate reading only. Under the populate reading the plan SHALL behave as it
did before the reading existed.

#### Scenario: A sudoku is solved from singles with no notes

- **WHEN** a Solo board at Easy or Normal is hinted under the implicit reading
- **THEN** no step fills in or writes notes, and every placement is a single the board
  shows by its regions

#### Scenario: A strike writes its cell's notes first

- **WHEN** under the implicit reading a firing strikes a candidate from a cell with no
  notes
- **THEN** the step before the strike, in the same journey, writes exactly that cell's
  implied candidates, and the strike then crosses out a note the board shows

#### Scenario: A cage deduction writes its cage's notes

- **WHEN** under the implicit reading a cage deduction (Keen, a Killer cage) strikes a
  candidate from one cell of a cage whose other cells carry no notes
- **THEN** every blank cell of the cage has its notes written before the strike

#### Scenario: Every enrolled game keeps its hint promises under either reading

- **WHEN** a game offers the preference and a plan is built under either reading on
  any mode or tier it offers
- **THEN** every step is live on the board it is shown on, the plan finishes a board
  whose tier needs no search, and a hint recomputed after every move solves the board

### Requirement: A set outlines the cells it rests on

A generic Latin set elimination SHALL record the cells whose candidates account for the
values it strikes, and a game's hint SHALL outline them as the step's evidence, so the
sentence that names them ("the outlined cells already account for …") points at cells
the player can see.

#### Scenario: A set's sentence names outlined cells

- **WHEN** a row/column game's hint strikes a candidate by a set
- **THEN** the step outlines the cells of the set and its sentence speaks of the
  outlined cells

## MODIFIED Requirements

### Requirement: A shared candidate-elimination hint plan

The engine SHALL provide the whole candidate-elimination hint *plan* walk
(`runCandidatePlan` in `src/engine/candidate-plan.ts`) for every pencil-notes game whose
hint sets and strikes candidate notes and places a value when a cell's notes collapse to
one, and such a game's `buildSteps` SHALL hand its plan to it — directly, or through a
preset over it — rather than walk, build or apply steps itself.

The walk SHALL own:

1. **The ladder**: the naked singles, then the game's own rungs, then the recorded
   strikes a plan could take now, then the recorded placements, in the note-free opening
   until setup is done and in the whole walk after it; the last-resort signal a rung
   needs (every earlier rung came up empty); the step budget and the iteration cap.
2. **The setup**: under the populate reading a lazy populate and then the
   obvious-candidate clean, and under the implicit reading the clean alone, unless the
   game supplies its own.
3. **The steps**: a rung returns firings as lists of legs — a placement, a strike, or a
   step of the game's own with its effect on the working board — and the walk builds
   each step from the game's words and evidence, adding the move, the `targets` (the
   move's cells, each once) and the `marks` itself, and under the implicit reading the
   note legs a firing's premise needs.
4. **The placement cull**: after a placement the walk strikes its value from the rest of
   the cell's no-repeat regions, as a leg continuing the placement's journey, or
   silently when the player's auto-pencil preference makes the placement's move do it.
5. **Journey continuation**: a firing is emitted whole, its later legs flagged
   `continuesPrevious`, so no game tracks which firing a step belongs to.

The game SHALL keep what carries its meaning: its recording solver, the
words and evidence of its steps, the axis its strikes split into legs on (dictated by
what the narration names singular), its own rungs, the deviations the walk names as
optional hooks, each stating the game-shaped fact that needs it, and its regions where
those are a decision the game makes rather than one its family has already answered.

The engine SHALL also provide the pure plan helpers over a working `(grid, pencil)` and a
recorded `DeductionRecord[]` script (every naked single, whether any empty cell lacks
notes, the first recorded placement not yet on the working grid, every still-live strike
firing a plan could take now excluding placement-bookkeeping `dup` elims, the next forced
placement, `joinNums`), and generic `keepCandidateHintTrack` and
`refreshCandidateHintStep` over the shared pencil-move shape (`set` / `pencilAll` /
`pencilStrike` / `pencilAdd`, read through a game's move dialect) and
`CandidateHighlights`.

The placement classifier in `src/engine/latin-hint.ts` SHALL classify over an arbitrary
region list, so a game reasoning over sub-blocks and diagonals (Solo) classifies a hidden
single in any of its regions, while a plain row/column square reasons over `[row,
column]` alone.

The walk is hint-plan plumbing only: the solvers and the generator/solve paths SHALL NOT
change because of it.

#### Scenario: A hidden single is classified in a non-row/column region

- **WHEN** a game reasoning over sub-blocks or diagonals (Solo) forces a placement that
  is a hidden single within a sub-block or diagonal
- **THEN** the shared classifier identifies the region and the narration names it
  (e.g. "in this block / diagonal, N can go in only this cell"), the same way the
  row/column games name a row or column

#### Scenario: A placement's cull continues its journey

- **WHEN** a plan places a value with auto-pencil off and other cells of its row or
  column still note that value
- **THEN** the next step strikes it from exactly those cells, flagged
  `continuesPrevious`, and the working notes no longer hold it there
- **AND** with auto-pencil on no such step is emitted, the notes are struck all the
  same, and the placement's move carries the cull

#### Scenario: A firing is one journey

- **WHEN** one recorded firing strikes candidates the game's narration must show as
  several legs (several heights in Towers, both ends of a link in Unequal, several
  cells of a cage in Keen)
- **THEN** the legs are consecutive steps, the first unflagged and the rest flagged
  `continuesPrevious`, with no other firing's step between them

#### Scenario: A game's steps are built by the walk

- **WHEN** any game that walks its plan with the shared candidate-plan walk, by any
  entry into it, emits a placement or a
  strike
- **THEN** the step's move is the game's own placement or strike move, its `targets`
  are the cells that move acts on, each once, and its `marks` are the candidates it
  strikes
