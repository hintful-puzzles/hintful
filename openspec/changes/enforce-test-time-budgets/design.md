# Design — enforce-test-time-budgets

## Context

Measured 2026-10-27, Gate run 40540239012, the first after
`spread-the-long-hint-walks`: 20.7 minutes green, 66.5 minutes of test time
over four workers. The hint walks' eight shares are 31 of those minutes, the
largest share 5.25. Then `warm-repaint` 3.0, `difficulty-contract` 2.5,
`twiddle-hint` 2.2, `hint-ink` 2.1, `hint-mark` 2.0, `hint-gesture` 1.5,
`position-status` 1.4. Re-read a current run before relying on these
(`gh run view <id> --log`, each file's `(N tests) Xms` line).

Locally, in the same session, on a box that gives vitest two workers: a
commit staging `vitest.config.ts` and engine test files ran every test file
outside the games, 231 s and 108 s across the two passes; the push hook ran
838 s wall, 1433 s of test time.

## Goals / Non-Goals

**Goals:** the suite's cost is held by a check, not by a session's memory; a
commit's and a push's waits are bounded; the suite is brought under the
budgets now, heaviest first.

**Non-Goals:** a test that fails under contention (the `testing` spec's
determinism requirement stands); per-test timeouts (still one backstop).

## Decisions

**D1. Cost is CPU time per file, measured in the worker.** A setup file's
`beforeAll` and `afterAll` take `process.cpuUsage()` around each file; a
worker runs one file at a time, so the difference is that file's work
whatever else the machine runs. A reporter collects them per file (a share
counting as one) and the gate's step judges them after `vitest run`. Wall time
is rejected: it measures the box (docs/testing.md § "Timing anything under
vitest": contention inflates wall several-fold and unevenly).

**D2. Budgets are in units of one calibration workload, so one table serves
CI and the developer's box.** CPU seconds differ by machine. The gate times a
fixed, deterministic workload once per run (a generator and a hint plan, a
few seconds' CPU), and a budget is a multiple of it. The implementing session
measures the workload's ratio on CI and locally before choosing it; if the
ratio is stable within 20% across runs, raw CPU seconds with one table per
role is the simpler alternative and wins.

**D3. Starting budgets, chosen to force the cut the owner asked for.** At CI
scale: no file or share over 2 minutes of CPU, and the suite over 40 (about
11 minutes on CI's four workers); the commit hook's plan at most 90 seconds,
the push hook's at most 5 minutes. Today's suite is over every one, which is
the point: section 2 of the tasks brings it under, and the check lands with
the cut so it never lands red. The owner can set different numbers; they live
in one table beside the check.

**D4. A hook's plan is predicted from the last recorded costs.** Each run
writes the per-file costs to a gitignored file under `node_modules/.cache`;
`select-tests.ts` sums the plan's files from it and the hook refuses an
over-ceiling plan before any test runs, naming the files. With no record yet,
the plan runs and records. A refused commit is split, or its expensive file
taken to the push, never bypassed.

**D5. The cut, by the guide's treatments in order of how little they lose.**
The owner (2026-10-27): a heavy test that is useful for development work may
stay in the codebase, as long as it is in no default suite, neither the hooks
nor CI. So "defer" is a full option for a test kept for dev use (the slow
tier, run by path), not only for one whose cost is board size, and the
budgets bind only what the default suites run.
For each file over budget, heaviest first: write down a board a search finds
(describeHintPins); turn a seed or board count down where the property is
systematic; defer to the slow tier where the cost is board size; retire where
the test catches nothing a cheaper one does not, by measurement
(docs/testing.md § "Right-sizing the gate"). The hint walks first: what each
of their blocks catches that a game's own hint test does not is the
question, per block, with a planted defect for each kept one.

## Risks / Trade-offs

- **A budget can be met by deleting coverage that mattered.** Each cut states
  what still covers the configuration, at the site, and a kept guard is seen
  to fail on its planted defect after the cut.
- **CPU time is not perfectly stable** (paging inflates `sys`): the budget
  sits with slack over the measured cost, and a file within 10% of its budget
  is reported, not failed.
- **A ceiling on the commit hook could push sessions to batch commits.** The
  hook names the files and their costs, so the fix (a narrower commit, or the
  expensive file left to the push) is in the message.
