## MODIFIED Requirements

### Requirement: Separate's clue layer stays its own

Separate's region constraints (required region sizes and the cells that must
be kept apart), its solver, its generator and its clue rendering SHALL remain
entirely its own: the letter, the repeated-letter error inside a completed
region, and the test that decides when a region is finished.

#### Scenario: A repeated letter in a completed region is Separate's error

- **WHEN** a wall-bounded region of exactly `k` cells holds one letter twice
- **THEN** Separate's own tile callback draws both of those letters in the
  error color

## REMOVED Requirements

### Requirement: Separate shares its border-marking mechanic rather than owning a copy

**Reason**: duplicate: Palisade stated the same rule of the same modules. Both
are now `border-grid`, "A border-grid game takes the mechanic from the engine
and owns no copy", which keeps this requirement's two scenarios.

### Requirement: The games' move formats stay independent

**Reason**: Moved to `border-grid`, with its words.

### Requirement: A game adopting the border-grid input adopts its look

**Reason**: Moved to `border-grid`, with its words.

### Requirement: Border-grid games share the hint's notation layer

**Reason**: Moved to `border-grid`, with its words.
