## ADDED Requirements

### Requirement: A candidate hint plan continues from its latest steps where it can

When several firings are available at one position of a candidate-elimination hint
plan, the plan SHALL take one whose premise reads a cell that the plan's latest step
wrote, and failing that one reading what the step before it wrote, up to three steps
back. Among the firings that qualify at the same depth, and when none qualifies, the
game's own rung order SHALL decide, so a plan with no earlier step opens exactly as the
rung order says.

The engine SHALL own the choice (`HintFrontier` in `src/engine/hint-frontier.ts`, which
`runCandidatePlan` drives) and the game SHALL own which firings are available and what
each reads. A game SHALL offer
the frontier only firings whose premise the working board already shows: a strike
recorded before the solver's next unmade placement whose premise cells hold no mark an
earlier firing has yet to strike, a placement the notes show as a naked or hidden
single, and a placement forced by a clue only where the plan has nothing else to take.
The frontier SHALL read what a step wrote from the targets of the steps it pushed.

The frontier SHALL key only on the plan's own earlier steps, never on the midend's
displayed step or the player's moves, so the same board always yields the same plan.
The choice SHALL stay on the hint path: no generator or solver explores in a different
order because of it.

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

#### Scenario: the plans are measured from outside

- **WHEN** the plans of every game that walks its plan with `runCandidatePlan` are walked over its
  presets and each step that reads nothing its predecessor wrote is checked for a later,
  already-available firing that did
- **THEN** fewer than one such step in ten passed over one, and the check fails when
  the frontier's preference is reversed

### Requirement: A cell's regions are one definition per relation

A candidate-elimination game SHALL define "the regions of a cell" once for each of two
relations, and every consumer of a relation SHALL read that one definition:

1. the regions that must hold every value once, read by the placement classifier
   (`classifyPlacementInRegions`), since a value with one home left in such a region
   must go there;
2. the regions a placed value may not repeat in, read by every notes cull: the
   placement's duplicate strike (`regionDuplicateMarks`), the obvious-candidate clean,
   Mark-all's clean and the player's auto-pencil.

Where the two relations coincide, as they do for every game but Solo Killer, the game
SHALL use one provider for both (`regionsOf`, or the shared `rowColRegions`). A region
with only the second property SHALL join the culls' definition and stay out of the
classifier's. A region with neither, such as a Keen cage, SHALL be in neither.

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
   itself still showing several candidates — narrated by its region ("in this
   row/column, N can go in only this cell"), with the **whole region** shaded as
   evidence.

A placement that is neither rests on a strike the plan never placed, and is governed
by "A classified placement rests only on strikes the board shows". A game SHALL
reclassify **only** a recorded `single` placement; a game's own clue/region-driven
forced placements (e.g. Towers' facing-clue and full-line placements) keep their own
reasons.

#### Scenario: A hidden single is narrated by its line

- **WHEN** a Latin-family hint forces a placement into a cell that still shows several
  candidates, because the placed digit fits nowhere else in its row (or column)
- **THEN** the narration names the line ("in this row/column, N can go in only this
  cell"), not "every other number has been ruled out in this cell"
- **AND** the whole row (or column) is shaded as evidence, the cell marked as the
  placement target

#### Scenario: The naked-single phrasing is never used on a multi-candidate cell

- **WHEN** any Latin-family hint emits a placement step whose narration says "ruled
  out in this cell"
- **THEN** the cell's working notes are genuinely a single candidate (a true naked
  single) — a hidden single uses its own narration instead

## MODIFIED Requirements

### Requirement: A shared candidate-elimination hint-plan abstraction

The engine SHALL provide a shared module (`src/engine/candidate-hint.ts`) that
implements the reusable parts of the candidate-elimination hint *plan* — shared by every
pencil-notes game whose hint sets and strikes candidate notes and places a value when a
cell's notes collapse to one (Towers, Unequal, Keen, Solo, and any future such game).
The shared module SHALL own the parts that are identical across those games, while the
game retains the parts that carry game-specific *meaning* — which rungs its plan has and
in what order, what each can fire now, its strike-split policy and its
journey-continuation tracking.

The shared module SHALL provide:

1. **The plan walk** (`runCandidatePlan`): the note-free opening rungs until the plan's
   setup (populate, then the obvious clean) is done, then every rung, each next firing
   taken through the engine's `HintFrontier`, the last-resort signal a rung needs
   (every earlier rung came up empty), and the step budget and iteration cap. A game
   supplies its rungs and setup (`populateThenClean` where it populates and cleans)
   rather than writing the loop.
2. **Pure plan helpers** over a working `(grid, pencil)` and a recorded
   `DeductionRecord[]` deduction script: every naked single on the board, detecting
   whether any empty cell lacks notes (needs populate), the first recorded placement not
   yet reflected on the working grid, every still-live strike *firing* a plan could take
   now (each one `group`, excluding placement-bookkeeping `dup` elims, the first always
   among them), and the next forced placement (returned whole so the game reads its own
   reason union). A `joinNums` value-list narration helper.
3. **Generic `keepCandidateHintTrack` and `refreshCandidateHintStep`** over the shared
   pencil-move shape (`set` / `pencilAll` / `pencilStrike`) and the shared
   `CandidateHighlights`, implementing the cross-game verdicts (a populate match, a
   placement match, a strike whose marks shrink in place or complete) and the
   no-stale-step guarantee (drop dead marks, resolve a filled placement, resolve a
   fully-noted populate).

Narration, the per-game reason union, the rungs and their game-specific strike-split and
continuation tracking SHALL remain in the game — the shared module owns the walk and the
reusable mechanics, the game owns meaning.

The placement-classifier in `src/engine/latin-hint.ts` (which re-derives whether a
recorded generic `single` placement is a naked single or a hidden single — see the
"Latin-family hints distinguish naked and hidden singles" requirement) SHALL generalize
to an arbitrary **region list**, so a game reasoning over sub-blocks and diagonals (Solo)
classifies a hidden single in any of its regions, while the row/column games pass only
`[row, column]` and are unchanged.

Routing a game's hint through the shared module SHALL be behavior-preserving: the
game's existing hint requirement and its observable narration, journeys, keep-track
verdicts, resume guarantee and rendered frames are unchanged. The bespoke and shared
solvers and the generator/solve paths are untouched — the shared abstraction is
hint-plan plumbing only, consuming the already-shared `DeductionRecord`/`HintOp` shape.

#### Scenario: A migrated game's hint is unchanged

- **WHEN** a candidate-elimination game (Towers, Unequal, Keen or Solo) is routed
  through the shared hint-plan module
- **THEN** its hint plan — the populate/strike/place steps, their narration, the
  one-firing-one-journey grouping, the `hintKeepTrack` verdicts and the rendered
  highlight frame — is identical to before the migration
- **AND** the game's per-game hint suite, the shared `hint-resume.test.ts`, and the
  render snapshots pass with no change

#### Scenario: A hidden single is classified in a non-row/column region

- **WHEN** a game reasoning over sub-blocks or diagonals (Solo) forces a placement that
  is a hidden single within a sub-block or diagonal
- **THEN** the shared classifier identifies the region and the narration names it
  (e.g. "in this block / diagonal, N can go in only this cell"), the same way the
  row/column games name a row or column

## REMOVED Requirements

### Requirement: A shared cell-region helper for candidate-elimination games

**Reason**: It held the classifier and the notes culls to one region provider "so they
cannot disagree", and that merged two relations. A Solo Killer cage forbids repeats
without holding every digit, and while the culls read the classifier's regions, the
solver struck cage-mates the notes never did, so Solo's hint threw on about one fresh
Killer board in six.

**Migration**: "A cell's regions are one definition per relation", which keeps one
provider where the relations coincide and both scenarios that still hold.

### Requirement: Latin-family hints distinguish naked, hidden and forced singles

**Reason**: Its third kind, the forced single, was retired by
`strike-before-forced-singles`, which made the classifier throw on such a placement;
this requirement still described narrating one.

**Migration**: "Latin-family hints distinguish naked and hidden singles", with the throw
governed by "A classified placement rests only on strikes the board shows".
