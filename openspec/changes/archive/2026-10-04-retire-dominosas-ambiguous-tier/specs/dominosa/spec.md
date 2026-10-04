## MODIFIED Requirements

### Requirement: Dominosa game implements the Game interface

The engine SHALL provide a registered `dominosa` game implementing
`Game<DominosaParams, DominosaState, DominosaMove, DominosaUi, DominosaDrawState, DominosaMistake>`:
partition an `(n+1) × (n+2)` grid (or, when `tall` is false, upstream's
`(n+2) × (n+1)`) of numbers (each `0…n`) into 2×1 dominoes so
that the placed dominoes are exactly the `DCOUNT(n) = (n+1)(n+2)/2` distinct
number-pairs `0-0 … n-n`, one of each, with every domino's two numbers matching
the underlying clues. Params SHALL be `n` (maximum face number, default 6),
`diff` (Easy / Normal / Tricky / `Unreasonable`) and `tall`, encoded
`"{n}"`, then `"t"` when `tall`, with a full-form `"d{t|b|h|e}"` difficulty
suffix; an encoding without the `"t"` SHALL decode as the wide board, so every id
written before `tall` existed names the board its desc was laid out for; upstream's `"da"` and its
older bare `"a"`, which ask for a board not checked for a unique solution, SHALL
name no tier, so the default tier stands. The fourth tier is named `Unreasonable` rather than
upstream's `Extreme` because its forcing-chain deduction is a search over a
closure of all placements. All 12 upstream presets SHALL be offered, dealt tall. `validateParams`
SHALL enforce `n ≥ 1`, a valid difficulty, and the upstream overflow bound. The game SHALL provide `solve` and `textFormat` (for `n < 1000`).

#### Scenario: Params round-trip

- **WHEN** params `{ n: 6, diff: DIFF_HARD }` (the Tricky tier) are encoded in full
- **THEN** the result is `"6dh"` and decoding it round-trips the params

#### Scenario: The renamed tier keeps its difficulty character

- **WHEN** params at the fourth tier are encoded in full
- **THEN** the suffix is still `"de"`, so a game ID written before the rename
  names the same board

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given `n = 0`
- **THEN** it returns a non-null error string

#### Scenario: An id from before tall boards loads as the wide board

- **WHEN** a params string without a `t`, such as `"6db"`, is decoded
- **THEN** `tall` is false and the board is `n+2` wide and `n+1` tall
- **AND** encoding the result in full gives back `"6db"`

#### Scenario: The default board is dealt tall

- **WHEN** the default params are encoded in full
- **THEN** the result is `"6tdb"` and the board is 7 wide and 8 tall

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
`hint()` SHALL refuse (`{ ok: false, error }`) on a board that is not uniquely
solvable, with no forced deduction to teach. The
recorder SHALL be gated so the generator's `runSolver` path is unchanged.

#### Scenario: A hint refuses on a solved board

- **WHEN** a hint is requested on a completed board
- **THEN** the midend refuses it with a non-empty message before calling `hint`

#### Scenario: A placement hint names the forced domino and explains why

- **WHEN** a domino has exactly one remaining spot on the current board
- **THEN** the next hint step's move places that domino and its explanation
  states, in the necessity voice, that it is the only spot left

#### Scenario: The plan solves the board from any mid-game position

- **WHEN** a non-mistaken board is advanced by applying one
  freshly-recomputed hint step at a time
- **THEN** every step makes progress and the board reaches solved
