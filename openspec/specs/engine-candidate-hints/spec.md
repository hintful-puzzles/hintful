# engine-candidate-hints Specification

## Purpose
The hint plan shared by the candidate-elimination games: the walk that
records a solver's firings, the regions and readings it works over, the Latin
family's shared narration, and the premise each recorded firing names.

## Requirements

### Requirement: A shared candidate-elimination hint entry

The shared candidate-elimination module (`src/engine/candidate-hint.ts`) SHALL
provide a `candidateHint` entry that owns the `Game.hint` control flow common to every
candidate-elimination game: refuse on a completed board, refuse (with the standard
message) when the game's `findMistakes` reports any mistake, read the `autoPencil`
preference (defaulting off, per the games' default-auto-pencil-off preference), build the
plan via the game's `buildSteps`, refuse when the
plan is empty, and otherwise return the steps. The standard refusal and empty-plan
messages SHALL live in this one place. A game's `hint` SHALL be a one-line call passing
its own `findMistakes` and `buildSteps`; routing through it SHALL be behavior-preserving.

#### Scenario: A migrated game's hint refusals and success are unchanged

- **WHEN** a candidate-elimination game (Keen, Towers, Unequal, Solo) routes its `hint`
  through the shared entry
- **THEN** a completed board, a board with mistakes, and a stuck board each refuse with the
  same message as before, a solvable board returns the same plan, and the game's hint suite
  passes with no change

### Requirement: Candidate-elimination hints clean obvious candidates at populate

A candidate-elimination game's hint plan SHALL, once pencil notes first exist on the working
board — whether the plan just populated them or the board was already noted — emit one
bulk **obvious-candidate cleanup** step that removes every penciled value already placed in
one of its cell's uniqueness regions, as the adaptive "fill all pencil marks" control's
second press does (`obviousCandidateMarks` over the game's `regionsOf`). The cleanup SHALL be
a single `pencilStrike` step (the marks baked into it at plan time), SHALL be flagged
`continuesPrevious` when it directly follows the populate fill so "fill, then clear the
obvious ones" reads and auto-plays as one setup journey (and stand alone when the board was
already noted). It SHALL fire only when there is something obvious to remove: once when the
board is already noted and once after the populate, and not again while the plan's own
per-placement cleanup keeps the notes clean. An empty cleanup (nothing obvious to
remove) SHALL emit no step. The struck marks SHALL be applied to the plan's working notes so
the rest of the walk sees the cleaned board. The shared engine helper `emitObviousCleanStep`
(`src/engine/candidate-hint.ts`) SHALL own this emission so every such game produces
it identically.

Consequently the plan SHALL NOT separately re-teach those obvious row/column/region
eliminations one firing at a time — the bulk clean subsumes the per-given basic-region
opening. The rest of the walk is unchanged: easy-first ordering, the explicit per-placement
cleanup when auto-pencil is off, and the harder combined deductions (sets, forcing chains,
cages, inequality/sightline clues) reached only when no easier move remains.

This applies to every candidate-elimination game with a region-uniqueness populate (Towers,
Unequal, Keen, Solo, Group). A game whose hint has no such populate (Undead) is unaffected.

#### Scenario: A hint's populate fills then bulk-clears the obvious candidates

- **WHEN** an auto-played hint populates the notes on a board carrying placed values
  (givens, or placements the plan made before populate)
- **THEN** the populate journey first fills `1..n` in every empty cell, then strikes in one
  `continuesPrevious` step every candidate already placed in its row/column/region, leaving
  the same notes the adaptive Mark-all control would produce — and the plan does not afterward
  re-teach those obvious eliminations individually

#### Scenario: The cleaned-note plan still replays and refreshes

- **WHEN** the populate-plus-clean journey is followed, undone/redone, or re-requested
- **THEN** the `pencilStrike` cleanup replays exactly (its marks were baked at plan time),
  `hintKeepTrack` and `refreshHintStep` treat it as an ordinary strike step, and the hint
  resume guarantees hold

### Requirement: A classified placement rests only on strikes the board shows

The shared placement classifier (`classifyPlacementInRegions`, and `classifyPlacement` /
`singlePlacementReason` over it, in `src/engine/latin-hint.ts`) SHALL answer only **naked**
(the cell's notes are exactly the placed value) or **hidden** (no other empty cell of one of
the given regions still notes it). A placement the notes show as neither rests on a strike
the plan never placed, and the classifier SHALL throw an error saying so rather than return
a reason for it. No hint narration SHALL exist for such a placement: the family has no
`forcedSingle` reason, and Salad no `forcedCross` / `forcedCircle`. Salad's plan SHALL
likewise throw when, with every recorded strike and placement on its working board, the
solver still forces a marker the board lacks.

Because every plan that classifies a placement passes through the classifier, the
cross-game hint walks (`hint-resume.test.ts`, `hint-quality.test.ts`) are the guard: a game
joins it by calling the classifier, and a plan that skips a strike fails them.

#### Scenario: A placement the notes cannot explain throws

- **WHEN** the classifier is asked about a placement whose cell still notes another value
  and whose value is still noted in another empty cell of each of its regions
- **THEN** it throws an error naming the placement and the skipped strike, and returns no
  reason

#### Scenario: A plan that skips a strike fails the hint walks

- **WHEN** a Latin-family plan places a value without striking it from its lines' notes and
  a later placement reads those notes
- **THEN** walking hints over that game throws from the classifier, so the gate fails

### Requirement: Obvious candidate strikes precede a classified placement

A hint plan that classifies a placement against the working notes SHALL first have struck,
from those notes, every value already placed in the noted cell's uniqueness regions,
whether the stale note was the player's or was left by the plan. A plan that places before
it populates (Group) SHALL run the obvious-candidate cleanup ahead of its placement arm, and
SHALL strike each value it places, including every leg of a multi-leg placement journey,
from its lines' notes. Where such a plan classifies a placement on a board with note-less
empty cells, it SHALL read each such cell as holding every value not already placed in its
regions, so that a hidden single is claimed only where the board shows one.

#### Scenario: A player's stale note is struck before a placement is narrated

- **WHEN** a Group hint is requested on a board whose notes still carry a value the player
  has since placed in the same row
- **THEN** the plan strikes that note before any placement step, and the placement it then
  narrates is a naked or hidden single in the notes

#### Scenario: A note-free board's placements are narrated by what the board shows

- **WHEN** a Group hint places values before any notes exist
- **THEN** every "In this row" or "In this column" placement is one where no other empty
  cell of that line could take the value given its own row and column

### Requirement: A candidate hint plan continues from its latest steps where it can

When several firings are available at one position of a candidate-elimination hint
plan, the plan SHALL take one whose premise reads a cell that the plan's latest step
wrote, and failing that one reading what the step before it wrote, up to three steps
back. Among the firings that qualify at the same depth, and when none qualifies, the
plan's own rung order SHALL decide, so a plan with no earlier step opens exactly as the
rung order says.

The engine SHALL own the choice (`HintFrontier` in `src/engine/hint-frontier.ts`, which
the shared candidate-plan walk drives) and SHALL read each firing's premise off the
steps the firing
would push: the `area ∪ hatch ∪ reads ∪ targets` of every one of them, built before
the choice and pushed unchanged if it is taken. No firing SHALL carry a second
statement of its premise. The game SHALL own which firings of its own rungs are
available, and the walk SHALL own which recorded firings are. A firing SHALL be offered
to the frontier only when the working board already shows its premise. A recorded
firing SHALL be judged by one rule whether it strikes or places: it is available when
nothing the board does not show yet comes before it in the recording, or when its
premise cells hold none of those marks, which are a live mark an earlier recorded
firing has yet to strike, and the cell of a recorded placement the board has not made
with every cell its value rules out that still shows the value. A strike's premise
SHALL be its steps' whole premise; a placement's SHALL leave out the cells it places.
A placement the notes show as a naked or hidden single SHALL be offered as the notes
show it. No recorded firing SHALL be withheld only because of its position in the
recording, or held back as a last resort while its premise holds. The frontier
SHALL read what a step wrote from the targets of the steps it pushed.

A single's step SHALL carry in its `reads` the placed cells it rests on through a cell
with no notes, which the walk adds and nothing draws: for a single in a cell with no
notes, every placed cell ruling out one of the cell's other values; for a hidden
single, the placed cells ruling the value out of each blank cell of its region that
has no notes.

The frontier SHALL key only on the plan's own earlier steps, never on the midend's
displayed step or the player's moves, so the same board always yields the same plan.
The choice SHALL stay on the hint path: no generator or solver explores in a different
order because of it.

The population the guard measures SHALL be derived from the games' own sources, and
SHALL be keyed on the shape every entry into the walk shares rather than on one entry
point's name, so a preset over the walk does not silently remove its games from the
measurement. The guard SHALL walk every reading of an unmarked cell a game offers the
player, derived from the game's `Ui`, and SHALL read each step's premise as the
frontier does. A reading known to exceed the bound SHALL be named, with the change
that owns it, in a ledger the guard holds still over the bound.

#### Scenario: a firing beside the last step is taken over an easier one elsewhere

- **WHEN** a plan has just struck notes in one row, a strike reading that row is
  available, and a naked single sits in a cell sharing no line with anything the step
  wrote
- **THEN** the plan takes the strike next, though the naked single's rung comes first

#### Scenario: a fresh plan opens where the rung order says

- **WHEN** a plan is built from a board with no earlier step to continue from
- **THEN** its first step is the first firing of the first rung that has one

#### Scenario: a firing is offered only when the board shows its premise

- **WHEN** a strike's premise cells still hold a mark an earlier recorded firing has
  yet to strike
- **THEN** the strike is not offered to the frontier until that mark is struck

#### Scenario: a strike past an unmade placement is offered by its premise

- **WHEN** the solver records a strike after a placement the board has not made
- **THEN** the strike is offered when its premise reads neither that placement's cell
  nor a cell holding one of its live culls, and withheld when it reads either

#### Scenario: a clue-forced placement is offered where its premise holds

- **WHEN** the solver records a placement with a reason of its own, and a strike the
  board supports is also available
- **THEN** the placement is offered beside the strike when its evidence reads no mark
  the board does not show yet, and withheld when it reads one

#### Scenario: the plans are measured from outside

- **WHEN** the plans of every game that walks its plan with the shared candidate-plan
  walk, by any entry into it, are walked over its
  presets and each step that reads nothing its predecessor wrote is checked for a later,
  already-available firing that did
- **THEN** fewer than one such step in ten passed over one, and the check fails when
  the frontier's preference is reversed

#### Scenario: the measured population survives a new entry point

- **WHEN** a preset over the walk is added and the games taking it stop naming the
  general entry point
- **THEN** those games remain in the measured population, and a key that stops matching
  a call site fails against a second, independent derivation of the same population
  rather than passing over a smaller one

#### Scenario: a firing continues from the evidence it shades

- **WHEN** two firings are available after a step that wrote one cell, the rung order
  prefers the first, and only the second shades that cell as evidence, acting on a
  cell elsewhere
- **THEN** the plan takes the second

#### Scenario: a placement continues into the single it completes

- **WHEN** under the implicit reading a plan places a value in a region, leaving one
  cell of the region with no notes and one value its regions do not hold
- **THEN** that single's step reads the placed cell, and the plan takes it next over a
  single elsewhere that the rung order reaches first

#### Scenario: both readings are measured

- **WHEN** a game offers the player both readings of an unmarked cell
- **THEN** its plans are measured under each, and a reading over the bound fails the
  guard unless the ledger names it, while a named reading that has come under the
  bound fails it too

### Requirement: A cell's regions are one definition per relation

A candidate-elimination game SHALL declare "the regions of a cell" once, as the regions a placed value may not repeat in, each flagged with whether it also holds every value once (`CellRegion.holdsEvery`), and every consumer SHALL derive its relation from that one declaration:

1. the regions that must hold every value once are read by the placement
   classifier (`classifyPlacementInRegions`), which itself skips a region flagged
   `holdsEvery: false`, since a value with one home left in a region must go there
   only if the region has to hold it;
2. every declared region is read by every notes cull: the placement's duplicate
   strike (`regionDuplicateMarks`), the obvious-candidate clean, Mark-all's clean
   and the player's auto-pencil.

Holding every value implies forbidding repeats, so these are the only two kinds of
declared region. A region with only the second property, such as a Solo Killer
cage, SHALL be declared with `holdsEvery: false`. A region with neither, such as a
Keen cage, SHALL NOT be declared, since no consumer reads it. A game whose regions
carry a tag for naming a hidden single SHALL tag only the regions that hold every
value, so that the type refuses a partial region declared as whole.

#### Scenario: The consumers of a relation agree on a cell's regions

- **WHEN** a candidate-elimination game's hint culls a placement's duplicates, cleans
  the obvious candidates, and the player places a value with auto-pencil on
- **THEN** all three strike the value from the same regions, and the hint's culls leave
  no note standing that the solver has struck

#### Scenario: A cage is not a uniqueness region

- **WHEN** the game is Keen (digits may repeat within an arithmetic cage)
- **THEN** `regionsOf` returns only the row and column, so neither the cleanup nor the
  basic-strike removes a candidate that is legal under the cage constraint

#### Scenario: A Killer cage forbids repeats without holding every digit

- **WHEN** the game is Solo with Killer cages and a value is placed in a cage
- **THEN** the culls strike that value from the rest of the cage, and the classifier
  never calls a placement a hidden single in its cage

#### Scenario: The classifier skips a region that need not hold every value

- **WHEN** a placement's value is noted by no other cell of a region declared
  `holdsEvery: false`, and by another cell of each of its whole regions
- **THEN** the classifier does not call it a hidden single in that region

### Requirement: Latin-family hints distinguish naked and hidden singles

A Latin-square-family game's hint SHALL narrate a forced single placement by the
deduction that actually forces it, re-derived from the working board, not from the
solver's recorded reason.

This applies to every game riding the shared `latin.ts` solver and to Solo. The generic
`elim` records naked and hidden singles under one `single` reason; the hint re-derives
which it is and narrates accordingly. The shared classifier (`src/engine/latin-hint.ts`)
distinguishes two kinds, considering only *empty* cells as competitors for a value:

1. a **naked single** — the cell's own candidates are exactly `{n}` — narrated "every
   other number/height has been ruled out in this cell, so it can only be N", with the
   cell alone as evidence;
2. a **hidden single** — no other empty cell of a region can still take `n`, the cell
   itself still showing several candidates — narrated by its region ("every other cell
   in this row/column rules out N, so this cell must be N"), with the **whole region**
   shaded as evidence.

A placement that is neither rests on a strike the plan never placed, and is governed
by "A classified placement rests only on strikes the board shows". A game SHALL
reclassify **only** a recorded `single` placement; a game's own clue/region-driven
forced placements (e.g. Towers' facing-clue and full-line placements) keep their own
reasons.

#### Scenario: A hidden single is narrated by its line

- **WHEN** a Latin-family hint forces a placement into a cell that still shows several
  candidates, because the placed digit fits nowhere else in its row (or column)
- **THEN** the narration names the line ("every other cell in this row/column rules out
  N, so this cell must be N"), not "every other number has been ruled out in this cell"
- **AND** the whole row (or column) is shaded as evidence, the cell marked as the
  placement target

#### Scenario: The naked-single phrasing is never used on a multi-candidate cell

- **WHEN** any Latin-family hint emits a placement step whose narration says "ruled
  out in this cell"
- **THEN** the cell's working notes are genuinely a single candidate (a true naked
  single) — a hidden single uses its own narration instead

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
  (e.g. "every other cell in this block / diagonal rules out N, so this cell must be
  N"), the same way the
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

### Requirement: A row/column Latin square answers no question its regions already settle

The engine SHALL provide a preset over the candidate-elimination plan walk
(`runLatinCandidatePlan` in `src/engine/candidate-plan.ts`) supplying every plan field
whose answer is **forced** once a game's cells' no-repeat regions are exactly a row and
a column, so that a plain Latin game supplies its recording solver, its own rungs and
its own words and nothing else. The fields SHALL be:

1. **the regions** — the row and the column of the cell, in narration-preference order;
2. **the reason a single narrates as** — naked, or hidden in the region the classifier
   found, which given a row/column region is the only function of that signature;
3. **a hidden single's placement evidence** — the cells of its own line, shaded over
   whatever area the game's own words returned, so the game says why and the preset
   shades where;
4. **the two setup sentences** — built from the game's value noun and its verb for a
   value already on the board, which are per-game words, while the phrase naming the
   regions is not.

A game whose singles narrate over any other region SHALL be unable to take the preset:
the preset's parameter type SHALL fail to type-check for a reason union that cannot hold
the single reason the preset synthesizes, rather than relying on a convention or a
roster to keep such a game away. Every game SHALL remain free to call the general entry
point, and a game that does SHALL say why in its change.

The preset SHALL be behavior-preserving for the games converted to it: the plans, the
narration and the shaded evidence SHALL be identical to what those games produced when
they answered the same questions themselves.

#### Scenario: A plain Latin game declares no regions

- **WHEN** a candidate-elimination game whose cells' no-repeat regions are exactly a row
  and a column walks its hint plan
- **THEN** it passes no region function, no single-reason function and no hidden-single
  evidence area, and its hidden singles are still classified in, narrated by and shaded
  along the correct line

#### Scenario: A game reasoning over other regions cannot take the preset

- **WHEN** a game whose hidden singles name a sub-block, a diagonal or a cage is written
  against the preset
- **THEN** it fails to type-check, and the game walks its plan through the general entry
  point instead

#### Scenario: The setup sentences name the regions without being told them

- **WHEN** a game on the preset supplies only its value noun and its placement verb
- **THEN** the populate and obvious-clean steps read in that game's words and name its
  cells' row and column, and no game on the preset states that phrase itself

### Requirement: A region's name is read off the region

A candidate-elimination game whose narration cites *which kinds* of region a value may not repeat in SHALL read those words off the regions it declares ("A cell's regions are one definition per relation"), never from a second list restating the same fact.

The reader's word SHALL be a property of the declared region, so that a region added to the declaration cannot be built without saying what a sentence citing it calls it. It SHALL NOT be carried by the tag that names a hidden single: that tag is present only on the regions holding every value, and a game may forbid repeats in a region that holds no full set (a Solo Killer cage) which a sentence still has to name.

Names, not regions, SHALL decide what a citation repeats: a cell lying in two regions the game calls by one word cites that word once. A citation that speaks for the whole board at once — the opening clean, which culls every cell's notes in a single step — SHALL name the union of the board's regions rather than any one cell's, so a cell lying in none of an optional kind is still told its notes were cleaned against that kind.

#### Scenario: A word is not a second statement of the regions

- **WHEN** a game gains a kind of region a value may not repeat in
- **THEN** the sentences citing the kinds of region name it without a second edit, and a region carrying no word does not compile

#### Scenario: Two regions the game calls by one word are cited once

- **WHEN** a value is placed on a Solo X board in the cell both diagonals pass through
- **THEN** the sentence says its row, column, block and diagonal, naming the diagonal once

#### Scenario: A region that holds no full set is still named

- **WHEN** a value is placed on a Solo Killer board
- **THEN** the sentence names the cage among the regions the value may not repeat in, and the cage carries no tag naming a hidden single

#### Scenario: The board-wide clean names a region the cell is not in

- **WHEN** the opening clean of a Solo X board culls the notes of a cell lying on neither diagonal
- **THEN** its sentence still names the diagonal, because the one step cleans every cell of the board

### Requirement: A candidate game's regions may come from a partition

The shared candidate machinery SHALL accept a game whose uniqueness regions come
from a disjoint-set partition rather than from row/column arithmetic, with no
engine change: the game supplies `regionsOf` returning each cell's member list
and whether that region holds every value once.

A region SHALL be marked as holding every value only when it genuinely must, and
for a partition that is a property of the region's **size** rather than of the
game. A region that merely forbids repeats SHALL NOT be so marked, because a
value with one home left in it is not thereby forced there.

#### Scenario: A partition-region game classifies its singles correctly

- **WHEN** a candidate-elimination game whose regions come from a partition
  reaches a placement the notes show as a hidden single
- **THEN** the shared classifier names the region that forces it, and a region
  too small to hold every value is not offered as the reason

### Requirement: A deduction over a graph is a reason, not a plan shape

A candidate-elimination game whose solver reasons over a graph — reachability,
connectivity, a cycle that must not close — SHALL express those deductions as
ordinary recorded candidate eliminations carrying a game-specific reason, rather
than as rungs of the plan's own-rungs slot. The own-rungs slot SHALL remain for a
firing whose **move** the canonical placement and strike shapes cannot express.

A premise that asserts a walk SHALL be computed and checked rather than assumed,
and SHALL be presented to the player as an ordered, numbered area so the walk is
one they can follow.

#### Scenario: A reachability deduction needs no plan extension

- **WHEN** a game's solver strikes a candidate because following it would close a
  cycle, or because it is the only candidate that can still reach a required
  cell
- **THEN** the elimination is recorded like any other, the plan narrates it from
  its reason, and the game supplies no rung of its own for it

### Requirement: The recording path steps the ladder one firing at a time through the engine

The engine SHALL provide, beside the deduction-fixpoint runner, a driver that
runs the same ladder one firing per call, and a hint that records a firing at a
time SHALL use it rather than bending the runner's early-out into a stop
condition. The driver and the runner SHALL share one pass down the ladder, so
the tier cap, the restart rule and the budget cannot differ between the
solver's projection and the hint's.

Each call SHALL run the ladder from its first technique and return the
technique that fired, or nothing when no technique fires or the early-out says
there is nothing left to do. A contradiction SHALL be sticky: once a technique
proves the board inconsistent, the driver SHALL report it and SHALL run no
technique again. The step budget SHALL be required, and its attribution tally
SHALL outlive a single call, so a technique that runs away across many calls is
named.

**The driver SHALL return every firing, including one that changed nothing the
player can see.** Whether a firing is shown is the plan loop's decision, where a
hidden firing still advances the board and is counted; a driver that skipped
such firings would hide them where nothing counts them.

#### Scenario: One firing per call

- **WHEN** a hint calls the driver on a board where two techniques each have
  work to do
- **THEN** each call returns exactly one firing, restarting from the easiest
  technique
- **AND** a call after the ladder is exhausted returns nothing

#### Scenario: A firing with nothing to show is still returned

- **WHEN** a technique fires but records no move the player could make
- **THEN** the driver returns it like any other firing
- **AND** the plan loop's `showable` hides it and counts it as hidden

#### Scenario: A contradiction stops the driver for good

- **WHEN** a technique proves the board inconsistent
- **THEN** the driver reports the contradiction and returns nothing
- **AND** no technique runs on any later call

### Requirement: The hint frontier keys on whatever a game's steps act on

`HintFrontier` SHALL take a key naming what a step reads and writes, rather than
assuming a cell of a grid: a grid game SHALL pass `gridKey(w, h)`, under which a
cell off the board keys to nothing, and a game whose elements are not cells SHALL
pass its own. Map's are regions of a graph and key as their index. The continue
rule is unchanged by the key.

A game that takes the frontier directly rather than through the candidate walk
SHALL be derived from its own source and held to an exact ledger naming the guard
that checks its continuity, because the cross-game measurement reads a square
grid and would otherwise leave it out without saying so.

#### Scenario: A graph game continues from the region it just colored

- **WHEN** a Map hint step colors a region and leaves a neighbor with one color,
  and the next step is chosen
- **THEN** the step taken reads a region the last firing wrote

#### Scenario: A new direct user of the frontier is not missed

- **WHEN** a hinting game constructs a `HintFrontier` without walking a candidate
  plan and has no ledger entry
- **THEN** the frontier's cross-game test fails and names it

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
forcing-chain premise (`forcingChainPremise`) and the premise of a value
confined across lines (`confinedPremise`).

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

### Requirement: What a placed value rules out may depend on the value

The candidate walk SHALL take what a placed value rules out as one function of the
cell and the value, a **reach** (`Reach` in `src/engine/candidate-hint.ts`): the
cells an `n` at a cell rules `n` out of. Every place the walk asks that question
SHALL read it: the placement cull, the obvious-candidate clean, a note-less cell's
candidates under the implicit reading, and a fold's account of a value an earlier
fold placed. Where this specification speaks of a placed value's no-repeat
regions at those places, it means the reach.

The default reach SHALL be every cell of the placed cell's no-repeat regions
(`regionReach` over `regionsOf`), so a game whose rule is its regions supplies
nothing. A game whose reach depends on the value (a Seismic `n` rules `n` out `n`
cells along its row and column) SHALL supply its own, and keeps `regionsOf` for
the regions a hidden single is classified in. A reach SHALL be symmetric: an `n`
at one cell rules out an `n` at another exactly when the reverse holds.

The walk's `RungContext.populated` SHALL mean that the setup is finished, the
obvious-candidate clean included, under either reading, so a rung reading the notes
never runs between the fill and the clean.

#### Scenario: A value rules itself out only as far as it reaches

- **WHEN** a board's reach lets a placed 2 rule out 2s within two cells of it
- **THEN** a note-less cell one or two cells away reads without the 2, one three
  cells away keeps it, and the obvious clean strikes a 2 note exactly where the
  reach does

#### Scenario: A game whose rule is its regions passes no reach

- **WHEN** a game on the walk supplies `regionsOf` and no reach
- **THEN** its placement cull, obvious clean and implied candidates are those of
  its regions, and its plans are unchanged

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

The premise of every recorded firing a candidate hint plan offers SHALL name every cell
whose candidates or placed value its deduction reads, including a cell read for what it
does not hold: a hidden set or a fish reads the rest of its lines, and a claim that
only one mark leads somewhere reads every mark that could. Where the game's words for a
step do not name such cells, the recorded reason SHALL carry them as `reads`, and the
walk SHALL add them to the step's premise as it adds the game's own. The cells a
placement leaves out of its premise SHALL be the cells its legs act on, never the cells
a note leg writes because the firing reads them.

The engine SHALL hold this with an audit (`src/engine/firing-replay.ts`), idle in
production, that takes the solver's state at each firing the walk offers, returns every
cell outside the premise to the state the recording started from, and runs the firing's
own technique again, making the changes of any earlier firing that technique finds first
on returned cells, and SHALL report a firing that no longer follows. It SHALL first
replay the firing from the recorded state and report one it cannot reproduce as a fault
of the instrument, not of the premise. It SHALL report a recording that offered it no
replay, and SHALL count the cells it actually tested.

A guard SHALL run the audit over every game whose hint is the candidate walk, derived
from the games' sources, under every reading of an unmarked cell the game offers, on
one board per leaf preset and any board a game adds for a rung those boards leave
untested. A game whose recording offers no replay, whose replay tests no cell, or whose
plan records nothing SHALL be named in a ledger, with why, that the guard holds exactly.
A technique flagged because it reads more to decide whether to fire than its conclusion
rests on SHALL be named in a ledger, with why, and pinned to a board that still shows
it; a fix such an entry could hide SHALL be held by a test of its own.

#### Scenario: a fish names the rest of its lines

- **WHEN** a set in the value slice strikes a value because, in some columns, the value
  can only sit in cells of certain rows
- **THEN** the step's premise holds every other cell of those columns, and the walk does
  not offer it while one of them still shows the value

#### Scenario: a premise cut short turns the guard red

- **WHEN** a game's words for a clue deduction stop naming the line the clue reads
- **THEN** the guard reports the firings that no longer follow from their premise

#### Scenario: a note leg does not remove a premise cell

- **WHEN** under the implicit reading a placement rests on a cell the board has not
  filled, so the firing writes that cell's notes first
- **THEN** the cell is still in the placement's premise, and the placement is not offered
  while the solver's value there is one the board has not placed

#### Scenario: a solver that offers no replay is reported

- **WHEN** a candidate walk records firings through a solver that offers the audit no
  replay
- **THEN** the guard fails for that game unless the ledger names it with why

### Requirement: A value confined across several lines shows the lines

A candidate hint step that strikes a value because it is confined, across
several parallel rows or columns, to cells lying in as many lines the other
way SHALL stripe every cell of the confining lines and outline the cells of
them the value can still take. Its premise SHALL be the one sentence
`confinedPremise` writes, which names the lines as rows or columns, points at
both marks, and gives the count of lines each way. No game SHALL write its own
words for this step.

The solver that records the firing SHALL say which lines confine the value.
Where a firing can be read two ways, as some columns confined to as many rows
or as the remaining rows confined to the remaining columns, a solver without
repeated values SHALL record whichever is fewer lines.

#### Scenario: The lines are on the frame

- **WHEN** a hint shows a step that confines one value across several lines
- **THEN** each of those lines is striped whole
- **AND** the outlined cells all lie in the striped lines
- **AND** every struck cell lies outside them

#### Scenario: The premise the step marks is the premise the firing needs

- **WHEN** the premise audit replays such a firing from only the cells its
  step marks
- **THEN** the firing strikes the same candidates

#### Scenario: The fewer lines are named

- **WHEN** the shared Latin solver confines a value in two columns of a board
  five cells wide, which is also three rows confined to three columns
- **THEN** the recorded reason names the two columns
