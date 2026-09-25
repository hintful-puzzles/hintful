## REMOVED Requirements

### Requirement: A shared narrator for generic Latin deduction reasons

**Reason**: It required the shared narrator's arms to render sentences
byte-identical to the per-game strings they replaced, and it covered the strike
arms (`dup`, `set`, `forcing`) as whole sentences. A strike's conclusion is now
the candidate walk's, so those arms give a premise instead, and the sentences
they end in changed on purpose.
**Migration**: Restated below as "A shared narrator for generic Latin
placements and strike premises", with the conforming local outcomes for Solo
and Towers kept.

### Requirement: A candidate hint plan SHALL read an unmarked cell the way the player chose

**Reason**: Under the implicit reading it required a note leg before every
strike from a note-less cell, and its scenarios asserted it ("A strike writes
its cell's notes first"; a cage's struck cell noted before the strike). Such a
strike now concludes with what it leaves, so the note leg and the strike are one
step.
**Migration**: Restated below as "A candidate hint plan reads an unmarked cell
the way the player chose", with the fold and its limits stated and the
surviving scenarios carried over.

## ADDED Requirements

### Requirement: A shared narrator for generic Latin placements and strike premises

The shared hint-text module (`src/engine/hint-text.ts`) SHALL provide
`narrateLatinReason(reason, n, vocab?)`, which renders the generic Latin
placement reasons (`single`, `regionsFull`, `hiddenSingle`), and
`latinPremise(reason, ns, vocab?)`, which renders the premise of the generic
Latin strike reasons (`dup`, `set`, `forcing`) for the candidate walk to
conclude. A row/column game (Keen, Unequal, Group, Mathrax, Salad) SHALL
delegate those arms to them and keep its game-specific arms local. Each SHALL
refuse a reason of the other half rather than narrate it.

A game whose generic-arm wording legitimately diverges SHALL keep its own
narration rather than carry overrides into the shared narrator: **Solo** (its
arms name a block or diagonal region) and **Towers** (it narrates in "height"
vocabulary with a single value) are conformingly left local, and share only the
forcing-chain premise (`forcingChainPremise`).

#### Scenario: A delegated placement arm narrates the shared sentence

- **WHEN** a row/column game places a value for a generic single
- **THEN** its sentence is the shared narrator's, in the game's value vocabulary

#### Scenario: A narrator refuses the other half

- **WHEN** `narrateLatinReason` is handed a strike reason, or `latinPremise` a
  placement reason
- **THEN** it throws, naming the function that narrates that reason

### Requirement: A candidate strike SHALL end in the walk's conclusion

A candidate-elimination game on the shared plan walk SHALL give a strike's words
as a **premise** (`Premise` in `src/engine/hint-text.ts`): the clause saying why
the struck values go, without a conclusion. The walk SHALL end every strike's
sentence with the plan's `conclude` words for the move its step makes: a strike
("so we must cross out 2 and 4"), a placement ("so this cell must be 3") or a
note of the values left ("so pencil in only 1 and 5"). The row/column preset
SHALL build `conclude` from the game's `notes` vocabulary; a game off the preset
SHALL supply its own.

A premise MAY say how the conclusion refers to the struck notes: `where` for a
strike that reaches beyond the cell it is about, `struck` where a word names
the notes better than a list of their values, and `named` where the premise
already named the values, so the conclusion refers back to them.

#### Scenario: A game writes no strike conclusion

- **WHEN** a game on the walk narrates any strike
- **THEN** its words carry a premise and no explanation, and the step's sentence
  is that premise followed by the walk's conclusion for the step's move

#### Scenario: A premise that names the values is not repeated

- **WHEN** a strike's premise is marked `named`
- **THEN** its conclusion refers to the struck values by a pronoun rather than
  listing them again

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
  folding, each with the candidates that reading gives it, and never of a cell the
  firing places a value in. A note-less cell whose regions leave one value SHALL be
  placed as a single in its own words ("its row and column already hold every other
  number"), not as a cell whose notes collapsed.

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

#### Scenario: Every enrolled game keeps its hint promises under either reading

- **WHEN** a game offers the preference and a plan is built under either reading on
  any mode or tier it offers
- **THEN** every step is live on the board it is shown on, the plan finishes a board
  whose tier needs no search, and a hint recomputed after every move solves the board
