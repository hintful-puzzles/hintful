# build-pipeline Specification Delta — spread-the-long-hint-walks

## ADDED Requirements

### Requirement: No one test file sets the gate's wall clock

No test file in the gate, and no share of a file the suite spreads over the workers, SHALL take more than half the gate's run on the CI runner, so that the run's time follows the suite's total over the workers rather than one file's.

#### Scenario: The cross-game hint walks share the workers

- **WHEN** the gate runs on CI
- **THEN** no share of the hint-resume walk or of the hint-quality walk takes more than half the run

#### Scenario: A spread sweep's census holds in every share

- **WHEN** a spread sweep closes over what its walk heard, such as a ledger of sentences a game still speaks
- **THEN** each share holds the games it walked to what it heard, and every game is walked by exactly one share
- **BECAUSE** no share can see another's walk, and a census over a share's own games is the same census the whole sweep made

## MODIFIED Requirements

### Requirement: The local hooks walk one board of each kind, and CI walks the rest

A cross-game sweep SHALL do less work in the local hooks than everywhere else
only where what it leaves out is more of the same: a second or later board of
one params set, a game's largest board where a smaller board of every mode,
tier and choice is still walked, the later steps of one board's plan, or the
moves between evenly spaced positions of one board's walk.

#### Scenario: A sweep walks several boards of one params set

- **WHEN** a cross-game sweep walks four boards of each tier
- **THEN** the local hooks walk one of each and CI walks the four
- **BECAUSE** the first board catches a defect that shows on every board of the
  tier, and the others catch what CI can catch in time

#### Scenario: A walk asks for a fresh plan after every move

- **WHEN** a walk recomputes a hint after each move of a board whose plan is
  hundreds of steps long
- **THEN** the local hooks recompute at a bounded number of evenly spaced
  moves, following the plan between them, and CI recomputes after every move
  of a plan up to a larger bound and at that many evenly spaced moves of a
  longer one
- **BECAUSE** a walk is quadratic in its plan's length, and one board whose
  plan is a thousand steps long cost a whole CI run's room in one case
