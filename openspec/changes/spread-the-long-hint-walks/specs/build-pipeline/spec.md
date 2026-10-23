# build-pipeline Specification Delta — spread-the-long-hint-walks

## ADDED Requirements

### Requirement: No one test file sets the gate's wall clock

No test file in the gate SHALL take more than half the gate's run on the CI runner, so that the run's time follows the suite's total over the workers rather than one file's.

#### Scenario: The cross-game hint walks share the workers

- **WHEN** the gate runs on CI
- **THEN** neither the hint-resume walk nor the hint-quality walk takes more than half the run
