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

**D1. Cost is CPU time per file, measured in the worker.** A setup file
takes `process.cpuUsage()` when it loads and in its `afterAll`; a worker runs
one file at a time, so the difference is that file's work whatever else the
machine runs. Wall time is rejected: it measures the box (docs/testing.md §
"Timing anything under vitest": contention inflates wall several-fold and
unevenly).

*As built (2026-10-27).* The setup file appends each file's cost to a log the
gate names (`TEST_COST_RUN`), and no reporter is used: a `reporters` entry in
the config replaces vitest's defaults, the `github-actions` annotations in CI
and the agent reporter locally. Under `isolate: false` a file's own CPU time
depended on its worker's history (hint-ink cost 33 s after hint-mark and 75 s
before it, because `dealt`'s cache handed it boards hint-mark had paid for),
so `dealt` times each deal and a file is charged for every board it used that
an earlier file dealt: the two orders then came within 10%. What remains is
the worker's first file paying for the module graph, about 20 s. CPU time
held to 2% across a plain and a niced run at load 6 to 8 on the M3, and rose
about 20% with three suites oversubscribing it.

**D2. Budgets are in units of one calibration workload, so one table serves
CI and the developer's box.** CPU seconds differ by machine. The gate times a
fixed, deterministic workload once per run (a generator and a hint plan, a
few seconds' CPU), and a budget is a multiple of it. The implementing session
measures the workload's ratio on CI and locally before choosing it; if the
ratio is stable within 20% across runs, raw CPU seconds with one table per
role is the simpler alternative and wins.

*Measured (2026-10-27).* Between machines, neither held: a fixed workload
(a sliding-puzzle search and a Latin fill) took 1.46 s on CI and 1.10 to
1.20 s on the M3, a ratio of 1.3, where the suite's unchanged files ran 1.5
to 2.3 times slower on CI, since CI's four workers share two cores'
hyperthreads and a lone workload does not see that. Raw CI seconds were
tried first, and the next Gate run (40568467469) failed on a runner 1.6 to
1.8 times slower, in CPU and wall alike, for files neither run changed. So
the workload is timed in every run and the costs are scaled to the runner of
Gate run 40553996591 (reference seconds): what it corrects is runner against
runner, which is the variance that fails a good tree. A laptop reads low
after scaling, so CI is the stricter judge. One tree on two runners (Gate
runs 40572795933 and 40574611255, units 1.470 and 2.238 s) then read 36.0
and 43.3 scaled minutes: the scaling takes out most of the runner and leaves
a fifth (1.16 to 1.36 by file), what slows memory-heavy work that a lone
workload does not feel. So a cost over budget is named, and fails only past
1.25 times the budget; a threshold the tree sits just under would fail it on
whichever runner it drew.

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

*As built (2026-10-27): the hook defers rather than refuses.* Some plans
cannot be split: a commit staging `vitest.config.ts` selects every file
outside the games, and a push carrying an engine change the whole suite, and
nothing but `--no-verify` would get them past a refusal. So
`test-cost.ts fit` keeps the cheapest files that fit the ceiling, and the
staged test files and any file no run has recorded whatever they cost; a
commit writes what it left out to `node_modules/.cache/test-cost/deferred`,
which makes the push run its whole plan, and a push names what it leaves to
CI. Narrowed files are priced by game: the setup file charges each case
titled `<id>: …` to that game, so a plan narrowed to some games costs their
cases and the file's untitled ones. The trade the owner may revisit: a push
over its ceiling deploys before CI has run what it left.

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

*As built (2026-10-27).* Six of the seven places CI did more than the hooks
were the heaviest files' costs: `perCommit(hook, wide)` gave CI four boards a
tier in `difficulty-contract`, two in `hint-ink` and `hint-mark`, three
seeds and an unbounded plan walk in `hint-quality`, 512 recomputes in
`hint-resume`, and through `gatePresets` each game's largest board. Under the
owner's word above, that extra is the slow tier's, so `perCommit` is retired
and the hooks and CI walk the same boards: the same decision taken once in
the engine rather than seven times. `hint-quality`'s three seeds and its
"corner" board existed to let a walk decide that a narration listing was no
longer spoken, a negative over a sample; every listing now pins a board that
speaks it, so the rot half is decided on an input and the walk takes one
board. `hint-resume`'s three single-plan blocks computed the same plan three
times, and are one block.

A second round, from per-game costs the setup file now records: a quarter of
the suite's CPU was dealing boards (8.6 of 32.6 local minutes), most of it
`dealsPromptly` re-dealing a board too rare to wait on in every file and
share that asked, which it now remembers; `hint-quality`'s length walk took
every leaf preset where the slice reaches every mode; the repaint walk asked
a searching hint afresh at every step, where a player pressing Hint again
follows the plan; and `warm-repaint`, one case per game, is spread over
shares like the hint walks. Locally the suite at CI scale went from 31.1 to
26.3 CPU-minutes, dealing from 8.6 to 3.7. Each kept guard was seen to fail
on a planted defect after the cut: a `hint()` that mutates (Flip) in the
merged block, the narration limit raised past every listing in the pinned
check, and Solo's Killer hint capped at `DIFF_KSINGLE` in the walk to solved.

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
