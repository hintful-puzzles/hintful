# add-separate-hint

**Status: implemented 2026-09-28; `design.md` records how each question below
was answered.** Chosen 2026-09-28, after
`solo-ladder-as-declared-techniques`, from the hintless games that still have a
deduction solver: Separate, Signpost and Mosaic (`characterize-the-hint-
assessment-corpus` ranked the rest of that corpus, and all of it has since
shipped a hint).

## Why Separate, of the three

- **It is the last of its class.** Its solver's two deductions are inline in
  one loop (`solverAttempt` in `src/games/separate/solver.ts`), as Solo's were:
  class A2 in the audit, "a ladder that must be split into functions first".
  Adoption onto `runDeductionFixpoint` is the pattern
  `solo-ladder-as-declared-techniques` just walked, with a ladder-equivalence
  test and the old loop kept as oracle.
- **Its notation question is already answered.** The input is Palisade's: each
  edge is wall, no-wall mark, or unknown. The two deductions conclude exactly
  those marks: two adjacent squares whose regions already share a letter are
  walled apart; a region below size `k` with one square left to grow into
  takes it through a no-wall edge. So AGENTS.md's hint rule 6 (a hint rests only
  on marks the player can make) should cost nothing, and the change tests
  whether Palisade's hint machinery generalizes to a second edge game.
- **Signpost** would put player value first (a better-known game, one rule that
  narrates cleanly) but presses less on the framework. **Mosaic** is the
  cheapest of the three and so the weakest assessment.

## What is known to be hard (read 2026-09-28; re-check before relying on it)

- **The disconnect rule sweeps.** Pass (1) walls apart every eligible pair
  across the whole grid before pass (2) runs, and pass (2) merges once and
  restarts. One sweep can wall apart unrelated pairs, which is not one
  deduction and so not one hint journey (AGENTS.md § "Hint quality bar",
  point 2). The recording projection needs one pair per firing.
- **The generator reads the solver's order.** `newSeparateDesc` runs
  `solverAttempt` across refills of the letters it has not locked, and
  `genLock` records which squares' letters a deduction used. Changing when a
  rung fires can change which letters lock, so which boards generate. The frozen
  differential (`separate-differential.test.ts`) byte-matches descs, so it will
  say. Byte-parity is released (AGENTS.md § "Byte-parity was a tool"): if the
  honest ladder moves boards, weigh it and say what replaces the oracle
  (every generated board solvable by the ladder, as a property test), rather
  than keeping the sweep for fidelity.
- **There are no difficulty tiers.** Separate has one tier, so the ladder is
  untiered (Filling's shape in `docs/games/solver-and-generator.md`'s table).
- **A disconnect is a fact about two regions, not two squares.** Once regions
  merge, every edge between them is a wall; a firing may therefore mark several
  edges, and its premise is the letter both regions hold, wherever those
  squares are.

## What to find out

- Whether the edge hint needs anything Palisade's does not already give
  (`src/games/palisade/index.ts` § hint, `hint-text.ts`), and if so, whether
  that belongs in the engine rather than in Separate.
- Whether the disconnect rung can report one pair per firing without moving
  generated boards, and what it costs if it cannot.
