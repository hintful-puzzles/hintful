# share-the-single-firing-driver — design

## The population (task 1.2)

Taken by reference, 2026-09-21: `npm run refs -- src/engine/deduction-fixpoint.ts
runDeductionFixpoint` names 15 games plus `latinSolverTop`. Reading every
`settled` among them, three are about a *firing* rather than the board —
Tracks (`b.impossible || rec.ops.length > 0`), Bridges (`rec.ops.length > 0`)
and Magnets (`fired`) — and the rest stop on a solved, contradicted or
budget-spent board. The proposal's three descriptions held as written.

## D1. A function beside the runner, sharing its one pass

**Decision:** `singleFirings(opts)` in `deduction-fixpoint.ts`, returning
`{ next(), impossible() }`. The runner's inner loop becomes a private
`firstFiring`, and both `runDeductionFixpoint` and `singleFirings` are that pass
repeated; they differ only in when they stop.

**Why not an option on `runDeductionFixpoint`:** the two answer different
questions. The fixpoint answers *what grade, and was it impossible*; a single
firing answers *which technique fired*. An option would add a result field that
only one mode sets, which is the `T | null` beside a mode flag that
`docs/games/mechanics.md` § "Absence is `null`" steers away from, and every
generator caller would carry it. Sharing `firstFiring` still gives the
proposal's real point, "the runner with one more stop condition, not a second
runner": there is one pass down the ladder in the tree.

**A driver object rather than a call per firing**, for two reasons that both
come from state that should outlive one call:

- **The contradiction is sticky.** Bridges and Magnets each kept their own
  `impossible` flag beside the runner; the driver owns it once.
- **Budget attribution spans calls.** Each game's old per-call
  `runDeductionFixpoint` made a fresh tally, so on a runaway across many calls
  the budget named at most one firing. The driver's tally lives as long as the
  driver, and a test pins "names a technique that runs away across many calls".

**The budget is required** on the driver. Every caller is a hint, and the hint
path is where a rule reporting progress without changing the board must fail
loud.

## D2. Where invisible firings are hidden: in `showable`, always

**Decision:** the driver returns every firing. Bridges' per-direction maximum
now comes back as a firing with no ops and no reason, and its existing
`showable` (`reason !== null`) hides it. No test was edited.

Measured (task 1.3), 36 Bridges boards (every preset × 4 seeds): shown steps
739 before and after, hidden 749 → 767. The 18 are the max-cap firings, which
the old driver skipped where `hidden` could not count them.

Across all three games, 116 hint walks (every preset × 4 seeds, a hint after
every move) produced byte-identical hints before and after.

## D3. No snapshot/diff pair on the driver

**Decision: not done.** Only Magnets reads a firing's effect off a before/after
comparison; Tracks and Bridges read their recorders. A `snapshot`/`diff` option
with one user would be a configuration hook written for a hypothetical, and
Magnets' `GS_MARK` mask is about Magnets' scratch bit, not a general rule. The
guide now says the effect is the caller's to read and names both ways. Revisit
when a second game reads its firings off the board.

## Found on the way: Bridges narrates a cap the player cannot write

Rewording Bridges' `showable` comment meant checking whether hiding the
max-cap is honest (docs/games/hints.md § "Show only what the board does not
already say"). A census of 3,395 shown `exactSpace` steps over 225 Bridges
boards (every preset × 25 seeds) found **62** that say an island "has room for exactly one" where the
player's board, with no maxima, shows room for two. All 62 are on boards where
a hidden maximum stood, and none is on a board without one. The refactor did not
cause this: those firings were hidden before as well. It breaks AGENTS.md's
hint rule 6 and needs a player-facing decision, so it is its own change,
`bridges-hint-cites-an-unwritable-cap`, with a pinned board.

## Commits

The three adopters and the driver land in one commit rather than the one per
adopter that tasks.md planned. Their equivalence evidence was taken over all
three at once, and each adopter's diff is a handful of lines that cannot build
without the driver beside it.
