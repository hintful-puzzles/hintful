# describe-a-board-beyond-the-latin-square

**Status: filed by `describe-the-whole-catalog` (2026-11-01)**, step 1 of
its plan (`design.md` § "The plan"). It files step 2,
`check-the-answer-from-the-rules`, when it is archived.

## Why

A compiled ladder runs today only on `LatinSolver` (`compiledRung`,
`engine/latin.ts`) or on Solo's own `Marks` through Solo's own wrapper. The
runtime knows one board: the Latin square, or Sudoku's with boxes. Every
game the plan describes after this one needs a ladder that runs on a board
it declares, so this step builds that runtime and proves it on two answer
shapes: Unruly (two values a cell, rows and columns that are not Latin
units) and Seismic (a number a cell, a dealt partition as the units, a
domain per part).

## What Changes

- **A runtime for any compiled ladder.** The engine owns the marks store (a
  candidate mask per cell, over the description's domain), runs a compiled
  module's `ladder` entries with their `tier`, `scale`, `from` and `until`,
  caps each scale, and records each firing with the reason its pairing
  builds. `compiledRung` and `uncluedRung` stop taking a `LatinSolver`;
  the library's techniques are paired by the engine, so a game's table
  names only its own (35 rows go from seven tables). `LatinSolver` and
  Solo run on it: Solo's wrapper (`solo/solver.ts:756-893`), its pairing
  plumbing (`:644-755`) and its `Marks` over the cube go.
- **The hint walks the compiled firings.** For a described game the
  recording path replaces `singleFirings`, `findingTechniques` and
  `SweepOffers`.
- **A rectangular space whose units are declared**: rows and columns as
  Latin units or as plain lines, a dealt partition's parts, or none; a
  domain per part (Seismic's areas). `gridSpace(w, h)` exists, private.
- **`placed` over every unit**, so Solo's `place()` propagation goes.
- **The Latin sentences name a reason's unit**, so Solo's and Towers'
  copies of the single, set and wing sentences go (`design.md` § "Further
  refactoring", the sentence row).
- **Unruly and Seismic described**, compared with their hand-written
  ladders, and their ladders removed.
- **Measured**: whether the reason kinds a pairing builds can give
  `Game.hintRungs` (each described game keeps a `*_RUNGS` list beside its
  compiled `LadderId`).

## Facts for the session (2026-11-01; re-check)

- Unruly: `runDeductionFixpoint` over five techniques
  (`unruly/solver.ts:481-519`), tier-ordered; `unique-rows` returns 0 unless
  the modifier is on; the hint is `singleFirings` with `SweepOffers`
  (`:543-608`). Every technique reads as written with `nth(L, i)` and counts.
  A C-reference fixture pins its boards.
- Seismic: `marks`, `areas` (hidden single in an area, on a snapshot of the
  pass) and `attempt` (`seismic/solver.ts:127-207`, ladder `:309-339`). The
  hint re-derives them on the candidate plan as `singletons`, `hidden`,
  `starves` (`hint.ts:195-256`), arguing `attempt` is always a hidden single
  or a starve (`:236-249`): state `starve`, and check the argument by the
  comparison. Tectonic's clash is the eight neighbors; Seismic's is `n`
  cells along the row and column, which states with `abs` today.
- Solo's residue in full: `describe-the-whole-catalog/design.md` § "The
  catalog, game by game", the Described subsection.

## Decisions it inherits

`describe-the-whole-catalog/design.md` § "Decisions made here": a saved game
or shared board may break where that simplifies, reported; boards and grades
may move, reported; a
search tier stays engine search over the compiled ladder; a hint whose
order moves follows the owner's answer on hint order, recorded there.

## Acceptance

Unruly and Seismic run compiled ladders with no hand-written technique left,
each technique checked sound with a planted defect unsound; what the
compiled ladders solve at each tier compared with the hand-written ones and
reported, with any save or link that no longer loads; Solo and the Latin games run on the new runtime with their traces
unchanged (`research/describe/trace-latin.test.ts`); the app run on all
three games' hints; the guides updated (`docs/descriptions.md`,
`docs/solver-and-generator.md`).
