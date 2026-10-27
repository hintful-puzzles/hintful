# build-pipeline Specification Delta — enforce-test-time-budgets

## ADDED Requirements

### Requirement: The gate holds each test file to a cost budget

The gate SHALL record the CPU time each test file costs, a spread file's share counting as one file, scaled by the run's own time for a fixed workload. It SHALL name a file or a suite over its budget, and SHALL fail the run when one exceeds it by more than the error measured between runners, naming the file, its cost, its budget and the treatments `docs/testing.md` gives. It SHALL judge CPU time, never wall time, in CI and in the local hooks alike.

#### Scenario: A file grows past its budget

- **WHEN** a commit adds boards to a cross-game sweep until its file costs more CPU time than its budget allows, the runners' error included
- **THEN** the gate fails on that file, naming its cost, its budget and the treatments for an expensive test
- **BECAUSE** a suite's cost is otherwise noticed only once it has slowed every session

#### Scenario: A slower runner runs a tree within its budget

- **WHEN** the same tree runs on a runner that takes half again as long for the fixed workload
- **THEN** its scaled costs stay within the error the gate allows, and the run passes, naming any cost over its budget
- **BECAUSE** GitHub's runners differ in speed, and a check that a tree passes on one runner and fails on the next is a coin toss, not a budget

#### Scenario: A busy machine runs a file within its budget

- **WHEN** a file whose work is within its budget runs on a machine so loaded that its wall time is several times its solo time
- **THEN** the budget check passes it
- **BECAUSE** CPU time measures the work, and wall time measures the machine's spare capacity

### Requirement: A hook's run is held to a ceiling

The commit hook and the push hook SHALL each price their plan, before running any test, from the CPU time its files cost in the last runs recorded on that machine, and SHALL run only what fits the hook's ceiling, naming what they leave out. A commit SHALL leave the rest to the push, which then runs its whole plan, and a push to CI. A test file the commit stages, and a file no run has recorded, SHALL run whatever they cost.

#### Scenario: A commit selects most of the suite

- **WHEN** a commit stages a path that selects every test file outside the games, and their recorded cost exceeds the commit hook's ceiling
- **THEN** the hook runs the cheapest of them that fit and names the dearest it left to the push
- **BECAUSE** a commit that waits minutes on tests it did not ask for is the cadence this budget exists to protect, and a plan that cannot be split must still be committable without bypassing the gate

#### Scenario: A commit left files to the push

- **WHEN** a commit hook left files out, and every commit of the push was a game's own
- **THEN** the push runs its whole plan rather than nothing
- **BECAUSE** the commits' plans no longer show what they ran

### Requirement: The default suites walk one board of each kind, and the slow tier the rest

A cross-game sweep SHALL walk the same boards in the local hooks as in CI: a board of every params set it walks and of every value of every mode, tier and choice a game offers, as `gatePresets` returns them. What it leaves out SHALL be more of the same, run in the slow tier: a later board of one params set, a game's largest board, a plan's later steps. It SHALL NOT leave out the only board of a kind, and the call site SHALL say what the default amount walks.

#### Scenario: A sweep walks several boards of one params set

- **WHEN** a cross-game sweep's property is checked on four boards of each tier
- **THEN** the hooks and CI walk one of each, and the slow tier walks the four
- **BECAUSE** the first board catches a defect that shows on every board of the tier, and a heavy test useful for development stays in no default suite (owner, 2026-10-27)

#### Scenario: A mode is offered only on a game's largest preset

- **WHEN** a value of a boolean or choice setting appears on no preset but the largest
- **THEN** the default suites still walk a board with that value
- **BECAUSE** the lever takes off size, never a mode

## REMOVED Requirements

### Requirement: The local hooks walk one board of each kind, and CI walks the rest

**Reason**: CI's extra boards were 31 of its 66.5 minutes in the two hint walks alone (Gate run 40540239012), and the owner asked that a heavy test useful for development stay in no default suite.

**Migration**: Replaced by "The default suites walk one board of each kind, and the slow tier the rest".

### Requirement: The hook keeps a board of every kind and every check one board can fail

**Reason**: What the hook kept is now what every default suite walks, so the requirement is folded into its replacement.

**Migration**: Replaced by "The default suites walk one board of each kind, and the slow tier the rest".
