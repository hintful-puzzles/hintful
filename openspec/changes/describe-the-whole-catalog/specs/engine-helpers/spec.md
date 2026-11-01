## ADDED Requirements

### Requirement: Every deduction ladder is compiled from its game's description

The engine SHALL provide `runDeductionFixpoint` in
`src/engine/deduction-fixpoint.ts`, the one runner a logic game's solver and
its explained hint share, so that the ordered-technique loop, the difficulty
cap, the step budget and its attribution are written once. A game's
techniques SHALL be stated in its description and run as the code
`npm run describe` compiles from it, and the runner SHALL accept only a
ladder built from a compiled module, so that a ladder written by hand does
not typecheck.

#### Scenario: A solve and a hint run one ladder

- **WHEN** a described game's generator solves a board and its hint walks
  the same board
- **THEN** both run the ladder compiled from the game's description, the
  hint recording each firing the solve makes

#### Scenario: A hand-written ladder is refused

- **WHEN** a game passes the runner a list of techniques it built itself,
  not one a compiled module's ladder produced
- **THEN** the typecheck fails

## REMOVED Requirements

### Requirement: A shared deduction-fixpoint scaffold

**Reason**: It kept the techniques per game and bound a game moving onto the
runner to its old verdicts; every ladder is now compiled from its
description, and a step may change what a tier solves (the owner,
2026-11-01).
**Migration**: "Every deduction ladder is compiled from its game's
description", added in this change.
