## MODIFIED Requirements

### Requirement: Dominosa provides an explained deductive hint

The `dominosa` game SHALL implement `Game.hint(state)`, returning a narrated
plan computed from the player's current board by running the ported deductive
solver one firing at a time (seeded from the placed dominoes). Each step SHALL
carry a forced move and an explanation of *why* it is forced (the Palisade
quality bar):

- a **placement** step when a domino has exactly one remaining spot (the move
  places that domino), or when a square can pair with only one domino;
- a **barrier** step when a deductive technique proves a spot cannot hold a
  domino (the move draws that barrier edge), narrated by the technique
  (duplicate-forcing, must-overlap, odd-region parity, set analysis, forcing
  chain). Barriers ruled out by one firing SHALL group into one
  `continuesPrevious` journey, and a barrier the player has already drawn SHALL
  be skipped for display while still advancing the deduction.

A hint SHALL be refused when the board is already solved or contains a mistake
(lighting the `findMistakes` overlay), by the midend before it asks the game, and
`hint()` SHALL refuse (`{ ok: false, error }`) on an Ambiguous (not uniquely
solvable) board with no forced deduction to teach. The
recorder SHALL be gated so the generator's `runSolver` path is unchanged.

#### Scenario: A hint refuses on a solved board

- **WHEN** a hint is requested on a completed board
- **THEN** the midend refuses it with a non-empty message before calling `hint`

#### Scenario: A placement hint names the forced domino and explains why

- **WHEN** a domino has exactly one remaining spot on the current board
- **THEN** the next hint step's move places that domino and its explanation
  states, in the necessity voice, that it is the only spot left

#### Scenario: The plan solves the board from any mid-game position

- **WHEN** a non-mistaken, non-Ambiguous board is advanced by applying one
  freshly-recomputed hint step at a time
- **THEN** every step makes progress and the board reaches solved
