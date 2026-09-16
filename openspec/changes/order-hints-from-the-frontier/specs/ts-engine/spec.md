# ts-engine

## ADDED Requirements

### Requirement: A hint plan continues from the work it just did

A hint plan SHALL offer its next step where the player is already working, unless no
step is available there. "Where the player is working" SHALL mean within a few steps'
reach of what the plan's own recent steps determined, on whatever notion of adjacency
the game defines for its board.

Where a plan leaves that neighborhood it SHALL be because nothing there fires, not
because a step elsewhere was found first. A plan MAY therefore open a new region of
the board, and MAY alternate between regions, but SHALL NOT pass over an available
step beside its own last step in order to act somewhere else.

Among the steps available where the player is working, the plan SHALL offer the one
needing the cheapest reasoning, so that a chain of easy deductions is taught in place
of a single hard one, and a hard step is reached exactly when nothing easier fires
there rather than being deferred in favor of remote easy work.

Continuity SHALL be measured from the board and from the plan's own earlier steps,
never from the player's move history nor from which step the app last displayed,
because a plan is recomputed from scratch whenever the player goes their own way and
two identical boards must yield the same plan.

A game that supplies no notion of adjacency SHALL keep its ladder's own order, and
this ordering SHALL NOT change which boards the generator builds.

#### Scenario: two steps available, one beside the last

- **WHEN** a plan has just determined part of the board and two steps are available,
  one within reach of what it just determined and one across the board
- **THEN** the plan offers the one within reach, so the player's next hint continues
  the work they were following

#### Scenario: nothing left nearby

- **WHEN** no step is available within reach of the plan's recent steps
- **THEN** the plan may act anywhere on the board, because opening a new region is how
  a solve proceeds once a region is exhausted

#### Scenario: two steps at hand, one cheaper

- **WHEN** two steps are both available where the player is working and one needs
  cheaper reasoning
- **THEN** the plan offers the cheaper one, so a chain of easy deductions replaces a
  single hard one

#### Scenario: the same board reached two ways

- **WHEN** one board is reached by two different move sequences and a hint is asked
  for in each
- **THEN** the two plans order their steps identically

### Requirement: A note a hint asks for is placed beside the step that uses it

Where a hint plan asks the player to record a fact as a note, that note SHALL be
placed immediately before the step whose reasoning rests on it, and SHALL be part of
that step's journey rather than a step of its own.

A note placed where the solver happened to *discover* the fact reads as an unmotivated
triviality, because nothing on screen connects it to the deduction it serves. Facts
only accumulate, so deferring a note to its consumer cannot make it underivable, while
advancing one could.

#### Scenario: a fact found long before it is used

- **WHEN** a plan's step rests on a fact its solver derived many steps earlier
- **THEN** the note placing that fact is offered immediately before that step, in the
  same journey, not at the point it was derived
