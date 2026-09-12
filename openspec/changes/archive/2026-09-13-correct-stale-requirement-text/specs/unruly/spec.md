## MODIFIED Requirements

### Requirement: Unruly game implements the Game interface

The engine SHALL provide a registered `unruly` game implementing
`Game<UnrulyParams, UnrulyState, UnrulyMove, UnrulyUi, UnrulyDrawState>`: the
binary puzzle (Binairo / Tohu-wa-Vohu) on a `w2 × h2` grid in which every cell
is filled black (`one`) or white (`zero`) so that no row or column contains a
run of three equal cells and each row and column holds equally many of each
color; an optional `unique` variant additionally forbids two identical rows or
two identical columns. Params SHALL be `w2`, `h2` (both even and at least 6),
`unique` (boolean), and `diff` (Easy / Normal / Tricky), encoded `{w2}x{h2}`
with an optional `u` for the unique variant and, when `full`, `d{c}` for the
difficulty char. The 7 upstream presets (8×8, 10×10, 14×14 across the offered
difficulties) SHALL be offered. `validateParams` SHALL reject an odd or
below-6 dimension, an unreasonably large `w2·h2`, a `unique`-mode grid too tall
or too long for any valid set of distinct rows (the A177790 bound), and an
unknown difficulty. The game SHALL report `wantsStatusbar = false`,
`isTimed = false`, `canSolve = true`, and `canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w2: 10, h2: 10, unique: false, diff: DIFF_NORMAL }` (the
  Tricky tier) are encoded with `full`
- **THEN** the result encodes the dimensions and difficulty char
- **AND** decoding it round-trips the params
- **AND** decoding a bare `8x8` yields a square grid with `unique` false

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with an odd dimension, a dimension below
  6, or a `unique`-mode grid exceeding the distinct-rows bound
- **THEN** it returns a non-null error string

### Requirement: Unruly generates uniquely solvable boards at the target difficulty

`newDesc` SHALL generate a board by repeatedly building a random valid full grid
(placing a random color in each cell in shuffled order and running the solver
to a fixpoint after each placement, retrying until a counts-valid,
run-valid grid results), then winnowing clues — clearing cells in shuffled order
and keeping each clear iff the deductive solver at the target difficulty still
reaches a counts-valid solution. For any difficulty above Easy it SHALL
reject a board the solver one level easier can already finish (the too-easy
gate), regenerating otherwise. Every generated board SHALL pass `validateDesc`
and be solvable by the deductive solver at its target difficulty.

#### Scenario: Generated boards are valid and solvable

- **WHEN** `newDesc` runs for a seeded RNG across the presets
- **THEN** every desc passes `validateDesc`
- **AND** the deductive solver at the board's difficulty solves it from its
  clues alone to a counts-valid, run-valid state

### Requirement: Unruly solves boards with deductive techniques gated by difficulty

The solver SHALL reach a solution by repeatedly applying, to a fixpoint and
gated by difficulty: at **Easy** (`DIFF_TRIVIAL`), (1) the two cells of an
almost-three filled the same color force the third cell to the opposite color,
and (2) a row or column with one empty cell left for a color fills it; at
**Normal** (`DIFF_EASY`), additionally (3) a row or column already holding its
full count of one color fills the rest with the other, and (in `unique` mode)
(4) a full row/column matched in all but one place by a one-short row/column
forces that place to differ; at **Tricky** (`DIFF_NORMAL`), additionally (5) a
near-complete row/column whose last cell of a color, if placed in certain
cells, would create three-in-a-row, so the color is forced elsewhere.
`solveGame` SHALL return the maximum difficulty whose technique fired (or
"already solved"). `solve` SHALL run the full solver and return the completing
grid as a move, or an error when the board has no solution or a contradiction.

#### Scenario: The impending-three rule forces the third cell

- **WHEN** the solver runs on a row with two adjacent same-color cells and an
  adjacent empty cell that would complete a forbidden run
- **THEN** that empty cell is set to the opposite color

#### Scenario: Solve completes a generated board

- **WHEN** the Solve command runs on a generated board
- **THEN** it returns a move whose grid fills every cell, after which `status`
  returns `"solved"`
