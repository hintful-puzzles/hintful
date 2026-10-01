## MODIFIED Requirements

### Requirement: Mosaic solves and checks mistakes against the deduced solution

The Solve command SHALL run the deductive solver on the clue board and apply
the full solution (cells flagged solved, status bar reading `Auto-solved.`),
failing with an error when deduction cannot complete the board. Whether the
board is complete SHALL be judged from the board itself (every clue satisfied),
so a solve move needs no completion bookkeeping of its own. `findMistakes`
SHALL return every cell the player has determined whose mark contradicts the
deduced solution, rendered as an error-colored outline overlay, and SHALL return
no mistakes when deduction stalls or the marks are consistent.

#### Scenario: Solve completes the board

- **WHEN** the Solve command runs on a generated board
- **THEN** every cell is determined, `status` returns `"solved"`, and the
  status bar reads `Auto-solved.`

#### Scenario: findMistakes flags a wrong mark

- **WHEN** the player marks black a cell that is white in the solution and
  Check & Save runs
- **THEN** `findMistakes` returns that cell
- **AND** a correctly-marked board returns no mistakes
