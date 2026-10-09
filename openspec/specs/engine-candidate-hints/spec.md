# engine-candidate-hints Specification

## Purpose
The hint plan shared by the candidate-elimination games: the entry and the
walk that turn a solver's recorded firings into steps, the order the frontier
takes them in, the regions and the two readings of an unmarked cell the walk
works over, the Latin family's shared narration, and the premise each recorded
firing names, with the guards that hold it.

## Requirements

### Requirement: A shared candidate-elimination hint entry

The shared candidate-elimination module SHALL provide a `candidateHint` entry
that owns the `Game.hint` control flow common to every candidate-elimination
game: read the `autoPencil` preference, off when there is none, and the reading
of an unmarked cell, build the plan through the game's `buildSteps`, refuse with
the standard deduction-exhausted message when the plan is empty, and otherwise
return the steps. A game's `hint` SHALL be one call passing its `buildSteps`
and its `Ui`, or none.

#### Scenario: An empty plan refuses

- **WHEN** a game's `buildSteps` returns no step
- **THEN** the entry refuses with the sentence every hint gives when deduction
  is exhausted, and the game writes no refusal of its own

#### Scenario: A hint with no preference teaches the cull

- **WHEN** a hint is asked for with no auto-pencil preference to read
- **THEN** the plan is built with auto-pencil off, so each placement's cull is a
  strike step

### Requirement: Candidate-elimination hints clean obvious candidates at populate

A candidate-elimination game's hint plan SHALL, once pencil notes first exist on
the working board, whether the plan just populated them or the board was already
noted, emit one bulk obvious-candidate cleanup step that removes every penciled
value already placed in one of its cell's uniqueness regions, as the second
press of the adaptive "fill all pencil marks" control does
(`obviousCandidateMarks`). A game whose hint has no region-uniqueness populate
is unaffected.

#### Scenario: A hint's populate fills then bulk-clears the obvious candidates

- **WHEN** an auto-played hint populates the notes on a board carrying placed values
  (givens, or placements the plan made before populate)
- **THEN** the populate journey first fills `1..n` in every empty cell, then strikes in one
  `continuesPrevious` step every candidate already placed in its row/column/region, leaving
  the same notes the adaptive Mark-all control would produce

### Requirement: The obvious-candidate cleanup is one strike step

The cleanup SHALL be a single `pencilStrike` step with its marks baked in at
plan time. It SHALL be flagged `continuesPrevious` when it directly follows
the populate fill, so that fill and clean read and auto-play as one setup
journey, and SHALL stand alone when the board was already noted. The struck
marks SHALL be applied to the plan's working notes, so the rest of the walk
sees the cleaned board.

#### Scenario: The cleaned-note plan still replays and refreshes

- **WHEN** the populate-plus-clean journey is followed, undone/redone, or re-requested
- **THEN** the `pencilStrike` cleanup replays exactly (its marks were baked at plan time),
  `hintKeepTrack` and `refreshHintStep` treat it as an ordinary strike step, and the hint
  resume guarantees hold

### Requirement: The obvious-candidate cleanup fires once, and only when it strikes

The cleanup SHALL fire only when there is something obvious to remove: once when
the board is already noted and once after the populate, and not again while the
plan's own per-placement cleanup keeps the notes clean. An empty cleanup SHALL
emit no step.

#### Scenario: Nothing obvious, no step

- **WHEN** the notes exist and no note repeats a value placed in its cell's
  regions
- **THEN** the plan holds no cleanup step

### Requirement: The bulk clean replaces the per-given opening

The plan SHALL NOT separately re-teach the obvious row, column and region
eliminations one firing at a time: the bulk clean subsumes the per-given
basic-region opening.

#### Scenario: The obvious eliminations are not taught again

- **WHEN** a plan has populated and cleaned the notes of a board with givens
- **THEN** no later step strikes a note only because a value that was already
  placed at the clean sits in its region

### Requirement: A classified placement rests only on strikes the board shows

The shared placement classifier (`classifyPlacementInRegions`, with
`classifyPlacement` and `singlePlacementReason` over it) SHALL answer only
naked, where the cell's notes are exactly the placed value, or hidden, where no
other empty cell of one of the given regions still notes it. A placement the
notes show as neither rests on a strike the plan never placed, and the
classifier SHALL throw an error saying so and SHALL NOT return a reason for it.

#### Scenario: A placement the notes cannot explain throws

- **WHEN** the classifier is asked about a placement whose cell still notes another value
  and whose value is still noted in another empty cell of each of its regions
- **THEN** it throws an error naming the placement and the skipped strike, and returns no
  reason

### Requirement: No narration exists for a placement the notes cannot explain

No hint narration SHALL exist for a placement the notes show as neither a naked
nor a hidden single: the family has no `forcedSingle` reason, and Salad no
`forcedCross` or `forcedCircle`. Salad's plan SHALL likewise throw when, with
every recorded strike and placement on its working board, the solver still
forces a marker the board lacks. The cross-game hint walks are the guard, since
every plan that classifies a placement passes through the classifier: a game
joins by calling it.

#### Scenario: A plan that skips a strike fails the hint walks

- **WHEN** a Latin-family plan places a value without striking it from its lines' notes and
  a later placement reads those notes
- **THEN** walking hints over that game throws from the classifier, so the gate fails

### Requirement: A placement is classified against the candidates the board shows

A hint plan SHALL classify a placement against the candidates the board shows: a
written note as written, stale or not, and a blank cell with no notes as every
value not already placed in its regions, so that a hidden single is claimed only
where the board shows one. The plan SHALL strike every stale note, the player's
or its own, before it takes a recorded strike, and SHALL strike each value it
places, including every leg of a multi-leg placement journey, from its lines'
notes.

#### Scenario: A player's stale note is struck before a recorded strike

- **WHEN** a Group hint is requested on a board whose notes still carry a value
  the player has since placed in the same row
- **THEN** a single the plan places first is a naked or hidden single in the
  notes as written, and the plan strikes the stale note before it takes any
  recorded strike

#### Scenario: A note-free board's placements are narrated by what the board shows

- **WHEN** a Group hint places values before any notes exist
- **THEN** every "In this row" or "In this column" placement is one where no other empty
  cell of that line could take the value given its own row and column

### Requirement: A candidate hint plan continues from its latest steps where it can

When several firings are available at one position of a candidate-elimination
hint plan, the plan SHALL take one whose premise reads a cell that the firing it
took last wrote, and failing that one reading what the firing before it wrote,
up to three firings back. Among the firings that qualify at the same depth, and
when none qualifies, the plan's own rung order SHALL decide, so a plan with no
earlier step opens exactly as the rung order says.

#### Scenario: a firing beside the last step is taken over an easier one elsewhere

- **WHEN** a plan has just struck notes in one row, a strike reading that row is
  available, and a naked single sits in a cell sharing no line with anything the step
  wrote
- **THEN** the plan takes the strike next, though the naked single's rung comes first

#### Scenario: a firing continues from the evidence it shades

- **WHEN** two firings are available after a step that wrote one cell, the rung order
  prefers the first, and only the second shades that cell as evidence, acting on a
  cell elsewhere
- **THEN** the plan takes the second

### Requirement: The engine owns the choice and reads a premise off the steps

The engine SHALL own the choice (`HintFrontier`, which the shared
candidate-plan walk drives) and SHALL read each firing's premise off the steps
the firing would push: the `area ∪ hatch ∪ reads ∪ targets` of every one of
them, built before the choice and pushed unchanged if it is taken. No firing
SHALL carry a second statement of its premise. The frontier SHALL read what a
firing wrote from the `targets` of the steps it pushed.

#### Scenario: The steps the premise was read from are the steps pushed

- **WHEN** the frontier takes a firing
- **THEN** the steps added to the plan are the ones its premise was read from,
  and what the frontier holds as written is their `targets`

### Requirement: A firing is offered only when the board shows its premise

The game SHALL own which firings of its own rungs are available, and the walk
SHALL own which recorded firings are. A firing SHALL be offered to the frontier
only when the working board already shows its premise. A recorded firing SHALL
be judged by one rule whether it strikes or places: it is available when nothing
the board does not show yet comes before it in the recording, or when its
premise cells hold none of the marks the board does not show yet.

#### Scenario: a firing is offered only when the board shows its premise

- **WHEN** a strike's premise cells still hold a mark an earlier recorded firing has
  yet to strike
- **THEN** the strike is not offered to the frontier until that mark is struck

### Requirement: The marks a recorded firing waits on

The marks the board does not show yet SHALL be a live mark an earlier recorded
firing has yet to strike, and the cell of a recorded placement the board has not
made with every cell its value rules out that still shows the value. A strike's
premise SHALL be its steps' whole premise; a placement's SHALL leave out the
cells it places.

#### Scenario: a strike past an unmade placement is offered by its premise

- **WHEN** the solver records a strike after a placement the board has not made
- **THEN** the strike is offered when its premise reads neither that placement's cell
  nor a cell holding one of its live culls, and withheld when it reads either

### Requirement: No recorded firing waits on its place in the recording

A placement the notes show as a naked or hidden single SHALL be offered as the
notes show it. No recorded firing SHALL be withheld only because of its position
in the recording, or held back as a last resort while its premise holds.

#### Scenario: a clue-forced placement is offered where its premise holds

- **WHEN** the solver records a placement with a reason of its own, and a strike the
  board supports is also available
- **THEN** the placement is offered beside the strike when its evidence reads no mark
  the board does not show yet, and withheld when it reads one

### Requirement: A single reads the placed cells it rests on through a note-less cell

A single's step SHALL carry in its `reads` the placed cells it rests on through
a cell with no notes, which the walk adds and nothing draws: for a single in a
cell with no notes, every placed cell ruling out one of the cell's other values;
for a hidden single, the placed cells ruling the value out of each blank cell of
its region that has no notes.

#### Scenario: a placement continues into the single it completes

- **WHEN** under the implicit reading a plan places a value in a region, leaving one
  cell of the region with no notes and one value its regions do not hold
- **THEN** that single's step reads the placed cell, and the plan takes it next over a
  single elsewhere that the rung order reaches first

### Requirement: The frontier keys only on the plan's own steps

The frontier SHALL key only on the plan's own earlier steps, never on the
midend's displayed step or the player's moves, so the same board always yields
the same plan. The choice SHALL stay on the hint path: no generator or solver
explores in a different order because of it.

#### Scenario: Two histories of one board hint alike

- **WHEN** a hint is asked for on two identical boards the player reached by
  different moves
- **THEN** the two plans are the same

### Requirement: Plan continuity is measured over a derived population

The population the continuity guard measures SHALL be derived from the games'
own sources: every game that walks its plan with the shared candidate-plan
walk, by any entry into it. The guard SHALL walk every reading of an
unmarked cell a game offers the player, derived from the game's `Ui`, and SHALL
read each step's premise as the frontier does.

#### Scenario: the plans are measured from outside

- **WHEN** the plans of every game that walks its plan with the shared candidate-plan
  walk, by any entry into it, are walked over its
  presets and each step that reads nothing its predecessor wrote is checked for a later,
  already-available firing that did
- **THEN** fewer than one such step in ten passed over one, and the check fails when
  the frontier's preference is reversed

### Requirement: A reading over the continuity bound is named in a ledger

A reading known to exceed the continuity bound SHALL be named, with the change
that owns it, in a ledger the guard holds still over the bound.

#### Scenario: both readings are measured

- **WHEN** a game offers the player both readings of an unmarked cell
- **THEN** its plans are measured under each, and a reading over the bound fails the
  guard unless the ledger names it, while a named reading that has come under the
  bound fails it too

### Requirement: A cell's regions are one definition per relation

A candidate-elimination game SHALL declare "the regions of a cell" once, as the
regions a placed value may not repeat in, each flagged with whether it also
holds every value once (`CellRegion.holdsEvery`), and every consumer SHALL
derive its relation from that one declaration. The placement classifier SHALL
read the regions that hold every value and itself skip one flagged
`holdsEvery: false`, since a value with one home left in a region must go there
only if the region has to hold it.

#### Scenario: The classifier skips a region that need not hold every value

- **WHEN** a placement's value is noted by no other cell of a region declared
  `holdsEvery: false`, and by another cell of each of its whole regions
- **THEN** the classifier does not call it a hidden single in that region

### Requirement: Every notes cull reads every declared region

Every declared region SHALL be read by every notes cull: the placement's
duplicate strike (`regionDuplicateMarks`), the obvious-candidate clean,
Mark-all's clean and the player's auto-pencil.

#### Scenario: The consumers of a relation agree on a cell's regions

- **WHEN** a candidate-elimination game's hint culls a placement's duplicates, cleans
  the obvious candidates, and the player places a value with auto-pencil on
- **THEN** all three strike the value from the same regions, and the hint's culls leave
  no note standing that the solver has struck

### Requirement: Only two kinds of region are declared

Holding every value implies forbidding repeats, so a declared region SHALL be
one of two kinds. A region that only forbids repeats, such as a Solo Killer
cage, SHALL be declared with `holdsEvery: false`. A region with neither
property, such as a Keen cage, SHALL NOT be declared, since no consumer reads
it. A game whose regions carry a tag for naming a hidden single SHALL tag only
the regions that hold every value, so that the type refuses a partial region
declared as whole.

#### Scenario: A cage is not a uniqueness region

- **WHEN** the game is Keen (digits may repeat within an arithmetic cage)
- **THEN** `regionsOf` returns only the row and column, so neither the cleanup nor the
  basic-strike removes a candidate that is legal under the cage constraint

#### Scenario: A Killer cage forbids repeats without holding every digit

- **WHEN** the game is Solo with Killer cages and a value is placed in a cage
- **THEN** the culls strike that value from the rest of the cage, and the classifier
  never calls a placement a hidden single in its cage

### Requirement: Latin-family hints distinguish naked and hidden singles

A Latin-square-family game's hint SHALL narrate a forced single placement by the
deduction that forces it, re-derived from the working board and not from the
solver's recorded reason. This applies to every game on the shared Latin solver
and to Solo. The classifier SHALL consider only empty cells as competitors for a
value. A game SHALL reclassify only a recorded `single` placement: a game's own
clue-driven or region-driven forced placements keep their own reasons.

#### Scenario: A clue-forced placement keeps its reason

- **WHEN** a Towers plan takes a recorded facing-clue placement
- **THEN** the step narrates the recorded reason and is not reclassified as a
  single

#### Scenario: The naked-single phrasing is never used on a multi-candidate cell

- **WHEN** any Latin-family hint emits a placement step whose narration says "ruled
  out in this cell"
- **THEN** the cell's working notes are a single candidate, a true naked single,
  and a hidden single uses its own narration

### Requirement: A naked single shades its cell and a hidden single its region

A naked single, where the cell's own candidates are exactly the value, SHALL be
narrated "Every other number has been ruled out in this cell, so it can only be
N", in the game's value word, with the cell alone as evidence. A hidden single,
where no other empty cell of a region can still take the value and the cell
itself still shows several candidates, SHALL be narrated by its region ("Every
other cell in this row rules out N, so this cell must be N"), with the whole
region shaded as evidence.

#### Scenario: A hidden single is narrated by its line

- **WHEN** a Latin-family hint forces a placement into a cell that still shows several
  candidates, because the placed digit fits nowhere else in its row (or column)
- **THEN** the narration names the line ("every other cell in this row/column rules out
  N, so this cell must be N"), not "every other number has been ruled out in this cell"
- **AND** the whole row (or column) is shaded as evidence, the cell marked as the
  placement target

### Requirement: A shared candidate-elimination hint plan

The engine SHALL provide the whole candidate-elimination hint plan walk
(`runCandidatePlan`) for every pencil-notes game whose hint sets and strikes
candidate notes and places a value when a cell's notes collapse to one. Such a
game's `buildSteps` SHALL hand its plan to it, directly or through a preset over
it, and SHALL NOT walk, build or apply steps itself. The walk is hint-plan
plumbing only: the solvers and the generate and solve paths SHALL NOT change
because of it.

#### Scenario: A game's steps are built by the walk

- **WHEN** any game that walks its plan with the shared candidate-plan walk, by any
  entry into it, emits a placement or a
  strike
- **THEN** the step's move is the game's own placement or strike move, its `targets`
  are the cells that move acts on, each once, and its `marks` are the candidates it
  strikes

### Requirement: The walk owns the ladder

The walk SHALL own the ladder: the naked singles, then the game's own rungs,
then the recorded strikes a plan could take now, then the recorded placements.
Until the setup is done it SHALL offer the note-free opening, which is the
singles and the game's own rungs, and after it the whole ladder. It SHALL own
the last-resort signal a rung needs, that every earlier rung came up empty, and
the step budget and the iteration cap.

#### Scenario: The opening holds the recorded strikes back

- **WHEN** a plan starts on a board whose notes are not set up, and a rung of
  the game's own has a firing
- **THEN** a firing of the opening is taken before the setup's next step, and
  no recorded strike is taken until the setup is done

### Requirement: The walk owns the setup

Unless the game supplies its own setup, the walk SHALL set the notes up: under
the populate reading a lazy populate and then the obvious-candidate clean, and
under the implicit reading the clean alone.

#### Scenario: Nothing is penciled in until it is needed

- **WHEN** a populate-reading plan starts on a board with no notes and a rung
  of the game's own has a firing that needs none
- **THEN** that firing comes before the fill, and the fill and the clean follow
  once the opening has nothing left

### Requirement: The walk builds every step from the game's words

A rung SHALL return firings as lists of legs: a placement, a strike, or a step
of the game's own with its effect on the working board. The walk SHALL build
each step from the game's words and evidence, adding the move, the `targets`
(the move's cells, each once) and the `marks` itself, and under the implicit
reading the note legs a firing's premise needs.

#### Scenario: A game states no targets

- **WHEN** a game's words for a strike over three cells name its evidence
- **THEN** the walk's step targets those three cells, each once, and its marks
  are the struck candidates

### Requirement: A placement's cull continues its journey

After a placement the walk SHALL strike its value from the rest of the cell's
no-repeat regions, as a leg continuing the placement's journey, or silently when
the player's auto-pencil preference makes the placement's move do it.

#### Scenario: A placement's cull continues its journey

- **WHEN** a plan places a value with auto-pencil off and other cells of its row or
  column still note that value
- **THEN** the next step strikes it from exactly those cells, flagged
  `continuesPrevious`, and the working notes no longer hold it there
- **AND** with auto-pencil on no such step is emitted, the notes are struck all the
  same, and the placement's move carries the cull

### Requirement: A firing is emitted whole

A firing SHALL be emitted whole, its later legs flagged `continuesPrevious`, so
no game tracks which firing a step belongs to.

#### Scenario: A firing is one journey

- **WHEN** one recorded firing strikes candidates the game's narration must show as
  several legs (several heights in Towers, both ends of a link in Unequal, several
  cells of a cage in Keen)
- **THEN** the legs are consecutive steps, the first unflagged and the rest flagged
  `continuesPrevious`, with no other firing's step between them

### Requirement: The game keeps what carries its meaning

A game on the walk SHALL keep what carries its meaning: its recording solver,
the words and evidence of its steps, the axis its strikes split into legs on,
which what the narration names singular dictates, its own rungs, the deviations
the walk names as optional hooks, each stating the game-shaped fact that needs
it, and its regions where those are a decision the game makes and not one its
family has already answered.

#### Scenario: The strike axis follows the narration

- **WHEN** a game's narration names one cell at a time and its strike axis keys
  a firing's strikes by cell
- **THEN** the firing becomes one leg per cell, in the order the cells first
  appear in it

### Requirement: A placement's bookkeeping is not a firing to teach

The recorded strike firings a plan could take now (`availableFirings`) SHALL
be the still-live ones, and SHALL leave out the placement-bookkeeping `dup`
eliminations, which the walk strikes as the placement's own cull.

#### Scenario: A placement's bookkeeping is not a firing to teach

- **WHEN** a recording holds a live `dup` elimination and a live elimination
  with a reason of another kind
- **THEN** the strike firings a plan could take now hold the second and not the
  first

### Requirement: The shared track and refresh read a game's move dialect

The engine SHALL provide generic `keepCandidateHintTrack` and
`refreshCandidateHintStep` over the shared pencil-move shape (`set`,
`pencilAll`, `pencilStrike`, `pencilAdd`), read through a game's move dialect,
and over `CandidateHighlights`.

#### Scenario: A strike followed one note at a time stays on track

- **WHEN** the player clears one of a strike step's marks with a pencil toggle
- **THEN** the step shrinks to the marks left and stays on track, and clearing
  the last one completes it

### Requirement: A row/column Latin square answers no question its regions already settle

The engine SHALL provide a preset over the candidate-elimination plan walk
(`runLatinCandidatePlan`) supplying every plan field whose answer is forced once
a game's cells' no-repeat regions are exactly a row and a column, so that a
plain Latin game supplies its recording solver, its own rungs and its own words
and nothing else. Every game SHALL remain free to call the general entry point,
and a game that does SHALL say why.

#### Scenario: A plain Latin game declares no regions

- **WHEN** a candidate-elimination game whose cells' no-repeat regions are exactly a row
  and a column walks its hint plan
- **THEN** it passes no region function, no single-reason function and no hidden-single
  evidence area, and its hidden singles are still classified in, narrated by and shaded
  along the correct line

### Requirement: The fields the row/column preset supplies

The preset SHALL supply the regions, the row and the column of the cell in
narration-preference order; the reason a single narrates as, naked or hidden in
the region the classifier found; and the setup sentences, the note sentence and the
conclusions, built from the game's `notes` vocabulary (its value noun, its verb
for a value already on the board), which does not hold the phrase naming the
regions. It SHALL add no evidence to a placement: the words that name a hidden
single's line stripe it.

#### Scenario: The setup sentences name the regions without being told them

- **WHEN** a game on the preset supplies only its value noun and its placement verb
- **THEN** the populate and obvious-clean steps read in that game's words and name its
  cells' row and column, and no game on the preset states that phrase itself

### Requirement: A game reasoning over other regions cannot take the preset

A game whose singles narrate over any other region SHALL be unable to take the
preset: the preset's parameter type SHALL fail to type-check for a reason union
that cannot hold the single reason the preset synthesizes, and SHALL NOT rely on
a convention or a roster to keep such a game away.

#### Scenario: A game reasoning over other regions cannot take the preset

- **WHEN** a game whose hidden singles name a sub-block, a diagonal or a cage is written
  against the preset
- **THEN** it fails to type-check, and the game walks its plan through the general entry
  point instead

### Requirement: A region's name is read off the region

A candidate-elimination game whose narration cites which kinds of region a value
may not repeat in SHALL read those words off the regions it declares ("A cell's
regions are one definition per relation"), never from a second list restating
the same fact. The reader's word SHALL be a property of the declared region, so
that a region added to the declaration cannot be built without saying what a
sentence citing it calls it.

#### Scenario: A word is not a second statement of the regions

- **WHEN** a game gains a kind of region a value may not repeat in
- **THEN** the sentences citing the kinds of region name it without a second edit, and a region carrying no word does not compile

### Requirement: A region's word is not the tag that names a hidden single

A region's word SHALL NOT be carried by the tag that names a hidden single: that
tag is present only on the regions holding every value, and a game can forbid
repeats in a region that holds no full set, such as a Solo Killer cage, which a
sentence still has to name.

#### Scenario: A region that holds no full set is still named

- **WHEN** a value is placed on a Solo Killer board
- **THEN** the sentence names the cage among the regions the value may not repeat in, and the cage carries no tag naming a hidden single

### Requirement: A citation repeats names, not regions

Names, not regions, SHALL decide what a citation repeats: a cell lying in two
regions the game calls by one word cites that word once. A citation that speaks
for the whole board at once, as the opening clean does in culling every cell's
notes in a single step, SHALL name the union of the board's regions and not any
one cell's, so a cell lying in none of an optional kind is still told its notes
were cleaned against that kind.

#### Scenario: Two regions the game calls by one word are cited once

- **WHEN** a value is placed on a Solo X board in the cell both diagonals pass through
- **THEN** the sentence says its row, column, block and diagonal, naming the diagonal once

#### Scenario: The board-wide clean names a region the cell is not in

- **WHEN** the opening clean of a Solo X board culls the notes of a cell lying on neither diagonal
- **THEN** its sentence still names the diagonal, because the one step cleans every cell of the board

### Requirement: A candidate game's regions may come from a partition

The shared candidate machinery SHALL accept a game whose uniqueness regions come
from a disjoint-set partition and not from row/column arithmetic, with no engine
change: the game supplies `regionsOf` returning each cell's member list and
whether that region holds every value once. A region SHALL be marked as holding
every value only when it must, which for a partition is a property of the
region's size and not of the game. A region that merely forbids repeats SHALL
NOT be so marked.

#### Scenario: A partition-region game classifies its singles correctly

- **WHEN** a candidate-elimination game whose regions come from a partition
  reaches a placement the notes show as a hidden single
- **THEN** the shared classifier names the region that forces it, and a region
  too small to hold every value is not offered as the reason

### Requirement: A deduction over a graph is a reason, not a plan shape

A candidate-elimination game whose solver reasons over a graph (reachability,
connectivity, a cycle that must not close) SHALL express those deductions as
ordinary recorded candidate eliminations carrying a game-specific reason, and
SHALL NOT make them rungs of the plan's own-rungs slot. The own-rungs slot SHALL
remain for a firing whose move the canonical placement and strike shapes cannot
express.

#### Scenario: A reachability deduction needs no plan extension

- **WHEN** a game's solver strikes a candidate because following it would close a
  cycle, or because it is the only candidate that can still reach a required
  cell
- **THEN** the elimination is recorded like any other, the plan narrates it from
  its reason, and the game supplies no rung of its own for it

### Requirement: A premise that asserts a walk is computed and numbered

A premise that asserts a walk SHALL be computed and checked, not assumed, and
SHALL be presented to the player as an ordered, numbered area so the walk is one
they can follow.

#### Scenario: The walk a sentence names is on the board

- **WHEN** a strike's premise says that following a candidate leads back to the
  cell it started from
- **THEN** the cells of that walk are the ones found on this board, outlined
  and numbered in the order the player follows them

### Requirement: The recording path steps the ladder one firing at a time through the engine

The engine SHALL provide, beside the deduction-fixpoint runner, a driver that
runs the same ladder one firing per call (`singleFirings`), and a hint that
records a firing at a time SHALL use it and SHALL NOT bend the runner's
early-out into a stop condition. The driver and the runner SHALL share one pass
down the ladder, so the tier cap, the restart rule and the budget cannot differ
between the solver's projection and the hint's.

#### Scenario: One firing per call

- **WHEN** a hint calls the driver on a board where two techniques each have
  work to do
- **THEN** each call returns exactly one firing, restarting from the easiest
  technique
- **AND** a call after the ladder is exhausted returns nothing

### Requirement: A call of the driver returns one firing, and a contradiction is sticky

Each call SHALL run the ladder from its first technique and return the technique
that fired, or nothing when no technique fires or the early-out says there is
nothing left to do. A contradiction SHALL be sticky: once a technique proves the
board inconsistent, the driver SHALL report it and SHALL run no technique again.
The step budget SHALL be required, and its attribution tally SHALL outlive a
single call, so a technique that runs away across many calls is named.

#### Scenario: A contradiction stops the driver for good

- **WHEN** a technique proves the board inconsistent
- **THEN** the driver reports the contradiction and returns nothing
- **AND** no technique runs on any later call

### Requirement: The driver returns a firing the player cannot see

The driver SHALL return every firing, including one that changed nothing the
player can see. Whether a firing is shown SHALL be the plan loop's decision,
where a hidden firing still advances the board and is counted: a driver that
skipped such firings would hide them where nothing counts them.

#### Scenario: A firing with nothing to show is still returned

- **WHEN** a technique fires but records no move the player could make
- **THEN** the driver returns it like any other firing
- **AND** the plan loop's `showable` hides it and counts it as hidden

### Requirement: The hint frontier keys on whatever a game's steps act on

`HintFrontier` SHALL take a key naming what a step reads and writes, and SHALL
NOT assume a cell of a grid: a grid game SHALL pass `gridKey(w, h)`, under which
a cell off the board keys to nothing, and a game whose elements are not cells
SHALL pass its own, as Map, whose elements are regions of a graph, keys each as
its index. The key SHALL NOT change the continue rule.

#### Scenario: A graph game continues from the region it just colored

- **WHEN** a Map hint step colors a region and leaves a neighbor with one color,
  and the next step is chosen
- **THEN** the step taken reads a region the last firing wrote

### Requirement: A game taking the frontier directly is held by a ledger

A game that takes the frontier directly and not through the candidate walk SHALL
be derived from its own source and held to an exact ledger naming the guard that
checks its continuity, because the cross-game measurement reads a grid and would
otherwise leave it out without saying so.

#### Scenario: A new direct user of the frontier is not missed

- **WHEN** a hinting game constructs a `HintFrontier` without walking a candidate
  plan and has no ledger entry
- **THEN** the frontier's cross-game test fails and names it

### Requirement: A shared narrator for generic Latin placements and strike premises

The shared hint-text module SHALL provide `narrateLatinReason`, which renders
the generic Latin placement reasons (`single`, `regionsFull`, `hiddenSingle`),
and `latinPremise`, which renders the premise of the generic Latin strike
reasons (`dup`, `set`, `forcing`) for the candidate walk to conclude. A
row/column game SHALL delegate those arms to them and keep its game-specific
arms local. Each SHALL refuse a reason of the other half and SHALL NOT narrate
it.

#### Scenario: A delegated placement arm narrates the shared sentence

- **WHEN** a row/column game places a value for a generic single
- **THEN** its sentence is the shared narrator's, in the game's value vocabulary

#### Scenario: A narrator refuses the other half

- **WHEN** `narrateLatinReason` is handed a strike reason, or `latinPremise` a
  placement reason
- **THEN** it throws, naming the function that narrates that reason

### Requirement: A game whose generic wording diverges keeps its own narration

A game whose generic-arm wording legitimately diverges SHALL keep its own
narration and SHALL NOT carry overrides into the shared narrator: Solo, whose
arms name a block or diagonal region, and Towers, which narrates in "height"
vocabulary, are conformingly left local. They SHALL share the premises that read
the same in every game: the forcing chain's (`forcingChainPremise`), a value
confined across lines (`confinedPremise`) and the placement cull's
(`placedRulesOut`).

#### Scenario: Towers words its own singles and shares a chain

- **WHEN** a Towers hint narrates a hidden single, and later a forcing chain
- **THEN** the single's sentence is Towers' own, and the chain's premise is the
  one `forcingChainPremise` writes, in heights

### Requirement: A candidate strike SHALL end in the walk's conclusion

A candidate-elimination game on the shared plan walk SHALL give a strike's words
as a premise (`Premise`): the clause saying why the struck values go, without a
conclusion. The walk SHALL end every strike's sentence with the plan's
`conclude` words for the move its step makes: a strike ("so we must cross out 2
and 4"), a placement ("so this cell must be 3") or a note of the values left
("so pencil in only 1 and 5"). A game off the row/column preset SHALL supply its
own `conclude`.

#### Scenario: A game writes no strike conclusion

- **WHEN** a game on the walk narrates any strike
- **THEN** its words carry a premise and no explanation, and the step's sentence
  is that premise followed by the walk's conclusion for the step's move

### Requirement: A premise says how its conclusion refers to the struck notes

The conclusion SHALL refer to the struck notes the way the premise says: by
`where` for a strike that reaches beyond the cell it is about, by `struck` where
a word names the notes better than a list of their values, and by `named` where
the premise already named the values, so the conclusion refers back to them.

#### Scenario: A premise that names the values is not repeated

- **WHEN** a strike's premise is marked `named`
- **THEN** its conclusion refers to the struck values by a pronoun and does not
  list them again

### Requirement: A candidate hint plan reads an unmarked cell the way the player chose

The candidate-elimination plan walk SHALL take a reading of a blank cell with
no notes, and a game on the walk SHALL offer the player the choice
through the shared `hint-notes` preference. Under `populate` the cell is not
filled in yet: the plan SHALL pencil every candidate in with the fill-all move,
clear the obvious ones, and read the notes alone from then on. Under `implicit`
the cell holds every value its no-repeat regions do not already hold, and the
plan SHALL emit no fill-all step.

#### Scenario: A sudoku is solved from singles with no notes

- **WHEN** a Solo board at Easy or Normal is hinted under the implicit reading
- **THEN** no step fills in or writes notes, and every placement is a single the board
  shows by its regions

#### Scenario: Every enrolled game keeps its hint promises under either reading

- **WHEN** a game offers the preference and a plan is built under either reading on
  any mode or tier it offers
- **THEN** every step is live on the board it is shown on, the plan finishes a board
  whose tier needs no search, and a hint recomputed after every move solves the board

### Requirement: The implicit reading writes the notes a firing rests on

Under the implicit reading, before a firing's own steps the plan SHALL write, as
legs continuing the firing's journey, the notes of every blank, note-less cell
the firing outlines as evidence, names as read (`StepWords.reads`), or strikes
without folding, each with the candidates that reading gives it.

#### Scenario: A cage deduction writes its cage's notes

- **WHEN** under the implicit reading a cage deduction (Keen, a Killer cage) strikes a
  candidate from one cell of a cage whose other cells carry no notes
- **THEN** every other blank cell of the cage has its notes written before the
  deduction's first step

### Requirement: A cell a leg places in takes no notes from that leg on

Under the implicit reading the plan SHALL NOT write the notes of a cell for a
leg that places a value in that cell or comes after the one that does. It SHALL
write them when a leg before the placing one outlines, reads or strikes the
cell, since that leg rests on what the cell can still be.

#### Scenario: A journey's first step rests on a cell a later leg places in

- **WHEN** under the implicit reading a firing's first leg outlines note-less cells as
  evidence and a later leg of the same firing places a value in one of them (ABCD's
  runs technique, which outlines a line and places in several of its cells)
- **THEN** that cell's notes are written before the firing's first step, like every
  other cell the step outlines

### Requirement: A note-less single is placed in its own words

Under the implicit reading a note-less cell whose regions leave one value SHALL
be placed as a single in its own words ("its row and column already hold every
other number"), not as a cell whose notes collapsed.

#### Scenario: A cell with no notes is not said to have had them ruled out

- **WHEN** an implicit-reading plan places the one value a blank, note-less
  cell's row and column leave it
- **THEN** the step writes no notes first, and its sentence speaks of what the
  row and column hold, not of numbers ruled out in the cell

### Requirement: A strike from one note-less cell is folded

Under the implicit reading a strike SHALL be folded when its marks lie in one
blank, note-less cell, its premise speaks of that cell alone (no `where`), and
no earlier leg of the firing reads or strikes the cell: its step SHALL place the
one value the strike leaves there, or write the several it leaves as the cell's
notes, in place of a note leg and a strike. What it leaves SHALL account for any
value an earlier fold in the same firing placed in one of the cell's regions.

#### Scenario: A strike from a note-less cell concludes with what it leaves

- **WHEN** under the implicit reading a firing strikes candidates from one cell with no
  notes that no earlier leg reads
- **THEN** one step, in the strike's words, places the value left or writes the values
  left as the cell's notes, and no note leg or strike step for that cell precedes it

#### Scenario: A later fold sees an earlier fold's placement

- **WHEN** a firing's first leg folds into a placement and a later leg folds a cell
  sharing a region with it
- **THEN** the later step leaves out the placed value

### Requirement: The plan writes notes through a move that only adds

The notes the plan writes SHALL go on through a move that only adds notes
(`pencilAdd`), which `keepCandidateHintTrack` follows toggle by toggle and
`refreshCandidateHintStep` shrinks to the notes still unwritten, and which draws
no struck marks.

#### Scenario: A note step is followed one note at a time

- **WHEN** the player writes one of a note step's candidates with a pencil
  toggle
- **THEN** the step stays on track and its move shrinks to the candidates still
  unwritten, and no candidate is drawn struck

### Requirement: A game states the reading it starts on

A game that offers the reading SHALL start on one it states in its `newUi`:
the convention is `populate`, and a game overriding it SHALL say why. A caller
asking for a hint without a `Ui` SHALL get the game's own default:
`candidateHint` given no `Ui` reads `populate`, so such a game SHALL hand it
its own fresh `Ui` in that case. A game with no reading to offer SHALL state
none and pass `candidateHint` no `Ui`, and its plan walks `populate` only.

#### Scenario: A game with no reading to offer

- **WHEN** a game's plan supplies its own setup, as Salad's does, or its hint
  takes no `Ui` at all, as Crossing's does
- **THEN** its `newUi` carries no reading, the player is offered no choice of
  one, and its hint is the same with a `Ui` or without

#### Scenario: A hint with no Ui takes the game's reading

- **WHEN** a game whose `newUi` states the implicit reading is asked for a hint
  with no `Ui`
- **THEN** the plan is built under the implicit reading

#### Scenario: A game that offers the reading drops the Ui it was not given

- **WHEN** a game whose `newUi` states the implicit reading passes no `Ui` on
  to `candidateHint`
- **THEN** its hint with no `Ui` differs from the one its own fresh `Ui` gets,
  and the cross-game guard fails, naming the game

### Requirement: Nothing folds under the populate reading

Under the populate reading every cell a strike reaches has notes, so nothing
SHALL fold, and the plan's moves, highlights and journeys SHALL be those it
would have without folding.

#### Scenario: A populate-reading strike is a strike

- **WHEN** a populate-reading plan takes a strike firing whose marks lie in one
  cell
- **THEN** its step strikes those marks, and no note leg precedes it

### Requirement: What a placed value rules out may depend on the value

The candidate walk SHALL take what a placed value rules out as one function of
the cell and the value, a reach (`Reach`): the cells an `n` at a cell rules `n`
out of. Every place the walk asks that question SHALL read it: the placement
cull, the obvious-candidate clean, a note-less cell's candidates under the
implicit reading, and a fold's account of a value an earlier fold placed. Where
this specification speaks of a placed value's no-repeat regions at those places,
it means the reach.

#### Scenario: A value rules itself out only as far as it reaches

- **WHEN** a board's reach lets a placed 2 rule out 2s within two cells of it
- **THEN** a note-less cell one or two cells away reads without the 2, one three
  cells away keeps it, and the obvious clean strikes a 2 note exactly where the
  reach does

### Requirement: The default reach is the cell's regions

The default reach SHALL be every cell of the placed cell's no-repeat regions
(`regionReach` over `regionsOf`), so a game whose rule is its regions supplies
nothing. A game whose reach depends on the value, as a Seismic `n` rules `n` out
`n` cells along its row and column, SHALL supply its own, and SHALL keep
`regionsOf` for the regions a hidden single is classified in. A reach SHALL be
symmetric: an `n` at one cell rules out an `n` at another exactly when the
reverse holds.

#### Scenario: A game whose rule is its regions passes no reach

- **WHEN** a game on the walk supplies `regionsOf` and no reach
- **THEN** its placement cull, obvious clean and implied candidates are those of
  its regions, and its plans are unchanged

### Requirement: A rung sees the setup as finished only after the clean

The walk's `RungContext.populated` SHALL mean that the setup is finished, the
obvious-candidate clean included, under either reading, so a rung reading the
notes never runs between the fill and the clean.

#### Scenario: Filled but not yet cleaned is not populated

- **WHEN** a populate-reading plan has penciled every candidate in and has not
  yet run the obvious clean
- **THEN** a rung asked then is told `populated` is false

### Requirement: The implicit reading opens only on a stale note

Under the implicit reading the candidate-plan walk's setup SHALL count as done while no
note on the working board is one the obvious clean would strike, so a board with no
stale note has no note-free opening and every rung competes from the first step. While
a stale note remains, the note-free opening SHALL run as under the populate reading,
ending with the clean.

#### Scenario: a fresh board competes every rung from the start

- **WHEN** an implicit-reading plan is built on a board whose notes hold nothing a
  placed value rules out
- **THEN** a recorded strike may be taken before the singles and clue lines are
  exhausted

#### Scenario: a stale note still lets a single go first

- **WHEN** an implicit-reading plan is built on a board whose notes still carry values
  the placed ones rule out, and a naked single is on the board
- **THEN** the plan places the single before it cleans the stale notes

### Requirement: A game's rung reads the walk's recorded placements

The candidate-plan walk SHALL hand every rung the placements its own placement rung
would offer (`RungContext.placements`): the singles the board shows, and each recorded
placement with a reason of its own that the walk judged available, marked as such. A
game whose deductions are placements and should lead the strikes SHALL take them from
there, choosing which to offer when, and SHALL NOT decide a recorded placement's
availability itself.

#### Scenario: Group's placements lead without a rule of Group's own

- **WHEN** a Group plan's recording holds an associativity placement whose three
  products are on the board, behind other unmade placements
- **THEN** Group's rung offers it, read from the walk's placements, ahead of the
  strikes

### Requirement: A recorded firing's premise SHALL name every cell its deduction reads

The premise of every recorded firing a candidate hint plan offers SHALL name
every cell whose candidates or placed value its deduction reads, including a
cell read for what it does not hold: a hidden set or a fish reads the rest of
its lines, and a claim that only one mark leads somewhere reads every mark that
could.

#### Scenario: a fish names the rest of its lines

- **WHEN** a set in the value slice strikes a value because, in some columns, the value
  can only sit in cells of certain rows
- **THEN** the step's premise holds every other cell of those columns, and the walk does
  not offer it while one of them still shows the value

### Requirement: A recorded reason carries the cells its words do not name

Where the game's words for a step do not name a cell its deduction reads, the
recorded reason SHALL carry it in `reads`, and the walk SHALL add those cells to
the step's premise as it adds the game's own. The cells a placement leaves out
of its premise SHALL be the cells its legs act on, never the cells a note leg
writes because the firing reads them.

#### Scenario: a note leg does not remove a premise cell

- **WHEN** under the implicit reading a placement rests on a cell the board has not
  filled, so the firing writes that cell's notes first
- **THEN** the cell is still in the placement's premise, and the placement is not offered
  while the solver's value there is one the board has not placed

### Requirement: The engine audits a premise by replaying its firing

The engine SHALL hold the premise rule with an audit, idle in production, that
takes the solver's state at each firing the walk offers, returns every cell
outside the premise to the state the recording started from, and runs the
firing's own technique again, making the changes of any earlier firing that
technique finds first on returned cells. It SHALL report a firing that no longer
follows.

#### Scenario: a premise cut short turns the guard red

- **WHEN** a game's words for a clue deduction stop naming the line the clue reads
- **THEN** the guard reports the firings that no longer follow from their premise

### Requirement: A guard runs the premise audit over every game on the walk

A guard SHALL run the audit over every game whose hint is the candidate walk,
derived from the games' sources, under every reading of an unmarked cell the
game offers, on one board per leaf preset and any board a game adds for a rung
those boards leave untested. A game whose recording offers no replay, whose
replay tests no cell, or whose plan records nothing SHALL be named in a ledger,
with why, that the guard holds exactly.

#### Scenario: a solver that offers no replay is reported

- **WHEN** a candidate walk records firings through a solver that offers the audit no
  replay
- **THEN** the guard fails for that game unless the ledger names it with why

### Requirement: A technique that reads more than its conclusion rests on is pinned

A technique flagged because it reads more to decide whether to fire than its
conclusion rests on SHALL be named in a ledger, with why, and pinned to a board
that still shows it; a fix such an entry could hide SHALL be held by a test of
its own.

#### Scenario: A ledgered flag is still shown by its board

- **WHEN** the board pinned to a ledger entry no longer makes the audit flag
  that technique
- **THEN** the guard fails until the entry is removed

### Requirement: A value confined across several lines shows the lines

A candidate hint step that strikes a value because it is confined, across
several parallel rows or columns, to cells lying in as many lines the other way
SHALL stripe every cell of the confining lines and outline the cells of them the
value can still take. Its premise SHALL be the one sentence `confinedPremise`
writes, which names the lines as rows or columns, points at both marks, and
gives the count of lines each way. No game SHALL write its own words for this
step.

#### Scenario: The lines are on the frame

- **WHEN** a hint shows a step that confines one value across several lines
- **THEN** each of those lines is striped whole
- **AND** the outlined cells all lie in the striped lines
- **AND** every struck cell lies outside them

### Requirement: The solver says which lines confine a value

The solver that records such a firing SHALL say which lines confine the value.
Where a firing can be read two ways, as some columns confined to as many rows or
as the remaining rows confined to the remaining columns, a solver without
repeated values SHALL record whichever is fewer lines.

#### Scenario: The fewer lines are named

- **WHEN** the shared Latin solver confines a value in two columns of a board
  five cells wide, which is also three rows confined to three columns
- **THEN** the recorded reason names the two columns
