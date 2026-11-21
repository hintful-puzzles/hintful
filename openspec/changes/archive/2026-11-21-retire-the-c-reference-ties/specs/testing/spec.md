## MODIFIED Requirements

### Requirement: The test suite's strength is audited, not assumed

The repository SHALL periodically measure whether its tests would catch a
regression, not merely whether they execute the code, by mutation-testing the
shared engine and triaging the survivors. The deliverable SHALL be a triaged
survivor list, each survivor classified as a missing assertion, a genuinely
unreachable branch or an equivalent mutant. Where survivors cluster SHALL be
reported: survivors in code the hint walks are meant to protect mean that net
is thinner than believed.

#### Scenario: A refactor is justified by an unmoved fixture

- **WHEN** a change argues it is behavior-preserving because no hint-walk
  snapshot moved
- **THEN** that argument is only as strong as the walks' measured coverage of
  the paths the change touched
- **AND** where the audit has shown that coverage to be thin, the change adds a
  direct assertion rather than relying on the walks alone

#### Scenario: A snapshot's paired assertions are not load-bearing

- **WHEN** the audit finds surviving mutants in a render path protected only by a
  snapshot
- **THEN** the targeted assertions that snapshot is required to be paired with are
  strengthened
- **BECAUSE** a snapshot alone can be re-baselined with `vitest -u` and the
  guarantee silently lost

#### Scenario: A shared module's semantics are pinned only by a distant consumer

- **WHEN** a mutant in a shared engine module survives that module's own test file
  and is killed only by a game's tests or a cross-game guard
- **THEN** an assertion is added to the module's own test file, naming the
  behavior rather than the mutant
- **BECAUSE** coverage several layers away is adequate as protection and poor as
  feedback: a run of just the relevant test files is then green on a broken
  module

### Requirement: A shared module's tests give feedback where the code lives

A module in `src/engine/` SHALL be able to fail its own tests when its behavior
changes, and SHALL NOT rely solely on a consumer's tests or a cross-game guard
to notice. Logic that moves from a game into `src/engine/` SHALL
have its tests written in the same change. A session runs the files it
touched, so a module whose own tests cannot see its defects returns green on a
broken module.

#### Scenario: Logic is extracted into the engine

- **WHEN** logic moves from a game into `src/engine/`
- **THEN** its tests are written in the same change
- **BECAUSE** extraction moves the code but not its tests: the game's
  tests still catch defects, so nothing turns red and the module
  silently arrives with no local assertions

#### Scenario: A module is fully protected but locally silent

- **WHEN** a module has few or no surviving mutants but its own tests do not fail
  on a defect planted in it
- **THEN** that is a feedback defect to fix, not a coverage success to report
- **BECAUSE** the failure it produces is a green targeted run on a broken module

### Requirement: A module's own tests are derived from what imports it

A module's own tests SHALL be derived rather than assumed: they are every
engine test file that imports the module, or imports a barrel re-exporting it,
and not one file named after it. A game's test file SHALL NOT count as a local
test, because its guarantee is the distant one local feedback is separated
from.

#### Scenario: A module is tested through its barrel

- **WHEN** a test file imports a barrel that re-exports a module
- **THEN** that file is among the module's own tests, whatever it is named

## ADDED Requirements

### Requirement: A recording of upstream's C is kept only where a game ID depends on it

A recording of upstream's C SHALL be kept only where a game ID a player holds
depends on what it records: a tiling's incidence numbering, which a Loopy game
ID indexes its clues by, and the descs and params strings upstream's
generator wrote, which keep loading. Neither can be re-recorded or added to.
Which board a seed deals, the RNG stream and a tier upstream graded SHALL NOT
be held to a recording.

#### Scenario: A seed's board is not held to upstream's

- **WHEN** a test would assert that a seed deals the desc upstream dealt for it
- **THEN** it is not written, since which board a seed deals is free to change

#### Scenario: An upstream desc stops loading

- **WHEN** a change makes a desc in `src/guards/__fixtures__/upstream-descs.json`
  fail to load
- **THEN** the change is a compatibility break for the owner to decide, and the
  desc is not removed from the corpus to make the guard pass

### Requirement: A guarantee left to a game's tests is stated and verified

Where a module's own tests deliberately let a defect through because a game's
tests hold that guarantee, that division of labor SHALL be stated in the
module's test file and SHALL be verified, by confirming the game's test does
fail on the defect the local tests let through.

#### Scenario: A guarantee is left to a game

- **WHEN** a module's own tests deliberately let a defect through
- **THEN** its test file names the game's test that holds that guarantee
- **AND** that test has been seen to fail on the defect

## REMOVED Requirements

### Requirement: A shared helper carries the byte-for-byte differential shape

**Reason**: No test holds a generator to upstream's descs; `src/engine/testing/differential.ts` and every game differential are deleted.

**Migration**: A board's tier is held by the tier gate and ladder census, an upstream desc loading by `upstream-descs.test.ts`, which boards exist by the hint-walk snapshots, Inertia's route length by a ratchet (`docs/testing.md` § "When the boards a seed deals move").

### Requirement: A C-recorded fixture is kept for what cannot be derived, not as a quality bar

**Reason**: It kept the per-game desc differentials and the RNG corpus as the refactoring net; both are retired, since which board a seed deals is free to change.

**Migration**: "A recording of upstream's C is kept only where a game ID depends on it" keeps the grid numbering fixtures and the upstream game-ID corpus.

### Requirement: The frozen fixtures' provenance is stated once, and no recipe is carried

**Reason**: The shared helper that stated the fixtures' provenance is deleted with the fixtures.

**Migration**: The two C recordings that stay, the grid numbering fixtures and `upstream-descs.json`, each state their provenance in the header of the test that reads them, and carry no recipe.

### Requirement: A guarantee left to a differential is stated and verified

**Reason**: There are no differentials, and a draw order is no one's guarantee: which board a seed deals is free to change.

**Migration**: "A guarantee left to a game's tests is stated and verified" keeps the rule for a guarantee a module leaves to a game's tests.
