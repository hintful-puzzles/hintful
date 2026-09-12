## ADDED Requirements

### Requirement: Singles generates unique, difficulty-graded boards

`newDesc` SHALL generate a board by constructing a Latin rectangle, adding black
squares at random with solver assistance (forced whites laid between
placements), and assigning numbers under the black squares so the solution stays
unique. It SHALL accept the board only when it is solvable at the requested
difficulty and *not* solvable one difficulty level below (with the sneaky
generation-artifact deduction enabled), regenerating otherwise. Difficulty SHALL
downgrade to Easy when `min(w, h) < 4`. Generation from a given seed SHALL
be reproducible.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated at difficulty D
- **THEN** the solver solves it at D
- **AND** (for Normal) the solver fails to solve it at the level below D even
  with the sneaky deduction

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Singles description

## MODIFIED Requirements

### Requirement: Singles rendering

`redraw` SHALL draw a grid-outlined tile per cell: black (or red on error) fill
for a blackened cell, otherwise the background (or lowlight during the
completion flash); a circle ring for a circled (white-marked) cell; the cell's
number always for a white cell and, when the show-black-numbers preference is
on, also for a black cell; cursor corners on the cursor cell; and a red grid
outline when the board is in an impossible state. A genuine completion (not a
solved-with-help) SHALL trigger the completion flash.

#### Scenario: A blackened cell renders black with no number by default

- **WHEN** a cell is blackened and the show-black-numbers preference is off
- **THEN** the tile is filled with the black color and no number is drawn

#### Scenario: An erroneous cell renders in the error color

- **WHEN** `checkComplete` flags a cell as an error
- **THEN** that cell is drawn in the error color

## REMOVED Requirements

### Requirement: Singles generator produces unique, difficulty-graded boards

**Reason**: It required generation to be RNG-faithful so the desc matches the C reference byte-for-byte, with a scenario asserting it. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Singles generates unique, difficulty-graded boards", which keeps the generation and difficulty gate and seed reproducibility without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
