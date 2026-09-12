## MODIFIED Requirements

### Requirement: Bridges game implements the Game interface

The engine SHALL provide a registered `bridges` game implementing
`Game<BridgesParams, BridgesState, BridgesMove, BridgesUi, BridgesDrawState, BridgesMistake>`:
connect the numbered islands on a `w × h` grid with horizontal and vertical
bridges so that each island carries exactly its number of bridge-ends, at most
`maxb` bridges join any pair of islands, bridges run only between two islands
directly in line and never cross an island or another bridge, and all islands
form a single connected group. Params SHALL be `w`, `h`, `maxb`, `islands`
(percentage island density), `expansion` (percentage), `allowloops` (boolean)
and `difficulty` (Easy / Normal / Tricky). All 9 upstream presets SHALL be offered
(7×7, 10×10, 15×15 × Easy/Normal/Tricky, each `maxb = 2`, `islands = 30`,
`expansion = 10`, `allowloops = true`). The game SHALL report `canSolve = true`
and `canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 15, h: 15, maxb: 2, islands: 30, expansion: 10, allowloops: true, difficulty: 2 }`
  are encoded in full and decoded
- **THEN** the decoded params equal the original

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a grid smaller than the minimum island count
  can occupy (e.g. `3×3` at the default density)
- **THEN** it returns a non-null error string

### Requirement: Bridges ports the graded multi-stage solver faithfully

The port SHALL implement upstream `solve_sub` and its stages with the exact
deductive power of each difficulty, returning the impossible / ambiguous /
solved verdict identical to the C solver on every board. Easy SHALL run stage 1
(force bridges an island must place because its remaining count equals its
available adjacent space, and forbid bridges into a satisfied island). Normal
SHALL additionally run stage 2 (per-direction minimum/maximum reasoning using
each neighbor's own remaining capacity). Tricky SHALL additionally run stage 3
(the dsf connected-subgroup deductions — forbid a bridge that would seal off a
subgroup that cannot then be satisfied, and, when `allowloops` is false, forbid a
bridge that would complete a premature loop). The solver is purely deductive
(no guess-and-verify recursion — upstream `solve_sub`'s `depth` is unused). The
solver SHALL maintain the per-cell possible/maximum-bridge counts
(`map_update_possibles`) as deductions are applied.

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from the clue-only state
- **THEN** the solver returns solved at `d`, and a Normal/Tricky board is not fully
  solved at the tier below it
