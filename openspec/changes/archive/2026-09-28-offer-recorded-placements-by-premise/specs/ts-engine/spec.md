## MODIFIED Requirements

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

## ADDED Requirements

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
