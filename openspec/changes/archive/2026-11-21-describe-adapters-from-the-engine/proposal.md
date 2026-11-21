## Why

`architectural-review-second-pass` item 2 (owner accepted every item,
2026-11-21). Measured at `22ba4e45f`: 47 deduction games write a `dealtOf`
converting their board into the description's givens (723 lines), 23 of
them the same walk (collect the nonzero squares, call `clueList(at, v, n)`);
43 games write a `<game>Ladder` (44 functions, 508 lines), 29 of them only
`return describedLadder(<module>, dealt)`; 17 write a `spaceOf`, 16 memoize
in a `WeakMap`. Every new deduction game writes all of it again.

## What Changes

- A helper beside `clueList` for "the squares where a predicate holds, with
  their values", and the 23 games use it.
- A default ladder: a game that names only its compiled module gets
  `describedLadder` from the engine, and the one-line wrappers go.
- The runtime memoizes a board's givens and space, so games drop their
  `WeakMap`s.
- Then a design call, recorded here: whether a description can declare how
  its givens read from the board, so the adapter is generated. Taken only
  if it removes most of what is left without bending a game.
- No player-visible change: boards and hints stay byte-identical.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None expected; `described-ladder` if the declared form lands.

## Impact

`src/engine/solve/describe-runtime/`, `src/engine/solve/ladder-runtime.ts`,
`src/games/*/solver.ts`, the skeletons, `docs/descriptions.md`.
