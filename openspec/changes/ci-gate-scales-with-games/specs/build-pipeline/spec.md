## ADDED Requirements

### Requirement: CI runs the suite in shards

CI's gate SHALL run the test suite as shards, each a job on a runner of its own, and the fast checks, the build and the research tools' guards once. The shards together SHALL run every test file, and every share of a spread file, exactly once. The run SHALL conclude with one verdict, failing when any part fails. Each part SHALL be steps of the one gate script, and the shard count SHALL be written in one place.

#### Scenario: CI and a manual run run one gate

- **WHEN** CI runs the gate in parts and a developer runs `npm run gate` whole
- **THEN** both run the steps of `scripts/gate.sh`, the parts naming which of them a job runs
- **BECAUSE** two definitions of the gate would drift apart

#### Scenario: The catalog grows

- **WHEN** games are added until the shards' mean cost nears a shard's budget
- **THEN** the gate says so, and one more shard in the matrix restores the run's wall time
- **BECAUSE** the suite's cost grows with every game, and a run whose wall time is the whole suite's on one runner outgrows any limit set on it

#### Scenario: A spread file is sharded

- **WHEN** the suite runs in shards
- **THEN** each shard walks shares of its own of each spread file, and the shards together walk every share once
- **BECAUSE** a placement by file alone would put every share of a spread file in one shard, which would walk the sweep whole

## MODIFIED Requirements

### Requirement: No one test file sets the gate's wall clock

No test file in the gate, and no share of a file the suite spreads over the workers, SHALL take more than half a shard's run on the CI runner, so that the run's time follows the shard's total over the workers rather than one file's.

#### Scenario: The cross-game hint walks share the workers

- **WHEN** the gate runs on CI
- **THEN** no share of the hint-resume walk or of the hint-quality walk takes more than half its shard's run

#### Scenario: A spread sweep's census holds in every share

- **WHEN** a spread sweep closes over what its walk heard, such as a ledger of sentences a game still speaks
- **THEN** each share holds the games it walked to what it heard, and every game is walked by exactly one share
- **BECAUSE** no share can see another's walk, and a census over a share's own games is the same census the whole sweep made

### Requirement: The gate holds each test file to a cost budget

The gate SHALL record the CPU time each test file costs, a spread file's share counting as one file, scaled by the run's own time for a fixed workload. It SHALL name a file over its budget, and in CI the shards' mean over a shard's budget, and SHALL fail the run when one exceeds it by more than the error measured between runners, naming the cost, its budget and the treatments `docs/testing.md` gives. It SHALL judge CPU time, never wall time, in CI and in the local hooks alike.

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
