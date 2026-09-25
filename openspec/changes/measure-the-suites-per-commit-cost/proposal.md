# measure-the-suites-per-commit-cost

**Status: scaffolded, not started.** Leads carried out of
`fail-fast-the-source-scan-guards` (written 2026-09-22, moved here 2026-09-25)
so that they outlive its archive. The owner flagged a broader test-optimization
session for another day; this is its starting list.

## Why

A gated commit that touches a game costs minutes of vitest, and most of the
leads below say that much of it re-checks things the commit could not have
changed. `fail-fast-the-source-scan-guards` changed only *when* a cheap failure
is reported. This is about what a commit pays at all.

## Leads (unmeasured)

These are leads, not findings. Each needs the idle-machine, memory-aware
measurement `AGENTS.md` § "Test discipline" asks for before it becomes a
proposal.

- **The hook's test selection widens to everything on any game edit.**
  `select-tests-in-the-precommit-hook` made the hook run only the tests a
  commit could affect, but any `src/games/` edit selects every glob-reading
  cross-game guard, and those guards iterate *every* game. Many are
  `describe.each` over the population, and each case depends on one game's
  source plus the engine. When a commit touches no engine file, only the cases
  for the games it touched could change verdict. Narrowing per case (by an
  environment variable the guards read, as `PRECOMMIT_HOOK_RUN` already is) is
  a large, sound saving *if* the soundness condition is stated and tested: no
  engine file changed, and the guard's per-game case reads only that game.
  The hook-scoping license in the `build-pipeline` spec is the template.
- **`builtGames()` is memoized per worker, not per run.** With
  `isolate: false`, every worker that touches an enrollment guard generates
  every game's board once. With the worker pool near its cap, that may be the
  same few seconds of generation paid several times. Worth one measurement: how
  many times per gate run the registry is built.
- **Several guards need only `newUi` and the game object, not a playable
  board.** A cheaper enrollment path (a fixed small preset per game, or the
  `Ui` built without generating) could cut the board-building half of the
  guards substantially. Check which fields they actually read first.
- **The board-building guards are cheap, but nothing marks them as cheap.**
  Measured 2026-09-25 (load ~7, swap nearly full, so an upper bound): nine of
  them (`capability-surface`, `mistake-overlay-coverage`, `contract-surface`,
  `emittable-keys`, `cursor-vocabulary`, `completion-vocabulary`,
  `hint-enrollment`, `help-coverage`, `project-identity`) ran in **8.8 s wall**
  together. They were declined as a second fast pass because no property of the
  file separates them from `hint-quality`, `hint-resume` or
  `difficulty-contract`, which reach the same registry and cost minutes, and a
  roster is a manifest. The lead above (a cheaper enrollment path) might supply
  that property; if it does, the source-scan pass in `scripts/gate.sh` is the
  shape to copy.
- **Cost is concentrated, and known to be.** `retire-tests-that-do-not-earn-
  their-runtime` measured half the suite's time in three games whose hints plan
  by searching, amplified by cross-game guards that recompute a full hint after
  every move. The hint-resume walk is the obvious candidate for a cheaper
  per-commit configuration with the full walk left to CI, under the same
  four-condition license the narration ledger's rot half uses.
- **Say what the instrument measured.** A timing taken with the machine at load
  15 and in swap is an upper bound. Record free memory and swap beside every
  figure, and compare ratios rather than seconds across runs.

## What this is not

Not a weakening of CI. Anything narrowed here narrows a commit's cost, and CI
keeps running everything on every push.
