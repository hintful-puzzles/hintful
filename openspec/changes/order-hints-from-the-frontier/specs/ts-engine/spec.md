# ts-engine

## ADDED Requirements

### Requirement: A hint plan works outward from what the board already determines

A hint plan's steps SHALL each be on a path to visible progress: every step SHALL
extend the boundary between what the board already determines and what it does not,
advance a chain that a later step turns into such an extension, or open a new region
of the board. A plan SHALL NOT offer a step nothing later builds on and which
determines nothing itself.

Among the steps that qualify, the plan SHALL prefer an extension to a chain that has
yet to pay off, and the cheapest reasoning among equals — so a chain of easy
deductions is preferred to a single hard one, and a hard step is offered exactly when
nothing easier is contributing, rather than being deferred.

A plan MAY move between separated regions of the board; what it may not do is offer a
step that leads nowhere. Distance alone SHALL NOT decide, since a distant step that
opens a new region contributes while an adjacent step nothing builds on does not.

Nearness SHALL be measured from the board. A plan SHALL NOT order its firings by the
player's move history, nor by which step the app last displayed, because the plan is
recomputed from scratch whenever the player goes their own way and two identical
boards must yield the same plan. Ordering MAY depend on the plan's own earlier
firings, which are themselves derived from the board in the same pass.

A game that supplies no metric SHALL keep its ladder's own order, and ordering SHALL
NOT change which boards the generator builds.

#### Scenario: two firings of the same difficulty, one beside the player's work

- **WHEN** a plan is built on a board where two firings of the same difficulty are
  available, one touching the determined/undetermined boundary and one far from it
- **THEN** the plan offers the one touching the boundary first

#### Scenario: a step nothing builds on

- **WHEN** a firing determines nothing itself and no later step in the plan rests on
  what it establishes
- **THEN** the plan does not offer it, whatever its difficulty or position

#### Scenario: a distant step that opens a new region

- **WHEN** a firing acts far from every determined element but opens a region the plan
  goes on to work in
- **THEN** it is admissible, because the plan is judged on contribution rather than on
  distance

#### Scenario: two firings at the boundary, one cheaper

- **WHEN** two firings both extend the boundary and one needs cheaper reasoning
- **THEN** the plan offers the cheaper one, so a chain of easy deductions is taught in
  place of a single hard one

#### Scenario: the same board reached two ways

- **WHEN** one board is reached by two different move sequences and a hint is asked
  for in each
- **THEN** the two plans order their firings identically

### Requirement: A note a hint asks for is placed beside the step that uses it

Where a hint plan asks the player to record a fact as a note, that note SHALL be
placed immediately before the firing whose reasoning rests on it, and SHALL be part
of that firing's journey rather than a step of its own.

A note placed where the solver happened to *discover* the fact reads as an
unmotivated triviality, because nothing on screen connects it to the deduction it
serves — which is what a player reported of a corner note offered many steps before
its use. Facts only accumulate, so deferring a note to its consumer cannot make it
underivable.

#### Scenario: a fact found long before it is used

- **WHEN** a plan's firing rests on a fact its solver derived many firings earlier
- **THEN** the note placing that fact is offered immediately before that firing, in
  the same journey, not at the point it was derived
