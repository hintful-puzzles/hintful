## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: A shared narrator for generic Latin deduction reasons

When adopted, the shared hint-text module (`src/engine/hint-text.ts`) SHALL
provide a `narrateLatinReason(reason, ns)` that renders the *generic* Latin deduction
reasons whose narration is identical across the **row/column** Latin games (`single`,
`hiddenSingle`, `dup`, `set`, `forcing`). A row/column game (Keen, Unequal)
SHALL delegate those arms to the shared narrator and keep its game-specific arms (cages,
inequality/adjacency clues) local. Delegation SHALL be behavior-preserving — the rendered
narration strings are byte-identical to before, asserted by each game's hint suite.

A game whose generic-arm wording legitimately diverges SHALL keep its own `narrate` rather
than carry overrides into the shared narrator: **Solo** (its `single`/`dup`
name "row, column and block" and its `hiddenSingle` names a block/diagonal region) and
**Towers** (it narrates the whole family in "height" vocabulary with a single value, not an
`ns` list) are conformingly left local. The requirement is satisfied either by the shared
narrator (for the games where the arms are verbatim-identical) **or** by a recorded decision
in `docs/games/hints.md` that a given game's arms were left per-game because the
override surface made a shared narrator less readable — both are conforming outcomes.

#### Scenario: A delegated generic arm narrates identically

- **WHEN** a game routes a generic Latin reason (`single` / `set` / `forcing`) through the
  shared narrator
- **THEN** the produced sentence is byte-identical to the prior per-game string and the
  game's hint suite passes with no change

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
