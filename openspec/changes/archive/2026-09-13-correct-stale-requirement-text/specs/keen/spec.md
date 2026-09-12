## MODIFIED Requirements

### Requirement: Keen game implements the Game interface

The engine SHALL provide a registered `keen` game implementing
`Game<KeenParams, KeenState, KeenMove, KeenUi, KeenDrawState, KeenMistake>`: a
Latin-square puzzle ("KenKen" / "Inshi No Heya") on a `w × w` grid in which the
player places a digit `1..w` in every cell so each row and column contains every
digit exactly once, subject to **arithmetic cage clues** — the grid is
partitioned into contiguous blocks, each labeled with a target value and an
operation (`+`, `−`, `×`, `÷`) that the block's digits must satisfy, where
subtraction and division cages always have area 2. Params SHALL be `w`, `diff`
(Easy, Normal, Tricky, Hard, or Unreasonable — held as upstream's keys
`"easy"`, `"normal"`, `"hard"`, `"extreme"`, `"unreasonable"`, so the Tricky
tier is `"hard"`), and `multiplicationOnly`,
encoded `{w}` without `full` and `{w}d{c}{m?}` with `full` (`c` =
`e`/`n`/`h`/`x`/`u`; a trailing `m` for multiplication-only), with the upstream
preset list. `validateParams` SHALL require `3 ≤ w ≤ 9` and a known difficulty.
The game SHALL report `wantsStatusbar = false`, `isTimed = false`,
`canSolve = true`, `canFormatAsText = false`, and `canMarkAll = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, diff: "hard", multiplicationOnly: false }` (the Tricky
  tier) are encoded with `full = true`
- **THEN** the result is `6dh`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`
- **AND** a multiplication-only puzzle's full encoding ends with `m`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `w < 3`, `w > 9`, or an unknown
  difficulty
- **THEN** it returns a non-null error string

### Requirement: Keen solves cages with the shared Latin-square framework

The solver SHALL ride on the shared generic `latin_solver` framework, supplying
Keen's cage deductions as user-solvers and a validator. The cage deductions SHALL
enumerate, for each cage, the digit layouts consistent with the current candidate
cube and the cage's operation/value (subtraction and division cages by their two
ordered digit pairs; addition and multiplication cages by combination
enumeration), and prune the candidate cube accordingly — at Easy by amalgamating
all values, at Normal by per-square value bitmaps, and at Tricky by the cross-cage
"a digit required in this row/column" intersection. The validator SHALL accept a
completed grid only when every cage's digits satisfy its clue. `solveKeen(w,
clues, soln, maxdiff)` SHALL map Easy→simple, Tricky→set, Hard→set+forcing, and
Unreasonable→recursion, and return the difficulty reached or an
impossible/ambiguous/unfinished sentinel.

#### Scenario: Solver grades a known board

- **WHEN** `solveKeen` is run on a generated board at its difficulty
- **THEN** it returns that difficulty and fills the grid with the unique solution

#### Scenario: Solver detects an inconsistent board

- **WHEN** `solveKeen` is run on a board with no solution
- **THEN** it returns the impossible sentinel
