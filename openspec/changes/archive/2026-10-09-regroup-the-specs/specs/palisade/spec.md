## MODIFIED Requirements

### Requirement: The hint is seeded from the player's own walls and marks

`hint(state)` SHALL start the solver from the player's current state: the
player's walls as walls already drawn, and every edge the player has marked
"no wall" as a join already made. It SHALL then run the six deductions to a
fixpoint.

#### Scenario: A player no-wall mark is not re-hinted

- **WHEN** the player has marked an edge "no wall" that the solver would also
  deduce as no-wall
- **THEN** that edge does not appear as a step in the returned plan, since its
  fact is part of what the solver starts from

### Requirement: Palisade's clue layer stays its own

Palisade's clue semantics (each cell's count of adjacent walls), its solver,
its generator, its difficulty grading and its clue rendering SHALL remain
entirely its own: the digit, the clue-satisfaction test that decides when a
region is finished, and the explained hint's sentences.

#### Scenario: The explained hint survives the shared renderer

- **WHEN** a hint step is displayed
- **THEN** the edges it forces paint in the hint color, over their normal
  three-valued states
- **AND** the cells it references are marked inside the cell body
- **AND** its narration is Palisade's own

## REMOVED Requirements

### Requirement: Palisade shares its border-marking mechanic rather than owning a copy

**Reason**: duplicate: Separate stated the same rule of the same modules. Both
are now `border-grid`, "A border-grid game takes the mechanic from the engine
and owns no copy", which keeps this requirement's scenario.
