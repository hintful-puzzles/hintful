## ADDED Requirements

### Requirement: A test is not deferred while it is the only cover of a configuration

Deferral to the opt-in tier, `npm run test:slow`, SHALL be reserved for cases
where the cost is board size and not configuration. A test SHALL NOT be deferred when it is the only
one covering some configuration: deferring the only board for a grid type
silently removes that grid type from every commit. The remaining coverage
SHALL be stated where the deferral is made.

#### Scenario: A sweep's largest board is deferred

- **WHEN** the largest board a game's sweep walks is moved to the opt-in tier
- **THEN** every mode, difficulty and grid type it carried is still asserted on
  every commit by the smaller boards, and that is stated at the call site
- **BECAUSE** a refactor that changes a solver's verdict must still move a board
  the gate checks

## MODIFIED Requirements

### Requirement: A test is retired or deferred by measurement, never by category

A test SHALL be judged by what it would catch in a refactor that no cheaper
test would, and never by the era or the category it belongs to. "It was written
for the port" is not by itself a reason. A test that held the code only to
upstream's output SHALL be retired once each thing it was the only net under is
held by another test, named in the change.

#### Scenario: A configuration would lose its last cover

- **WHEN** retiring or deferring a test would leave a mode, grid type, difficulty
  or board size with nothing asserting it on every commit
- **THEN** the test stays, however slow, unless the change names the test that
  still covers that configuration at the site of the change
- **BECAUSE** a silently removed configuration reads identically to one that was
  never covered

## REMOVED Requirements

### Requirement: A test is not deferred when it is the only cover of a configuration

**Reason**: Its scenario was about deferring a board of a game's C differential, and the differentials are retired.

**Migration**: Restated, about a sweep's boards, as "A test is not deferred while it is the only cover of a configuration".
