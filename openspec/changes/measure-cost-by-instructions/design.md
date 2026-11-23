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

### 4. The engine's counts beside it

Steps, which the walk already sees, and the technique firings the walk
tried. Task 2.2 finds whether the hint already counts firings tried; if
not, the count goes where the described firing hint tries a technique, as a
counter a test reads (`testing` § "Efficiency is asserted by a proxy").

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
