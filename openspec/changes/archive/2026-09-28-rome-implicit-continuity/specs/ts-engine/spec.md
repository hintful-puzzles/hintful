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
statement of its premise. The game SHALL own which firings are available. A firing
SHALL be offered to
the frontier only when the working board already shows its premise: a strike recorded
before the solver's next unmade placement whose premise cells hold no mark an earlier
firing has yet to strike, a placement the notes show as a naked or hidden single, and a
placement forced by a clue only where the plan has nothing else to take. The frontier
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
