# certify-the-tents-and-pearl-ladders

## Why

`characterize-the-hint-assessment-corpus`'s audit put three hintless games in
**class B, "sweeps the whole ladder before restarting"**: abcd, pearl and tents.
`add-abcd-hint` found the label false for ABCD: each technique sweeps the grid,
but the loop restarts after any firing, which is the `runDeductionFixpoint`
walk, and ABCD adopted the runner with its C differential untouched. Nothing
about ordering had to be added for its hint either.

Read on 2026-09-26, to the level of their restarts:

- **Tents** (`tents/solver.ts`, `tentsSolve`'s `while (true)`) has the same
  shape: each technique sweeps, then `if (doneSomething) continue;`. It looks
  like ABCD's case exactly.
- **Pearl** (`pearl/solver.ts`, `pearlSolve`'s `loop:`) mostly does, with one
  exception: at Tricky, the shortcut-loop rung runs in the same pass after the
  stage before it has fired, because that stage's `if (doneSomething) continue;`
  sits inside the Easy-only branch. Whether that pass is restart-equivalent is
  not settled by reading: the shortcut rung reads the loop dsf, which the
  earlier stage may have just changed. The equivalence harness decides it, and a
  genuine difference would put Pearl in the hatch table beside Lightup rather
  than on the runner.

Both games are hintless and have no ladder census, so a rung their generators
never reach is invisible to every test (Tracks' lesson). Certifying the ladders
is the prerequisite `add-abcd-hint` did first, and doing it apart from either
hint keeps the hint changes about narration.

## What changes

1. Tents onto `runDeductionFixpoint`, upstream's loop kept as the oracle, with
   `tents-ladder.test.ts` (census, every tier cap, a plant per rung).
2. Pearl the same, **or**, if the harness shows its Tricky pass is not
   restart-equivalent, a recorded no-go in
   `docs/games/solver-and-generator.md` § "Where the fixpoint does not fit",
   with its census kept on the bespoke loop through the `firings` sink.
3. Correct the class-B reading where it is read now: the guides' account of it,
   not the archived audit, which is the record.

## What this does not do

- No hint for either game. Pick the next hint from the audit's order as usual,
  knowing class B is not a population.
- No solver strengthening: any plant or adoption that moves a board fails the
  frozen differential, and that is the check.
