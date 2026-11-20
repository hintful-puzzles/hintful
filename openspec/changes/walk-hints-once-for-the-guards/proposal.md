## Why

`architectural-review` item 5 (owner's go-ahead for the obvious items,
2026-11-20). Measured at `9faabdf61`:
- At least 8 of the 19 `src/engine/hint-*.test.ts` guards write the same walk
  by hand: for each game in `HINT_GAMES`, each board in `gatePresets`, a new
  `Midend`, then `hint()` up to that file's own limit. `hint-ink` and
  `hint-mark` are near line-for-line copies, and `solve-finishes.test.ts`
  walks the same way through `registeredGameIds()`.
- Cross-game tests find their games seven ways (`enrollment.ts`,
  `hint-games.ts`, `registeredGameIds()` direct, the catalog, a `?raw` glob,
  `readdirSync`, a literal list). Of the 28 files calling the registry
  directly, none goes through enrollment.
- Per-game tests repeat cross-game guards: 26 games loop `hint()` to solved,
  40 save and load through a `Midend`, 24 round-trip params.

A new hint guard is a new walk, and a walk's population can drift from
enrollment.

## What Changes

- A shared walk in `src/engine/testing/hint-games.ts` (or beside it): every
  hinted game, every gate preset, calling a per-step visitor, with the
  walk's limit and dealt boards as parameters. The hand-written walks become
  visitors, each keeping its own limits.
- Cross-game guards that read `registeredGameIds()` directly go through
  `enrollment.ts` where the population is "every game", so there is one place
  where enrollment is decided. A guard that needs another population says why.
- Per-game tests that only repeat a cross-game guard's case for that game
  are removed, each after checking that the guard covers that game's case at
  the same strength (`docs/test-strength.md`). A per-game test that pins
  something the guard does not is kept.
- Tests only; no player-visible change.

## Impact

`src/engine/testing/hint-games.ts`, `src/engine/testing/enrollment.ts`,
`src/engine/hint-*.test.ts`, `src/engine/solve-finishes.test.ts`, the 28
direct-registry guards, per-game `<id>.test.ts` and `<id>-hint.test.ts`,
the skeletons' test files, `docs/testing.md` § "How a cross-game guard finds
its population".
