## MODIFIED Requirements

### Requirement: A candidate hint plan continues from its latest steps where it can

When several firings are available at one position of a candidate-elimination hint
plan, the plan SHALL take one whose premise reads a cell that the plan's latest step
wrote, and failing that one reading what the step before it wrote, up to three steps
back. Among the firings that qualify at the same depth, and when none qualifies, the
plan's own rung order SHALL decide, so a plan with no earlier step opens exactly as the
rung order says.

The engine SHALL own the choice (`HintFrontier` in `src/engine/hint-frontier.ts`, which
`runCandidatePlan` drives) and SHALL read each firing's premise off the steps the firing
would push: the `area ∪ targets` of every one of them, built before the choice and
pushed unchanged if it is taken. No firing SHALL carry a second statement of its
premise. The game SHALL own which firings are available. A firing SHALL be offered to
the frontier only when the working board already shows its premise: a strike recorded
before the solver's next unmade placement whose premise cells hold no mark an earlier
firing has yet to strike, a placement the notes show as a naked or hidden single, and a
placement forced by a clue only where the plan has nothing else to take. The frontier
SHALL read what a step wrote from the targets of the steps it pushed.

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

#### Scenario: a firing continues from the evidence it shades

- **WHEN** two firings are available after a step that wrote one cell, the rung order
  prefers the first, and only the second shades that cell as evidence, acting on a
  cell elsewhere
- **THEN** the plan takes the second

## REMOVED Requirements

### Requirement: A shared candidate-elimination hint-plan abstraction

**Reason**: It left each game to build and apply its own steps around the shared walk,
and six games did: six placement emitters differing only in their words and regions, a
premise stated beside every step and again for `availableStrikes`, and firings split
across turns and re-linked by hand. Three games' stated premise was narrower than the
step they showed. Its scenario that routing a game through the shared module leaves the
plan unchanged no longer holds for Towers, Unequal, Group and Salad, whose plans now
continue from what they show.

**Migration**: "A shared candidate-elimination hint plan", which keeps the pure helpers,
the keep-track and refresh mechanics, the classifier over any region list and its
scenario, and moves step building, the placement cull and journey continuation into the
walk.

## ADDED Requirements

### Requirement: A shared candidate-elimination hint plan

The engine SHALL provide the whole candidate-elimination hint *plan* walk
(`runCandidatePlan` in `src/engine/candidate-plan.ts`) for every pencil-notes game whose
hint sets and strikes candidate notes and places a value when a cell's notes collapse to
one, and such a game's `buildSteps` SHALL hand its plan to it rather than walk, build or
apply steps itself.

The walk SHALL own:

1. **The ladder**: the naked singles, then the game's own rungs, then the recorded
   strikes a plan could take now, then the recorded placements, in the note-free opening
   until setup is done and in the whole walk after it; the last-resort signal a rung
   needs (every earlier rung came up empty); the step budget and the iteration cap.
2. **The setup**: a lazy populate and then the obvious-candidate clean, unless the game
   supplies its own.
3. **The steps**: a rung returns firings as lists of legs — a placement, a strike, or a
   step of the game's own with its effect on the working board — and the walk builds
   each step from the game's words and evidence, adding the move, the `targets` (the
   move's cells, each once) and the `marks` itself.
4. **The placement cull**: after a placement the walk strikes its value from the rest of
   the cell's no-repeat regions, as a leg continuing the placement's journey, or
   silently when the player's auto-pencil preference makes the placement's move do it.
5. **Journey continuation**: a firing is emitted whole, its later legs flagged
   `continuesPrevious`, so no game tracks which firing a step belongs to.

The game SHALL keep what carries its meaning: its recording solver, its regions, the
words and evidence of its steps, the axis its strikes split into legs on (dictated by
what the narration names singular), its own rungs, and the deviations the walk names as
optional hooks, each stating the game-shaped fact that needs it.

The engine SHALL also provide the pure plan helpers over a working `(grid, pencil)` and a
recorded `DeductionRecord[]` script (every naked single, whether any empty cell lacks
notes, the first recorded placement not yet on the working grid, every still-live strike
firing a plan could take now excluding placement-bookkeeping `dup` elims, the next forced
placement, `joinNums`), and generic `keepCandidateHintTrack` and
`refreshCandidateHintStep` over the shared pencil-move shape (`set` / `pencilAll` /
`pencilStrike`, read through a game's move dialect) and `CandidateHighlights`.

The placement classifier in `src/engine/latin-hint.ts` SHALL classify over an arbitrary
region list, so a game reasoning over sub-blocks and diagonals (Solo) classifies a hidden
single in any of its regions, while the row/column games pass only `[row, column]`.

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

- **WHEN** any game that walks its plan with `runCandidatePlan` emits a placement or a
  strike
- **THEN** the step's move is the game's own placement or strike move, its `targets`
  are the cells that move acts on, each once, and its `marks` are the candidates it
  strikes
