## MODIFIED Requirements

### Requirement: Undead game implements the Game interface

The engine SHALL provide a registered `undead` game implementing
`Game<UndeadParams, UndeadState, UndeadMove, UndeadUi, UndeadDrawState,
UndeadMistake>`: a grid in which every cell is either a fixed diagonal mirror
(`\` or `/`) or a monster cell, and the player places one of three monsters —
Ghost, Vampire, or Zombie — in every monster cell. Params SHALL be `w`, `h`, and
`diff` (Easy, Normal, or `Unreasonable`, held as the values `"easy"`, `"normal"`
and `"tricky"`), encoded `{w}x{h}` without `full` and `{w}x{h}d{c}` with `full`
(`c` = `e`/`n`/`t`), with the upstream preset list. The top tier is named
`Unreasonable` rather than upstream's `Tricky` because its boards can require
the forcing rung, which runs the deduction fixpoint from a hypothesis; its
difficulty character stays `t`, so an existing game ID names the same board.
`validateParams` SHALL require `w ≥ 3`, `h ≥ 3`, `w·h ≤ 54`, and a known
difficulty. The game SHALL report `wantsStatusbar = false`, `canSolve = true`, `canFormatAsText = true`, and `canMarkAll = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, diff: "tricky" }` (the `Unreasonable` tier) are
  encoded with `full = true`
- **THEN** the result is `5x5dt`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `5x5`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `w < 3`, `h < 3`, `w·h > 54`, or an
  unknown difficulty
- **THEN** it returns a non-null error string
