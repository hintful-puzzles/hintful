# describe-solo

**Status: filed by `describe-mathrax` (2026-10-31)**, the next Latin game in
the order of fit (`build-a-game-from-its-description`'s `report.md` § "What
fits, and what does not"): Solo's rules are already described, and its
Killer cages are fillings of a dealt partition, which `describe-keen` gave
the compiler.

## Why

Unequal, Group, Towers, Keen and Mathrax run their ladders compiled from
their descriptions. Solo is the largest Latin game left, and the one whose
solver shares the least with the engine's: its own cube, its own ladder and
two grading scales. What it lacks is its techniques in its description, and
a way for its solver to run compiled ones:

- **Its techniques.** `solo.description.yaml` states its rules and its
  variations (Jigsaw, X, Killer) and no technique.
- **A solver the compiled code can read.** A compiled technique reads
  `describe-runtime.ts`'s `Marks` and `GridSpace`. Solo's `SolverUsage`
  keeps its own cube (`cube[(y·cr + x)·cr + n − 1]`), and its units are rows,
  columns, blocks (dealt on Jigsaw), and on X the two diagonals.
- **Two scales.** Solo grades the Sudoku rungs on `diff` and the Killer
  rungs on `kdiff`, each with its own cap, and the ladder holds only the
  rungs both caps admit (`SolverUsage.ladder`). A compiled ladder has one
  tier per technique.

## What Changes

- **Solo's techniques are stated**, in the order `SolverUsage.ladder`
  declares them, each with its reason built from its binding, checked sound
  with a planted defect, the library's where they are the library's.
- **Solo runs its compiled ladder**, after the comparison the earlier
  changes ran (both side by side on every deal and hint walk; returns,
  grids, cubes and records equal), and the hand-written rungs go.

## Facts for the session (2026-10-31; re-check)

- The ladder (`SolverUsage.ladder` in `solo/solver.ts`): `block-single`;
  on Killer `killer-single`, `killer-region`, `killer-minmax`,
  `killer-sums`; `line-single`, `diag-single` on X, `naked-single`;
  `line-intersect`, `diag-intersect`; `region-set`, `diag-set`;
  `digit-set` and `wing`; `forcing-chain`. Which of them the library's
  `hiddenSingle`, `single`, `set`, `fish` and `wing` already state, in
  Solo's order, is the session's first measurement: a library technique's
  scan order is behavior, and Solo's hints narrate its firings.
- The two scales are the first decision: two ladders a game declares, a
  technique's tier on a named scale, or a game-side filter as
  `SolverUsage.ladder` is today.
- The killer region rule diverges from upstream on purpose (the module
  note, `teach-solo-cage-splits` and `solo-ladder-as-declared-techniques`):
  partial cages derived afresh from the board, and a region with nothing
  left a contradiction.
- `GridSpace`'s units are `lines`; `latinSpace(o)` builds rows and columns
  only. Blocks, a dealt jigsaw partition and the diagonals are units Solo
  needs the compiled `peers` and `units` to read.
- The comparison harness and the trace are `describe-mathrax`'s: commit
  `b53fb787` (`research/describe/compare-mathrax.test.ts`, the switch in
  `mathrax/solver.ts`), and `research/describe/trace-latin.test.ts`. The
  soundness checker can now say which clue kinds a small board cannot hold
  (`impossibleKinds`): read its `--` lines for Killer's cages.

## Acceptance

The comparison finds no difference on every Solo deal and hint walk, every
variation included; every existing Solo test and hint guard passes; each
technique is checked sound and its plant unsound; the app is run; and the
speed per deal is reported against the hand-written solver's.
