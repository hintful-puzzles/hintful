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
unknown difficulty. The game SHALL provide `solve` and `textFormat`, and SHALL NOT provide `statusbarText`.

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
