## MODIFIED Requirements

### Requirement: Hint: Undead's hint is a plan of the game's own

Undead's hint plan SHALL be the game's own, built from its ladder's `total` and
`sightline` techniques run on the player's pencil marks, a cell with none
reading as every monster.

#### Scenario: Naked single is surfaced first as a placement

- **WHEN** an undecided cell's surviving candidates have collapsed to a single monster
- **THEN** the hint places that monster (a `set` move) before any elimination step,
  explaining that only that monster keeps the cell consistent

#### Scenario: Total exhaustion is narrated honestly, not as a sightline

- **WHEN** every monster of one type permitted by the totals is already placed and an
  undecided cell still lists that monster as a candidate
- **THEN** the hint emits a `total` strike of that monster from every still-undecided
  cell as one journey, explaining that the type's full count is already placed
- **AND** the narration does not claim a sightline forced the elimination

### Requirement: Hint: The forcing rung never reaches an Undead hint

The forcing rung is a search: it assumes a candidate and runs the
arc-consistency and counting fixpoint from it. The hint SHALL NOT read it on
any tier, while the solver SHALL retain it, so that grading and generation are
the same with the hint as without.

#### Scenario: The forcing rung never reaches a narration

- **WHEN** hint plans are walked across every tier and many seeds
- **THEN** no step is a forcing one, on any tier
