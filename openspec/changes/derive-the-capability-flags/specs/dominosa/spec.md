## MODIFIED Requirements

### Requirement: Dominosa game implements the Game interface

The engine SHALL provide a registered `dominosa` game implementing
`Game<DominosaParams, DominosaState, DominosaMove, DominosaUi, DominosaDrawState, DominosaMistake>`:
partition an `(n+1) × (n+2)` grid (or, when `tall` is false, upstream's
`(n+2) × (n+1)`) of numbers (each `0…n`) into 2×1 dominoes so
that the placed dominoes are exactly the `DCOUNT(n) = (n+1)(n+2)/2` distinct
number-pairs `0-0 … n-n`, one of each, with every domino's two numbers matching
the underlying clues. Params SHALL be `n` (maximum face number, default 6),
`diff` (Easy / Normal / Tricky / `Unreasonable` / Ambiguous) and `tall`, encoded
`"{n}"`, then `"t"` when `tall`, with a full-form `"d{t|b|h|e|a}"` difficulty
suffix; an encoding without the `"t"` SHALL decode as the wide board, so every id
written before `tall` existed names the board its desc was laid out for; a legacy bare `"a"` suffix SHALL
decode to Ambiguous. The fourth tier is named `Unreasonable` rather than
upstream's `Extreme` because its forcing-chain deduction is a search over a
closure of all placements, and it is the last tier that is a difficulty —
`Ambiguous` follows it in the list but relaxes the puzzle's promise rather than
deepening its ladder. All 12 upstream presets SHALL be offered, dealt tall. `validateParams`
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
