## Why

The born-game changes compare a hint walk's and a deal's cost before and
after a flip in process CPU time, and on this machine CPU time moves with
load: the baseline differed from itself by up to 20%
(`archive/2026-11-23-born-plain-cell-family/design.md` § "The figures
(3.1)"), so a smaller regression cannot be seen. Measured 2026-11-23 on this
machine (Apple M3, four performance and four efficiency cores), one fixed
loop run by `node`, quiet and then beside ten busy processes:

| | Quiet | Loaded | Change |
|---|---|---|---|
| CPU time (user) | 0.35 s | 0.44 s | +27% |
| Cycles | 1.40 G | 1.55 G | +10% |
| Instructions retired | 9.426 G | 9.438 G | +0.1% |

Instructions retired, which macOS's `/usr/bin/time -l` reports with no
setup, varied by 0.06% between runs of one condition. A count of the
instructions a piece of work runs is the work; CPU time is the work at the
speed of whichever core it got and the caches it shared.

The same review found a figure no one checked: Boats' hint walk took 894
steps at the baseline and 1,460 born, given a reason ("a firing that settles
several squares is one step") that would make it fewer. More steps means
each hint does less, which a player sees.

## What Changes

- **A cost comparison between two trees is counted in instructions
  retired**: one command walks and deals the same boards in a baseline tree
  and the working tree and reports, per game, the instructions each took,
  the difference, and the steps each walk took.
- **The engine's own counts beside it**: steps, and the technique firings
  a walk tried, which are exact and say why an instruction count moved.
- **CPU time stays for a figure in milliseconds**, such as whether a deal
  is under the 100 ms a player does not notice, taken as the least of
  several runs, as `scripts/checks/cpu-unit.ts` does.
- **The plain-cell family's figures re-measured** with it, and Boats' step
  count explained or its hint fixed.
- **`docs/method.md` says how a cost is compared**, so a later change uses
  the count, not CPU time.
- **New criteria for judging a family moved onto its description**,
  replacing "each game needs fewer new capabilities than the one before",
  which failed in both pilots and was set aside by the owner each time.
  The implementer recommends them, written where the next family's change
  reads them, with this change's figures as their first use. The owner
  accepts whatever is recommended, provided it judges better than the
  current test (the owner, 2026-11-23); no answer is waited on.

Not in this change:

- The gate's test-cost budget stays in CPU time scaled by `cpu-unit.ts`.
  It runs on CI's Linux runners, virtual machines that are not known to
  expose the hardware counters an instruction count reads; that was not
  checked here, and moving the budget would be a change of its own.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `build-pipeline`: an on-demand command that compares two trees' cost in
  instructions retired, beside the metrics harness, and outside the gate.

## Impact

`scripts/` (the comparison command, and the scratch walk it reuses from the
born-family figures if one survives), `package.json` (its script),
`docs/method.md`, the engine's hint walk if a firing counter is not already
exposed (`src/engine/hint/`), and Boats (`src/games/boats/`,
`src/engine/fill/hint.ts`) if its step count is a defect.
