## RENAMED Requirements

- FROM: `### Requirement: Solver: Rome's solver deduces and never guesses`
- TO: `### Requirement: Solver: Rome's solver is the ladder its description states, and never guesses`

## MODIFIED Requirements

### Requirement: Rules: Rome is complete when every arrow leads to a goal

Completing the board SHALL report the game solved, and a board is complete
when every square is filled and the rules its description states hold of it:
following the arrows from any square leads to a goal, and no outlined area
holds an arrow twice.

#### Scenario: Completing the grid wins

- **WHEN** the final arrow is placed so every square leads to a goal with no loop
  and no duplicate arrow in any region
- **THEN** the game is reported solved

### Requirement: Solver: Rome's solver is the ladder its description states, and never guesses

Rome SHALL provide a solver that runs the ladder `rome.description.yaml`
states, compiled, in its order, to a fixpoint, and fills the grid by it, or
reports that the board is invalid or incomplete. The ladder SHALL be gated by
difficulty: the Easy techniques, then the additional Normal ones, then the
additional Tricky one. No technique SHALL suppose anything, at any
difficulty.

#### Scenario: The solver completes a soluble board without guessing

- **WHEN** a soluble board is solved at its difficulty
- **THEN** every square is filled by deduction and the result reaches a goal from
  every square with no loops and no duplicate arrows in any region

## REMOVED Requirements

### Requirement: Hint: The hint's recorder changes nothing the solver decides

**Reason**: the recorder is the engine's compiled ladder run with a recorder,
which one firing at a time comes to the board the solve does by
construction; there is no hand-written projection left to diverge.

**Migration**: "Hint: Rome's hint teaches the solve the generator graded".

## ADDED Requirements

### Requirement: Hint: Rome's hint teaches the solve the generator graded

The hint SHALL record the ladder the solve runs, one firing at a time, and
the arrows it places SHALL be the arrows the solve places.

#### Scenario: The recording places what the solve places

- **WHEN** a board is solved, and its deductions are recorded from its clues
- **THEN** the arrows the recording places, with the clues, are the solved grid
