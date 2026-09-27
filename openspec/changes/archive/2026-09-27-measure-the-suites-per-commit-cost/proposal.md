# measure-the-suites-per-commit-cost

Scaffolded 2026-09-25 from leads carried out of `fail-fast-the-source-scan-guards`;
measured and implemented 2026-09-27.

## Why

A gated commit that touches a game costs minutes of vitest. Measured
2026-09-27 on a Pearl-only change (one comment in `src/games/pearl/hint.ts`), the
hook's selection was **68 test files: 310 s wall, 593 s of test time**. Of that,
**518 s was per-game cases inside cross-game guards**, and only 105 s of it was
Pearl's. The other 413 s re-checked games the commit could not have changed.

File selection cannot see this, and it never will. Any game edit reaches the
registry, and every cross-game guard imports the registry. The cost is inside
the files: `hint-resume` (156 s) and `hint-quality` (152 s) were half of the
run, and every case in both is titled for the game it walks.

## What changes

- **When every staged path lies under `src/games/<id>/`, the hook skips every
  other game's cross-game cases.** The selector prints the touched games
  (`select-tests.mjs --game-scope`), the hook exports them as `GATE_GAME_SCOPE`,
  and `vitest.config.ts` turns that into a name filter that skips each case
  titled `<other-id>: …`. Skipped cases are reported as skipped. CI and
  `npm run gate` never narrow.
- **The assertions that read across a sweep narrow with it.** One variable
  feeds both the filter and `inSweep` / `itOverWholeSweep` in `slow.ts`. A
  ledger compared against the cases' findings is filtered to the games that
  ran, so the touched game's entry is still checked. A floor no subset can meet
  is skipped. Where a touched game could fail a floor on its own, the floor is
  read from the games directly, as `input-parity`'s keypad count now is.
- **`mark-all`'s one test over every game becomes one case per game.** It was
  the file the narrowing could not reach, and the heaviest one left in a
  narrowed run.

## Measured effect

Same 68 files, same Pearl change, minutes apart, both under load (see
`tasks.md`):

| | wall | test time |
|---|---|---|
| before | 310 s | 593 s |
| narrowed | 103 s | 179 s |

The whole suite narrowed to Pearl ran in 280 s wall with every test passing.

## What this is not

Not a weakening of CI. Anything narrowed here narrows a commit's cost, and CI
keeps running everything on every push. A commit that touches any file outside
a game directory is not narrowed at all.
