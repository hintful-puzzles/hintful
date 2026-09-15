# add-loopy-hint — tasks

Read [`docs/games/hints.md`](../../../docs/games/hints.md) first; it is the
procedure, and `AGENTS.md` § "Hint quality bar" is the bar. The measurement is
[`findings.md`](./findings.md).

## 0. Re-take the claims, and the baseline

- [x] 0.1 Loopy was hintless, with no `findMistakes`; `lineErrors` flags broken
      rules only; the threshold loop, the whole-frame renderer and the presets
      (up to 10×10 Penrose, Hats and Spectres at Hard) are as the proposal said.
- [x] 0.2 Read `findings.md` for Tracks, Bridges and Seismic, and Lightup's
      threaded recorder.
- [x] 0.3 Baseline: `cursor` 169, `dlines` 86, `generator` 184, `grid-build` 82,
      `index` 489, `params` 237, `render` 319, `solver` 1,110, `state` 419 =
      **3,095 production lines**.

## 1. Engine refactoring survey

- [x] 1.1 Taken and declined with reasons in `findings.md` §4: the shortest-chain
      search (built, measured, removed), a shared recorder with Lightup, grid
      geometry marks, clue-count and loop-closure narration, and a whole-frame
      renderer's plumbing (none needed, written into `rendering.md`). One guard
      fixed: `hint-resume.test.ts`'s state key could not serialize a cyclic
      structure.
- [x] 1.2 None was its own coherent unit.

## 2. The hint

- [x] 2.1 `findMistakes` compares with the unique solution; the hint takes the
      player's marks as facts on that basis. Check & save now highlights Loopy.
- [x] 2.2 `record.ts` + gated recording in `solver.ts`, `hint.ts`, `hint-text.ts`,
      the overlay in `render.ts`. The frozen differential passes unedited.
- [x] 2.3 Tricky and Hard read as Tactics over facts the board cannot show, walked
      by drawing and numbering them (`findings.md` §2), per the owner's choice of
      numbered marks.
- [x] 2.4 `loopy-hint.test.ts` walks every tiling at Hard and squares at every
      tier to solved, each step checked against the solution.
- [x] 2.5 Spec delta for the mistake check and the hint; `skip_specs` removed.

## 3. Report and accept

- [x] 3.1 `findings.md`: the numbers, the survey, and the cost with the machine's
      conditions.
- [x] 3.2 `solver-and-generator.md`'s bespoke-loop table: narratability and
      budgets met; the stale "nothing may ship hintless" sentence gone.
- [x] 3.3 Ran the app on squares (Tricky), triangular (Hard) and hats (Hard) and
      read real steps; `help/games/loopy.md` gains Hints and Checking sections
      and calls a dot a dot.
- [x] 3.4 `hints.md` (the legend row, § "Facts the board has no notation for"),
      `rendering.md` (a whole-frame renderer's hint), `solver-and-generator.md`
      (the Tactic reading).
