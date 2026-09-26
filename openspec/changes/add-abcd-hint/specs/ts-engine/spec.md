## MODIFIED Requirements

### Requirement: A candidate hint plan reads an unmarked cell the way the player chose

The candidate-elimination plan walk SHALL take a **reading** of a blank cell that
carries no notes, and a game on the walk SHALL offer the player the choice through the
shared `hint-notes` preference:

- **`populate`**: the cell is not filled in yet. The plan pencils every candidate in
  (the fill-all move), clears the obvious ones, and reads the notes alone from then on.
- **`implicit`**: the cell holds every value its no-repeat regions do not already hold.
  The plan SHALL emit no fill-all step. Before a firing's own steps it SHALL write, as
  legs continuing the firing's journey, the notes of every blank, note-less cell the
  firing outlines as evidence or names as read (`StepWords.reads`), or strikes without
  folding, each with the candidates that reading gives it. It SHALL NOT write the notes
  of a cell for a leg that places a value in that cell or comes after the one that
  does, and SHALL write them when a leg before the placing one outlines, reads or
  strikes the cell, since that leg rests on what the cell can still be. A note-less
  cell whose regions leave one value SHALL be placed as a single in its own words
  ("its row and column already hold every other number"), not as a cell whose notes
  collapsed.

Under the implicit reading a strike SHALL be **folded** when its marks lie in one
blank, note-less cell, its premise speaks of that cell alone (no `where`), and
no earlier leg of the firing reads or strikes the cell: its step
SHALL place the one value the strike leaves there, or write the several it leaves
as the cell's notes, instead of a note leg and a strike. What it leaves SHALL
account for any value an earlier fold in the same firing placed in one of the
cell's regions.

The notes the plan writes SHALL go on through a move that only adds notes
(`pencilAdd`), which `keepCandidateHintTrack` follows toggle by toggle and
`refreshCandidateHintStep` shrinks to the notes still unwritten, and which draws no
struck marks.

Each game SHALL start on a reading it states in its `newUi`: the convention is
`populate`, and a game overriding it SHALL say why. A caller asking for a hint without
a `Ui` SHALL get the game's own default. A plan whose game supplies its own setup SHALL
walk the populate reading only. Under the populate reading every cell a strike reaches
has notes, so nothing folds, and the plan's moves, highlights and journeys SHALL be
those it would have without folding.

#### Scenario: A sudoku is solved from singles with no notes

- **WHEN** a Solo board at Easy or Normal is hinted under the implicit reading
- **THEN** no step fills in or writes notes, and every placement is a single the board
  shows by its regions

#### Scenario: A strike from a note-less cell concludes with what it leaves

- **WHEN** under the implicit reading a firing strikes candidates from one cell with no
  notes that no earlier leg reads
- **THEN** one step, in the strike's words, places the value left or writes the values
  left as the cell's notes, and no note leg or strike step for that cell precedes it

#### Scenario: A cage deduction writes its cage's notes

- **WHEN** under the implicit reading a cage deduction (Keen, a Killer cage) strikes a
  candidate from one cell of a cage whose other cells carry no notes
- **THEN** every other blank cell of the cage has its notes written before the
  deduction's first step

#### Scenario: A later fold sees an earlier fold's placement

- **WHEN** a firing's first leg folds into a placement and a later leg folds a cell
  sharing a region with it
- **THEN** the later step leaves out the placed value

#### Scenario: A journey's first step rests on a cell a later leg places in

- **WHEN** under the implicit reading a firing's first leg outlines note-less cells as
  evidence and a later leg of the same firing places a value in one of them (ABCD's
  runs technique, which outlines a line and places in several of its cells)
- **THEN** that cell's notes are written before the firing's first step, like every
  other cell the step outlines

#### Scenario: Every enrolled game keeps its hint promises under either reading

- **WHEN** a game offers the preference and a plan is built under either reading on
  any mode or tier it offers
- **THEN** every step is live on the board it is shown on, the plan finishes a board
  whose tier needs no search, and a hint recomputed after every move solves the board
