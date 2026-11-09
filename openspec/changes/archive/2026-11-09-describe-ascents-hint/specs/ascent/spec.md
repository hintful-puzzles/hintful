## MODIFIED Requirements

### Requirement: Generation: Ascent solves with a four-tier deductive solver

The solver SHALL find the unique completion of a graded puzzle or report that
it cannot, by the ladder Ascent's description states, without guessing. Easy
SHALL apply single-position and simple proximity, Normal full proximity and
dead ends, Tricky simple single-number, and Hard full single-number and
overlap. An Edges board SHALL add each arrow's line at Easy and overlap at
Normal.

#### Scenario: A graded board is solved only at its difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** the graded solver reaches the unique completion at that difficulty, and
  a strictly weaker ruleset does not

### Requirement: Hint: Ascent explains the next number

Every hint step SHALL place one number, or one whole run where a later
requirement says so, and every fact it rests on SHALL be a number, a wall or an
arrow on the board. Each step SHALL be a placement one of the ladder's placing
techniques makes on a reading of the player's board, which the ladder's
striking techniques narrow; the reading SHALL be rebuilt before every step, and
SHALL NOT read lines the player drew. A step SHALL be followed by placing its
number by any gesture.

#### Scenario: Following the hint finishes the board

- **WHEN** the player follows every hint step from a newly generated board, in
  any grid mode, tier or option
- **THEN** the board is solved and no step placed a wrong number
