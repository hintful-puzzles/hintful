## Why

`npm run compare-cost`, `deal-compare` and `deal-profile` run the engine
under vitest, whose module runner reads every import through a getter on
the exporting module (Vite's SSR transform). A bundle, which is what the
app runs, binds an import directly. A described game's compiled techniques
call the runtime through the `describe-runtime.ts` barrel, two getters a
call, and the hand-written code they replaced calls little through one.

`cut-the-born-deal-cost` measured what that does to a comparison
(its design.md § "The instrument: what vitest adds to a born game",
2026-11-23): profiled under vitest, 24% of Light Up's 12x16 deal was in
those getters, at lines that are comments in the source; and Light Up's
12x16 Normal deal read 3.2 times its hand-written one in `deal-compare`
against 1.5 times as rolldown bundles of both trees. So every born-against-
hand-written figure the method has taken overstates the born side, and
the judging criteria (`docs/descriptions.md` § "Judging a family moved
onto its description") read them as a player's cost.

Vitest cannot simply run without its module runner: Node's type stripping
fails on the engine's parameter properties and on `import.meta.glob`.

## What Changes

- `compare-cost` counts its worker's runs on a bundle of each tree, made by
  Vite with the app's own resolution (`import.meta.glob`, the describe
  plugin) and DEV off, run by Node under `/usr/bin/time -l`, so a count is
  of the code a player's device runs. The JIT note and `--predictable`
  carry over.
- `deal-compare` and `deal-profile` take their figures the same way, or
  say in their headers what vitest adds and that their ratios are not a
  player's.
- The born families' figures recorded in the archives are re-counted once,
  and `docs/method.md` § "Compare a cost in instructions, not in time"
  says what a count is of.

## Capabilities

### Modified Capabilities

- `build-pipeline`: a cost comparison counts the engine as the app runs it.

## Impact

`scripts/compare-cost.ts`, `scripts/checks/cost-walk.test.ts` (which
becomes a bundle entry), `scripts/checks/deal-compare.test.ts`,
`scripts/checks/deal-profile.test.ts`, `docs/method.md`,
`docs/descriptions.md`. Nothing a player sees.
