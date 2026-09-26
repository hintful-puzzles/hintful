## MODIFIED Requirements

### Requirement: Towers game implements the Game interface

The engine SHALL provide a registered `towers` game implementing
`Game<TowersParams, TowersState, TowersMove, TowersUi, TowersDrawState,
TowersMistake>`: the puzzle Skyscrapers on a `w × w` grid, in which the player
places a tower of height `1..w` in every cell so that each row and column
contains every height exactly once, and so that each outside clue equals the
number of towers visible from that edge (a taller tower hides every shorter one
behind it). Params SHALL be `w` and `diff` (Easy, Normal, Tricky, or
Unreasonable, held as the values `"easy"`, `"hard"`, `"extreme"` and
`"unreasonable"`), encoded `{w}d{c}` when full (`c` = `e`/`h`/`x`/`u`) and `{w}`
otherwise, with presets at 4×4 Easy, 5×5 Easy/Normal, and 6×6
Easy/Normal/Tricky/Unreasonable. `validateParams` SHALL require `3 ≤ w ≤ 9` and
(when full) a known difficulty. The game SHALL report `wantsStatusbar = false`,
`canSolve = true`, and `canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, diff: "unreasonable" }` are encoded with `full = true`
- **THEN** the result is `6du`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `w < 3` or `w > 9`
- **THEN** it returns a non-null error string
