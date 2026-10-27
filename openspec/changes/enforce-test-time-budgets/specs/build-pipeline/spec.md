# build-pipeline Specification Delta — enforce-test-time-budgets

## ADDED Requirements

### Requirement: The gate holds each test file to a cost budget

The gate SHALL record the CPU time each test file costs in the run, a spread file's share counting as one file, and SHALL fail when a file exceeds the budget for it or the run's total exceeds the suite's budget. The failure SHALL name the file, its cost, its budget and the treatments `docs/testing.md` gives for an expensive test. The check SHALL judge CPU time, never wall time, and SHALL apply in CI and in the local hooks alike.

#### Scenario: A file grows past its budget

- **WHEN** a commit adds boards to a cross-game sweep until its file costs more CPU time than its budget
- **THEN** the gate fails on that file, naming its cost, its budget and the treatments for an expensive test
- **BECAUSE** a suite's cost is otherwise noticed only once it has slowed every session

#### Scenario: A busy machine runs a file within its budget

- **WHEN** a file whose work is within its budget runs on a machine so loaded that its wall time is several times its solo time
- **THEN** the budget check passes it
- **BECAUSE** CPU time measures the work, and wall time measures the machine's spare capacity

### Requirement: A hook's plan is held to a ceiling before it runs

The commit hook and the push hook SHALL each predict their plan's CPU time from the costs of the files it selects, as the last measured run recorded them, and SHALL refuse a plan whose prediction exceeds the hook's ceiling before running any test, naming the files that cost it.

#### Scenario: A commit selects most of the suite

- **WHEN** a commit stages a path that selects every test file outside the games, and their recorded cost exceeds the commit hook's ceiling
- **THEN** the hook stops before running a test and names the selected files with their costs
- **BECAUSE** a commit that waits minutes on tests it did not ask for is the cadence this budget exists to protect
