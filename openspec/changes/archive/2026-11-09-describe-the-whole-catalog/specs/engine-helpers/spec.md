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

## MODIFIED Requirements

### Requirement: The grade and the cap are tiers, never positions

The engine's ladder runtime (`ladderTechniques`) SHALL grade each scale by
the highest `tier` among its techniques that fired, and SHALL cap each scale
by tier, excluding every technique above the cap wherever it sits in the
ladder, so a cheap technique placed after an expensive one still runs under a
low cap. Neither SHALL depend on a technique's position.

#### Scenario: Two techniques sharing one tier grade alike

- **WHEN** a ladder declares two techniques at the same `tier` and only the
  later one fires
- **THEN** the reported grade is that shared tier, not the technique's position
  in the ladder

#### Scenario: A cap excludes by tier, not by position

- **WHEN** a ladder places a low-tier technique after a high-tier one and runs
  under a cap below the high tier
- **THEN** the high-tier technique is skipped and the low-tier one still runs

### Requirement: The recording path steps the ladder one firing at a time through the engine

The engine SHALL provide, beside the deduction-fixpoint runner, a driver that
runs the same ladder one firing per call (`singleFirings`), and a hint that
records a firing at a time SHALL use it. The driver and the runner SHALL share
one pass down the ladder, so the restart rule and the budget cannot differ
between the solver's projection and the hint's.

#### Scenario: One firing per call

- **WHEN** a hint calls the driver on a board where two techniques each have
  work to do
- **THEN** each call returns exactly one firing, restarting from the easiest
  technique
- **AND** a call after the ladder is exhausted returns nothing

### Requirement: A call of the driver returns one firing, and a contradiction is sticky

Each call SHALL run the ladder from its first technique and return the technique
that fired, or nothing when no technique fires. A contradiction SHALL be sticky:
once a technique proves the board inconsistent, the driver SHALL report it and
SHALL run no technique again. The step budget SHALL be required, and its
attribution tally SHALL outlive a single call, so a technique that runs away
across many calls is named.

#### Scenario: A contradiction stops the driver for good

- **WHEN** a technique proves the board inconsistent
- **THEN** the driver reports the contradiction and returns nothing
- **AND** no technique runs on any later call

## REMOVED Requirements

### Requirement: A conditionally available technique guards itself in run

**Reason**: Where a technique runs is stated in its description, by a
variation or a tier's `from` and `until`, and the runtime admits it by that;
no game writes a `run` to guard.
**Migration**: `described-ladder`, "A technique a variation adds runs only
where it is on".

### Requirement: The early-out means there is nothing left for the ladder to do

**Reason**: No compiled ladder needs one: a contradiction is a technique's
negative answer, and a ladder stops when nothing fires.
**Migration**: None.

### Requirement: A game that does not fit the runner records the promise it breaks

**Reason**: Every game's ladder is compiled from its description and runs on
the runner; none keeps a loop of its own.
**Migration**: "Every deduction ladder is compiled from its game's
description", added in this change.

### Requirement: A bespoke loop carries three obligations

**Reason**: No game keeps a loop of its own, so no obligation is owed by one.
**Migration**: "Every deduction ladder is compiled from its game's
description", added in this change.

### Requirement: A shared deduction-fixpoint scaffold

**Reason**: It kept the techniques per game and bound a game moving onto the
runner to its old verdicts; every ladder is now compiled from its
description, and a step may change what a tier solves (the owner,
2026-11-01).
**Migration**: "Every deduction ladder is compiled from its game's
description", added in this change.
