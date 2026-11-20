## Why

`architectural-review` item 10 (owner accepted every item, 2026-11-20).
Measured at `9faabdf61`: 32 test files read game source through a `?raw`
glob, 24 of them by regex alone (`git ls-files '*.test.ts' | xargs grep -l
'?raw' | xargs grep -L 'from "typescript"'`). `docs/method.md` § "A scan
that keys on a name" names that shape as the fragile one: it misses the
renamed copy and empties without a sound.

Fourth in the owner's order: 8, 1, 6, 10, 7, 11, 9, after the contract
change, which removes the scans a declaration can answer.

## What Changes

- Each remaining regex scan is either replaced by a declaration the engine
  reads, or reads the source's syntax tree, keyed on a reference, a type or
  an id.
- One shared parse of the game sources serves every scan, so the move does
  not multiply test time.
- Each converted scan is planted against once to show it still fails.
- No player-visible change.

## Impact

`src/**/*.test.ts` using `?raw`, the text helpers in
`src/engine/testing/enrollment.ts`, a shared parse helper under
`src/engine/testing/`, `docs/method.md`, `docs/testing.md`.
