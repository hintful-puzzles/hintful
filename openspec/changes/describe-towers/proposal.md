# describe-towers

**Status: filed by `describe-group` (2026-10-30)**, the next Latin game in
the order of fit (`build-a-game-from-its-description`'s `report.md` § "What
fits, and what does not").

## Why

Unequal and Group run their ladders compiled from their descriptions. Towers
is next: its description already states its rules (`towers.description.yaml`,
read by the interpreter under `research/describe/`), and its Easy
deductions read a clue's line of sight, which the syntax has. What it lacks
is the compiler's, and each lack is also Keen's, Mathrax's and Solo Killer's:

- **A clue's line of sight**: `slots`, `sight(s)` and `before(c, L)`, which
  the interpreter reads and the compiler refuses.
- **Fillings**: `solverHard` tries every arrangement of a line against its
  two clues, and keeps the values some arrangement puts in each cell. That
  is `exists fill f of S` in the investigation's `language.md`. The
  interpreter does not run it either. Keen's, Mathrax's and Killer's cage
  rungs are the same construct over a cage.

## What Changes

- **The compiler reads a clue's line of sight**, and the checker with it.
- **The compiler executes fillings** over a line, under a bound stated with
  the construct. This is the engine's: Keen's cages are its next reader.
- **Towers' techniques are stated** in its description, in the order
  `towers/solver.ts` scans, with their reasons built from their bindings,
  and checked sound, with a planted defect each.
- **Towers runs its compiled ladder**, after the comparison `describe-group`
  ran (both side by side on every deal and hint walk, returns, grids, cubes
  and records equal), and the hand-written `solverEasy` and `solverHard` go.

## Facts for the session (2026-10-30; re-check)

- `towers/solver.ts`'s `TowersCtx.started` gates a one-off deduction from
  facing clues, which persists across the fixpoint and the recursion. It is
  a placement the solver makes once, outside the ladder. Decide whether it
  is a technique, a seed, or stays the game's, and say why.
- Towers' tiers are `[Easy, Hard, Extreme, Unreasonable]`: it has no Normal,
  and `solverEasy` runs at the library's singles' tier.
- `solverEasy` returns per firing only when recording, like Group's
  `solverHard` did.
- `research/describe/trace-latin.test.ts` writes every Latin game's deals and
  hint walks for diffing two builds of the compiled modules; the compiler's
  hoisting is described in `docs/descriptions.md` § "What a technique
  compiles to".

## Acceptance

The comparison finds no difference on every Towers deal and hint walk, every
existing Towers test and hint guard passes, each technique is checked sound
and its plant unsound, the app is run, and the speed per deal is reported
against the hand-written solver's.
