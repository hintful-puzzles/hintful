# enforce-test-time-budgets

Filed 2026-10-27 on the owner's word: "enforce limiting test times, both in
CI and locally. I feel we are over-testing, and it's really slowing our dev
cadence."

## Why

Nothing holds the suite's cost down, so it grows with every game, preset and
guard until a session notices: the Gate reached 35 to 60 minutes before
`spread-the-long-hint-walks` brought it to 21 (run 40540239012, 66.5 minutes
of test time over four workers). Locally the cost is the cadence itself: in
that session a commit that touched the engine and `vitest.config.ts` spent
about six minutes in vitest and the push hook fourteen (838 s wall, 1433 s of
test time), on a box that runs two workers. `docs/testing.md` § "Right-sizing
the gate" says a test earns its runtime, but no check asks, so the rule binds
only a session that happens to read it.

## What Changes

- **A cost budget the gate enforces**, for each test file (a spread file's
  share counting as one) and for the suite as a whole, read off the run that
  just happened. A file over its budget fails the gate with the file, its cost
  and the guide's treatments for it, in CI and in the local hooks alike.
- **Cost is measured as CPU time, never wall time**, so a busy machine cannot
  fail a good commit: the `testing` spec's promise that a test never fails
  under contention stays, and the budget is a check on work, not on the clock.
  **BREAKING (process):** "an otherwise-good commit SHALL NOT be rejected
  merely because work took long" gains its one exception, the budget.
- **Budgets for the hooks**, sized for the developer's cadence: a commit's
  plan and a push's plan each have a ceiling on the CPU time their selected
  files cost, so a commit that would select more than that is told so before
  the run, with the files that cost it.
- **A pass that brings the suite under the budgets**, heaviest first, using the
  three treatments `docs/testing.md` names (run a search once and write the
  board down, turn a seed count down, defer to the slow tier) and retirement
  where a test catches nothing a cheaper one does not. The hint walks are 31 of
  CI's 66.5 minutes and come first.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `build-pipeline`: the gate enforces a cost budget per file and per run,
  and the hooks a ceiling per plan.
- `testing`: the single-timeout requirement names the budget as the one
  check on how much work a test does, judged on CPU time.

## Impact

- `vitest.config.ts` (a reporter or setup hook that records each file's CPU
  time), `scripts/gate.sh` and the hooks (the check, and the plan ceiling),
  `scripts/checks/select-tests.ts` (a plan's predicted cost).
- The heaviest test files, trimmed or retired: `hint-resume.test.ts`,
  `hint-quality.test.ts`, `warm-repaint.test.ts`,
  `difficulty-contract.test.ts`, `twiddle-hint.test.ts`, `hint-ink.test.ts`,
  `hint-mark.test.ts` lead the CI run.
- `docs/testing.md` § "Right-sizing the gate" and § "What runs when".
