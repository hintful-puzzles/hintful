## RENAMED Requirements

- FROM: `### Requirement: Solver: Slant solves with a graded deductive solver`
- TO: `### Requirement: Solver: Slant's solver is the ladder its description states`

## MODIFIED Requirements

### Requirement: Solver: Slant's solver is the ladder its description states

The solver SHALL run the ladder `slant.description.yaml` states, compiled,
in its order, to a fixpoint, by difficulty, Normal adding to Easy, and SHALL
return one of three verdicts: impossible, unique or non-converged. A board
the ladder fills SHALL be judged by the answer check its rules compile to.
`findMistakes` SHALL reuse the solver, and so SHALL `solve()` where the board
came with no answer from its deal; a dealt board's Solve is the generator's
answer.

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong diagonals
- **THEN** the returned move list yields the unique solution

## REMOVED Requirements

### Requirement: Hint: Slant's hint steps come in the order its solver finds them

**Reason**: the hint walks the compiled ladder with the engine's continuing
walk, which takes the step that continues from the last ones and never one
harder than the ladder's own next, as every ladder hint does; the
hand-written passes and their order are gone.

**Migration**: "Hint: Slant's hint walks the ladder its solve runs".

## ADDED Requirements

### Requirement: Hint: Slant's hint walks the ladder its solve runs

The hint SHALL walk the ladder the solve runs, one firing at a time, from the
player's diagonals and same-slant marks, and SHALL never take a step harder
than the ladder's own next one: a clue or a loop is read before a square is
read through a mark wherever one is there to read.

#### Scenario: A clue comes before a mark

- **WHEN** a clue has exactly as many empty squares as lines left, and an
  empty square elsewhere slants alike with a drawn one by a mark
- **THEN** the plan's first step is the clue's
