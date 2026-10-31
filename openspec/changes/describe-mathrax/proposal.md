# describe-mathrax

**Status: filed by `describe-keen` (2026-10-31)**, the next Latin game in
the order of fit (`build-a-game-from-its-description`'s `report.md` § "What
fits, and what does not"), whose clue meanings are sums, products and
differences, as Keen's are.

## Why

Unequal, Group, Towers and Keen run their ladders compiled from their
descriptions. Mathrax is next. What it lacks is its rules in its
description, and the compiler's reading of where its clues sit:

- **Its rules.** `mathrax.description.yaml` holds its help page only. The
  investigation stated them (`investigate-a-language-for-puzzle-games`'s
  `collection/latin-and-numbers.md` § "Mathrax").
- **A clue at a corner.** A Mathrax clue sits where four cells meet, and
  reads the two pairs of cells diagonally across it. The compiler has no
  element there: a grid corner, its cells, and a cell's corners. Every game
  with clues on the grid's points reads the same.

## What Changes

- **The compiler and the checker read a grid's interior corners** and clues
  at them.
- **Mathrax's rules are stated** in its description, checked by the
  investigation's answer check under `research/describe/`.
- **Mathrax's technique is stated** in the order `mathrax/solver.ts` scans,
  with its reason built from its binding, and checked sound, with a planted
  defect.
- **Mathrax runs its compiled ladder**, after the comparison `describe-keen`
  ran (both side by side on every deal and hint walk; returns, grids, cubes
  and records equal), and the hand-written `applyOptions` goes.

## Facts for the session (2026-10-31; re-check)

- `applyOptions` is one body at three rungs. For each cell it intersects the
  candidates with what every clue at its corners allows given the cell
  across, so it is a technique bound by cell, not by clue. Easy reads an
  arithmetic clue only where the cell across holds one candidate; Easy and
  Normal strike only where the intersection leaves a single digit; Tricky
  strikes whatever it rules out. Decide whether those gates are three
  statements or one with a premise each tier reads.
- On the recording path it returns after the first clue at a cell that
  strikes, so a firing is one clue at one cell; without a recorder it sweeps
  the board, and it returns `-1` where a cell's intersection is empty.
- Its context mirrors the cube in upstream's `BIT(d) = 1 << (d − 1)` form and
  narrows as the solve runs, so recursion clones it. A compiled technique
  reads the marks, so the mirror may go with it: check the generator, which
  is solver-gated, deals the same boards.
- `mathraxSolve` returns upstream's `SOLVE_*` codes, not a tier, and the
  even and odd clues are values with no arithmetic: what a clue kind is for
  them is the session's first decision.
- The comparison harness is `describe-keen`'s, in commit `7a3f8142`
  (`research/describe/compare-keen.test.ts`, with the switch in
  `keen/solver.ts`), and the trace is `research/describe/trace-latin.test.ts`.

## Acceptance

The comparison finds no difference on every Mathrax deal and hint walk,
every existing Mathrax test and hint guard passes, the technique is checked
sound and its plant unsound, the app is run, and the speed per deal is
reported against the hand-written solver's.
