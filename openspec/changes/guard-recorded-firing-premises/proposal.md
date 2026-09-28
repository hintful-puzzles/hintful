# guard-recorded-firing-premises

**Status: scaffolded, not started.** Found by `offer-recorded-placements-by-premise`,
2026-09-28.

## Why

Since `towers-implicit-strike-window` and `offer-recorded-placements-by-premise`,
the candidate-plan walk offers a recorded strike or placement when its premise
holds no mark the board has yet to show (`availableFirings` in
`src/engine/candidate-hint.ts`). That is sound only if a step's premise
(`area ∪ hatch ∪ reads`, plus `targets` for a strike) names **every cell whose
candidates or placed value the deduction reads**. A step that under-declares
passes every test and narrates a premise the player's board does not show.

Nothing checks this. It was verified by reading, per game, what each strike's
solver reads against what its step outlines (the list is in
`2026-09-28-towers-implicit-strike-window/design.md` D1): Towers' clue rungs
hatch the line whose heights they read, a Latin set's premise cells go pending
through the cull, Group outlines the witness cell, Unequal both cells of a
sign, Solo hatches the confined region. A reading is a census of the games
there were that day; the next game's premise is unread.

The contract already bit once in a neighboring form: the first version of the
rule took a placement's cull from the recording's `dup` strikes, Solo's solver
records none, and Solo's plans taught strikes resting on a cull the board did
not show, with the suite green (fixed by reading the cull off `reach`, commit
`9d025a6d`). Only a render snapshot moving a second time exposed it.

## What to find out

- Whether a premise check can be generic. A candidate: at each recorded strike
  a plan takes, rebuild the solver's cube from the board with every cell
  *outside* the step's premise widened to all candidates, and ask whether the
  solver still records that strike. If it does not, the premise left out
  something the deduction read. Each game already exposes its recording solver
  to its plan (`record`), which may be the seam.
- What that costs per game, and whether it belongs on the per-commit path or
  with the deferred cross-game guards (`PRECOMMIT_HOOK_RUN`).
- Whether a solver that narrows its search by what it has already found (a
  Latin set's reduced matrix drops decided cells) makes "widen the rest" report
  false failures, and how to tell those apart.
