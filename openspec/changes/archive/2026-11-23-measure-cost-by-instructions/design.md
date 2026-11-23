## Context

The motivation and the measurement behind it are in proposal.md § "Why".

What exists, read 2026-11-23:

- **The born-family figures** were taken by scratch walks that are not in
  the tree: four boards a menu board of at most 100 cells, each walked by
  `hint.plan` and `executeMove` to the end, timed in process CPU time over
  interleaved rounds (`archive/2026-11-23-born-plain-cell-family/design.md`
  § "The figures (3.1)"). Each change rebuilt that harness.
- **`scripts/checks/cpu-unit.ts`** scales the gate's test costs by a fixed
  workload's least-of-three CPU time. It corrects for which runner a run got,
  not for load, and `docs/testing.md` records that heavy oversubscription
  still raises a cost by about a fifth. The measurement in the proposal, +27%,
  agrees.
- **`testing` § "Efficiency is asserted by a proxy, never by elapsed time"**
  already rules that a test asserts a deterministic count. This change gives
  the A/B figure the same footing.
- **A scratch script runs as a temporary vitest file**, since node's type
  stripping fails on the engine. Vitest's default pool forks a worker per
  file, a child of the process `/usr/bin/time` starts.

## Goals / Non-Goals

**Goals:**

- A figure for "did this change make the walk or the deal dearer" that a
  loaded machine does not move.
- One command for it, so the next family's change does not rebuild a
  harness.
- The plain-cell family's figures re-taken, and Boats' step count settled.
- Criteria for judging a family moved onto its description, recommended
  and written down (proposal.md § "What Changes").

**Non-Goals:**

- A gate on the figure. It is a report a change records, as the metrics
  harness is.
- The gate's test-cost budget (proposal.md § "What Changes").
- Linux. The command reads macOS's counter; on another system it says so
  and stops (the spec's "A machine without the counter").

## Decisions

### 1. The count is macOS's, read per process

`/usr/bin/time -l` prints the "instructions retired" and "cycles elapsed"
the kernel keeps per process (`proc_pid_rusage`), with no privileges. The
alternatives:

- **The hardware counters directly** (`kpc`, Instruments): they need root
  or a GUI, and give nothing a process count does not for a run of whole
  boards.
- **CPU time with more rounds or least-of-N**: the least of N removes the
  rounds that were slowed, but on a machine that is always busy every round
  may be, and a run moved to an efficiency core is slowed throughout. Kept
  only for a figure in milliseconds.
- **The engine's counts alone**: exact, but blind to a constant factor,
  such as a slower inner loop doing the same firings. Reported beside the
  count (decision 4), not instead of it.

**What must be verified first (task 1.1)**: whether a forked vitest
worker's instructions reach the count `/usr/bin/time` reports for its
parent. If not, the walk runs where the counted process does it: vitest's
`threads` pool with one worker, or the walk loaded without vitest if the
engine can be.

**Verified (1.1), 2026-11-23.** A loop of 2×10⁸ steps counted 3.41 G and
3.45 G instructions alone under `node`. Run as a vitest test once, then
twice, its count rose in vitest's default `forks` pool by nothing: 4.488,
4.455, 4.454 G for none, one and two loops, so a forked worker's
instructions are not in the parent's count. In the `threads` pool it rose
by 3.44 to 3.55 G a loop over three rounds (5.28–5.44 G with none, 8.76–8.91 G
with one, 12.30–12.46 G with two). The command runs its worker in the
`threads` pool, one worker. Plain `node` cannot load the engine, whose
parameter properties type stripping refuses, and a bundle would need each
tree's own Vite plugins.

`/usr/bin/time` counts only the process it starts: wrapped round
`timeout`, it counted `timeout`'s 19 M and none of the node under it.

### 2. A run's own work, net of start-up

The process count includes Node, vitest and the engine's loading. Each
game is run twice in a tree, once over its boards and once over none with
the same imports, and the figure is the difference. The none run is taken
each round, beside the boards' run, so the two share a round's conditions.

### 3. The spread is reported, not assumed

The JIT compiles on helper threads, and their work is in the count. Each
game runs several rounds a tree, interleaved between trees, and the line
reports the spread of one tree's rounds beside the difference between
trees. A difference inside the spread is reported as none. Task 1.2 tries
V8's `--predictable` and `--single-threaded` against the default and keeps
whichever gives the narrowest spread without changing which tree is
cheaper.

**Measured (1.2), 2026-11-23.** Tents' walk of its 16 boards at HEAD, net
of the run that only loads Tents, eight rounds of each setting, then the
same beside ten busy `node` loops started here and killed by PID. Spread is
the largest round less the smallest:

| Setting | Quiet: net walk | Spread | Loaded: net walk | Spread |
|---|---|---|---|---|
| default | 1.700–1.879 G | 10% | 1.801–2.126 G | 17% |
| `--predictable` | 1.894–1.934 G | 2.1% | 1.873–1.981 G | 5.7% |
| `--single-threaded` | 1.898–1.956 G | 3.0% | 1.841–2.018 G | 9.2% |

`--predictable` is kept: its loaded median, 1.934 G, is 0.020 G above its
quiet one, 1.914 G, inside the quiet spread of 0.040 G. The run that only
loads the game was steadier than the walk throughout (3.68–3.77 G under
`--predictable`), so the spread is the work's, the JIT's helper threads
compiling a different amount each run.

CPU time did not restate the proposal's +27% here: the walk runs' user time
had a median of 3.47 s quiet and 3.44 s loaded, so these ten loops did not
load this machine as the proposal's did. What it did show is CPU time's
own spread, 2.55 to 3.90 s across the eight quiet default rounds, against
the instructions' 10% in the same rounds.

### 4. The engine's counts beside it

Steps, which the walk already sees, and the technique firings the walk
tried. Task 2.2 finds whether the hint already counts firings tried; if
not, the count goes where the described firing hint tries a technique, as a
counter a test reads (`testing` § "Efficiency is asserted by a proxy").

**Found (2.2), 2026-11-23.** The ladder driver tallied the firings it
*took* (`FiringTally`), for the step budget's blame, and counted nothing it
tried. `techniqueTries` in `deduction-fixpoint.ts` now counts each time a
ladder asks a technique for its firings, in both the fixpoint and the
continuing walk. It is a process-wide count, read before and after a walk,
because a cost comparison reads a whole process; `engine/fill/hint.test.ts`
pins it on Kakurasu's hand-drawn board (10 steps, 113 tries). A hint that
runs its own loop past the ladder counts nothing here, and a tree from
before the counter reads "–".

### 5. The baseline is a checkout the command is given

The command takes the baseline as a directory holding a checkout of the
commit, made with `git worktree add` under the session's scratchpad, as the
tier-walk report's baseline is. The worktree reads the main tree's
`node_modules` through a link when `package-lock.json` is the same in both,
and the command refuses a baseline whose lockfile differs, since its
dependencies would then not be its own.

### 6. The boards

Dealt once, at the baseline, as game IDs, and written to a list the
command reads in both trees: four on each menu board of at most 100 cells,
with every board of a game whose params give its size as one number (Star
Battle) read by its area. A board one tree refuses is named and left out of
both (the spec's "A comparison reads the boards from one list").

### The command checked (2.1, 2.3), 2026-11-23

HEAD's worktree against the working tree, which differed only by the
counter, five rounds: every difference none.

| Game | Boards | Walk, G | Deal, G | Steps |
|---|---|---|---|---|
| Tents | 16 | 1.896 / 1.914 ±0.041 | 0.965 / 0.994 ±0.027 | 484 / 484 |
| Boats | 48 | 5.742 / 5.752 ±0.032 | 30.385 / 30.456 ±0.131 | 904 / 904 |

A plant in the fill hint's per-firing callback, 2,000 calls to
`linkedCell`, then Tents against HEAD again: walk 1.901 / 2.458 G ±0.021,
+29.3%; deal none; steps 484 / 484. Cycles called the same walk "none"
(0.597 / 0.713 ±0.417 G), which is why a cost is read from instructions.
The plant removed, `git diff` of `fill/hint.ts` was empty. The counter's
test, with the continuing walk's increment dropped, read 13 tries for 113.

### The born games re-measured (3.1, 3.2), 2026-11-23

`npm run compare-cost`, five rounds, the working tree (`6aef4c447` and
this change) against a worktree of each archive's baseline. The boards
were dealt at the baseline, four on each menu board of at most 100
squares; no board was refused by either tree. Median instructions net of
start-up, baseline / born, in G; "none" is inside the larger spread.
Steps are the whole walk's, every step of every plan played.

Against `75691d811` (`born-plain-cell-family`), with the archive's CPU-time
change beside the walk's:

| Game | Boards | Walk | Change | Archive | Deal | Change | Steps |
|---|---|---|---|---|---|---|---|
| Range | 16 | 1.407 / 1.655 | +17.6% | +40% | 5.112 / 4.842 | −5.3% | 655 / 635 |
| Star Battle | 68 | 10.300 / 13.057 | +26.8% | +12% | 320.3 / 290.3 | −9.3% | 2,666 / 2,656 |
| Clusters | 40 | 2.194 / 2.461 | +12.2% | −14% | 10.42 / 16.69 | +60.1% | 1,706 / 1,706 |
| Light Up | 24 | 1.156 / 1.545 | +33.7% | +4% | 6.95 / 25.68 | +270% | 373 / 373 |
| Sticks | 24 | 3.711 / 4.647 | +25.2% | +25% | 65.7 / 103.7 | +57.7% | 843 / 843 |
| Bricks | 16 | 1.465 / 1.179 | −19.5% | +28% | 6.98 / 6.75 | none | 617 / 616 |
| Pattern | 8 | 0.857 / 2.206 | +157% | +45% | 2.79 / 3.28 | +17.8% | 429 / 423 |
| Singles | 32 | 2.062 / 2.128 | none | −2% | 9.77 / 5.12 | −47.6% | 1,161 / 1,027 |
| Boats | 48 | 6.082 / 5.857 | −3.7% | −5% | 11.76 / 30.49 | +159% | 1,519 / 924 |

Against `1057f5dc4` (`born-unruly-norinori-and-mosaic`):

| Game | Boards | Walk | Change | Archive | Deal | Change | Steps |
|---|---|---|---|---|---|---|---|
| Unruly | 36 | 1.558 / 1.787 | +14.7% | +29% | 4.31 / 6.02 | +39.6% | 1,822 / 1,755 |
| Mosaic | 20 | 0.896 / 1.001 | +11.8% | +10% | 3.62 / 4.46 | +23.3% | 359 / 359 |
| Norinori | 48 | 2.727 / 2.865 | +5.1% | −2% | 92.7 / 70.5 | −23.9% | 1,734 / 1,721 |

**Which of the archive's percentages hold.** Sticks', Mosaic's and Boats'
walks, within a few points. Unruly's was twice its count, Range's more
than twice. Five had the wrong size or the wrong sign: Clusters' −14% is
+12% and Bricks' +28% is −20%, Light Up's +4% is +34%, Star Battle's +12% is +27%, and Pattern's +45% is
+157%. The archive read every walk as costing no player anything, and that
still holds: Pattern's whole 8-board walk is 2.2 G instructions, a fraction
of a second.

**The deals the archive missed.** It dealt each board's params once and
took the median, which hides a tail. Counted, Light Up's deals cost 3.7
times the hand-written ones and Boats' 2.6 times. `deal-compare` against
the same baseline, five deals a preset, wall-clock means: Light Up 12x16
at 402 and 481 ms against 105 and 236 ms (the slowest 1,059 ms), and
10x10 at its top tier 231 ms against 69; Boats 10x10 at its hardest
213 ms against 29 (the slowest 478 ms); Clusters 9x9 Unreasonable 138 ms
against 28. Those are past the 100 ms a player does not notice, on menu
boards. Sticks' deal is slow in both trees (230 ms mean, 1,152 ms at
worst) and is no regression. Filed as the engine's:
`openspec/changes/cut-the-born-deal-cost`.

**Boats' step count (3.2).** On the same 48 boards, the hand-written hint
took 1,519 steps and the born one 924. The archive's "894 to 1,460" has
the two trees swapped: the born walk takes fewer steps, as its stated
reason ("a firing that settles several squares is one step") says it
would. Pattern's "403 to 413" reads 429 to 423 here, the same way round.
No hint does less than before, so nothing is fixed. The born walks that
take fewer steps (Range, Singles, Unruly as well) settle several squares a
firing.

**Boards left unsolved, in both trees alike**: Range 8 of 16, Clusters 12
of 40, Light Up 8 of 24, Sticks 12 of 24, Bricks 8 of 16, Pattern 4 of 8,
Mosaic 4 of 20. Each is a board of the top tier (Unreasonable, Light Up's
`d2`, Bricks' `dn`), where the hint stops where the ladder does and the
search only certifies the deal (`born-unruly-norinori-and-mosaic`
§ Risks).

### The criteria, applied (4.1)

Recommended and written in `docs/descriptions.md` § "Judging a family
moved onto its description". Applied to the three archived changes, with
their recorded lines and capabilities and § 3.1's counts:

- **`a-game-from-its-description-alone`** (Kakurasu, Tents). The old test
  failed it: Tents added six capabilities to Kakurasu's four. The new one
  fails it on lines alone (criterion 1): Tents' 3,005 lines went and the
  engine gained 3,398. That flip built the runtime the twelve later games
  use, which is the reason the criterion asks it to name: across all three
  changes 22,739 game lines went and the engine gained 9,776, under half
  as many. Its additions were concepts (links, a glance, ask-before), which
  criterion 2 passes and the old test could not see.
- **`born-unruly-norinori-and-mosaic`**. The old test failed it: 8, 6 and
  8 capabilities, not falling. The new one passes lines (2.4, 2.0 and 2.0
  times what the engine gained) and steps (Unruly's fewer, explained). On
  cost it counts walks of +15%, +12% and +5% and deals of +40%, +23% and
  −24%, each deal tens of milliseconds, which nothing a player feels.
  The archive's CPU time had Unruly's walk at twice its count and
  Norinori's on the wrong side.
- **`born-plain-cell-family`**. The old test was set aside. The new one
  passes lines on every flip (2.3 to 5.9 times what the engine gained;
  15,666 against 4,412), and its steps once the Boats figures are read
  the right way round. **It fails criterion 4**: Light Up's and Boats'
  deals take three to seven times the hand-written ones, past 100 ms on
  menu boards, which the archive's medians hid. Under the new criteria
  that change would not have been archived before
  `cut-the-born-deal-cost`.

Criterion 3 cannot be applied to them: their gap lists named needs but
did not mark which earlier flips met, which is why the criterion asks for
the mark from now on.

### 7. Where the figures go

The command prints its table; a change records it in its own design.md, as
the born-family changes did. Nothing is written to `metrics/`.

## Risks / Trade-offs

- [The worker's instructions are not in the parent's count] → task 1.1
  plants a known extra loop in the walk and checks that the count rises by
  it, before anything else is built.
- [The start-up subtraction leaves a residue larger than a small
  change] → the spread (decision 3) shows it; a game with too few boards
  for its work to stand above the residue gets more boards, and the line
  says how many it walked.
- [An instruction count misses a change in memory behavior: the same
  instructions with more cache misses] → the command prints cycles beside
  instructions; where cycles move and instructions do not, `docs/method.md`
  says to check on a quiet moment before reading it as a cost.
- [A deal draws its boards from a seed, so a change to the generator deals
  different boards] → the deal figure compares the same params dealt the
  same number of times, not the same boards, and is read as a distribution,
  with its spread.

## Open Questions

- Whether `--predictable` changes the hint walk's relative cost between
  trees enough to matter: answered by task 1.2's run, and does not change
  the approach either way.
