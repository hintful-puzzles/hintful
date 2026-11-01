## MODIFIED Requirements

### Requirement: A shared deduction-fixpoint scaffold

The engine SHALL provide `runDeductionFixpoint` in
`src/engine/deduction-fixpoint.ts`, a reusable runner that a logic game's
solver and its explained hint share, so that the ordered-technique loop, the
difficulty cap, the step budget and its attribution are written once. A
game's techniques SHALL be stated in its description and run as the code
`npm run describe` compiles from it, and the runner SHALL accept only a
ladder built from a compiled module, so that a ladder written by hand does
not typecheck. A game that hand-rolls this loop SHALL converge onto the
shared runner without weakening its ladder: every board it solved at a tier
it SHALL still solve at that tier.

#### Scenario: The generation path is unchanged by the shared runner

- **WHEN** a game's hand-rolled loop is moved onto the shared runner and its
  solver runs with no budget
- **THEN** it reaches the same solved or stuck verdict on every board, and
  where it grades, the same difficulty

#### Scenario: A hand-written ladder is refused

- **WHEN** a game passes the runner a list of techniques it built itself,
  not one a compiled module's ladder produced
- **THEN** the typecheck fails
