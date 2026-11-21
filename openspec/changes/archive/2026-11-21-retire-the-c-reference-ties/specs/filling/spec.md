## ADDED Requirements

### Requirement: Solver: Filling's solver deduces the unique solution

The solver SHALL run the ladder Filling's description states, compiled, to a
fixpoint, where regions grow into the squares they cannot do without and
numbers are ruled out of squares they cannot hold. Each technique SHALL be
checked sound, and SHALL read only the numbers on the board.

#### Scenario: Solver completes a generated board

- **WHEN** the solver runs on a freshly generated puzzle's clues
- **THEN** it reports solved
- **AND** the produced board has every region sized to its number

## REMOVED Requirements

### Requirement: Solver: Filling solver deduces the unique solution

**Reason**: Its second scenario held the solver to finishing every board in upstream's recorded corpus, which is retired.

**Migration**: Restated without it as "Solver: Filling's solver deduces the unique solution". Upstream's Filling game IDs still load with one answer (`src/guards/upstream-descs.test.ts`).
