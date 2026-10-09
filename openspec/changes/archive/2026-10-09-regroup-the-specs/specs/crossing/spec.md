## ADDED Requirements

### Requirement: The hint replays the solver's deduction

The hint SHALL be derived from the same deduction engine as the solver,
replayed one firing at a time.

#### Scenario: Following the hint solves the board

- **WHEN** hints are requested and followed, one plan after another, from a
  generated board with nothing entered
- **THEN** the board reaches the solution the solver finds

## MODIFIED Requirements

### Requirement: Every Crossing hint step is narrated

Every step of a Crossing hint plan SHALL carry an explanation that names the
run its deduction reasons over.

#### Scenario: Every step of a plan has its deduction

- **WHEN** a plan is computed for a board the solver can finish
- **THEN** every step carries an explanation that names the run its deduction
  reasons over

## REMOVED Requirements

### Requirement: The solver calls a board valid only when every clue is used once

**Reason**: duplicate: they are one rule and one function. `status` in
`src/games/crossing/state.ts` and the solver in `solver.ts` both return the
verdict of `validateBoard`, so "Crossing is complete when every clue is placed
exactly once" states this requirement's condition (every run matches exactly
one clue number and each clue number is used once), and its scenario, that a
fixpoint with an open cell undecided is not valid, is in "Crossing's solver
propagates what the fitting numbers allow" ("or reports that the board is not
fully determined or is contradictory"). The generator's use of the verdict is
in "Crossing's generator keeps every board uniquely solvable".

### Requirement: The hint replays the solver's deduction and leaves the solver alone

**Reason**: Reworded in `crossing` as "The hint replays the solver's
deduction". The clause that the hint SHALL NOT alter the solver, the generator
or the description codec goes as `how`, and the title loses the half that named
it. It was the scope of the change that added the hint, not a standing rule:
the header of `src/games/crossing/hint-solver.ts` records it as a choice of
where the recording pass sits ("beside the untouched `solveCrossing` ... so
keeping the recording pass in its own module makes 'the solver didn't move'
checkable from the file list"). Whether the solver is frozen against later hint
work is an internal design decision, so it is decided here: it is not, and a
later change that folds the two into one engine breaks no promise. What a board
is promised stays in "Crossing's generator keeps every board uniquely
solvable", and the description format in its own two requirements.
