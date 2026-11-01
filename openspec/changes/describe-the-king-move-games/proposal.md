# describe-the-king-move-games

**Status: filed by `describe-components-and-open-domains` (2026-11-01)**,
step 4 of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It
files step 5, `describe-revealed-clues`, when it is archived.

## Why

Star Battle, Mosaic and Clusters run hand-written deduction ladders beside
the descriptions that already state their answer checks (step 2). Each
ladder is a second statement of the rules, and Mosaic's is two: its own
worklist for the hint and upstream's `solveCheck` gating Easy generation
(`describe-the-whole-catalog/design.md` § "Fill games on a rectangle"). The
vocabulary they lack is small: the king's-move neighborhood and the 3×3
block (N8), a dealt count the grid is not measured in (S, Star Battle's
stars per unit), and a clue kind for cells outside the answer (W).

## What Changes

- **N8, S and W as a clue kind** in the description language and the ladder
  runtime, with the checker's encoding of each.
- **Star Battle's ladder** stated: `crowded` and `starved` restate without a
  `look`; its regions are units as a plain partition, or the hint's order
  moves, which the owner has accepted once for the plan (§ "Decisions made
  here").
- **Mosaic's ladder** stated, its four rungs once N8 exists; upstream's
  `solveCheck` retired, the generator grading on the compiled ladder.
- **Clusters' ladder** stated, by a `look` or a restatement; its generator's
  prune, which reads an `F_ERROR` bit the validator writes, re-founded.
- **`Game.rulesOut` from the rules** measured on Star Battle (§ "Further
  refactoring a description makes possible"): taken if the compiled rules give the auto-cross
  aid what Star Battle declares by hand.

## Acceptance

Each of the three runs its compiled ladder for its solver, generator grade
and hint, its hand-written ladder removed; Mosaic's `solveCheck` gone; every
technique checked sound; the boards dealt, the tier mix and the hint walks
compared with HEAD and each difference reported, with which saves or links
no longer load; the guides updated; step 5 filed.

## Figures to re-check

The survey's sizes are its own (2026-11-01, `design.md` § "Fill games on a
rectangle"). On `describe-components-and-open-domains`' last commit:
`starbattle/solver.ts` 669 lines, `mosaic/deduce.ts` 247 and
`mosaic/solver.ts` 607, `clusters/solver.ts` 544. Re-measure before
designing against any of them.
