# teach-solo-cage-splits

Found by `guard-recorded-firing-premises`, 2026-09-28. Decided in `design.md`:
the region rule stops keeping its splits, so every sum it uses is one step from
the board and one sentence long.

## Why

Killer Solo's hint says things that are false on the player's board.
Measured over every Killer leaf preset at six seeds, both readings, on HEAD
before that change: **6 of 157** `cageSingle` hints said "The rest of this
killer cage is filled in, and the one cell left must bring the cage to its
total" while other cells of the cage were empty (8 of 198 after it, the plans
having moved). One board that shows it:

`3x3ka:zzzc,__a_aa_a_______aa___aa_____a______________________a___aaacaaaaaab_aab____a_a___a__a_aaa_ba_aaabaaa_,15_9_5a16_10a23c4b13a9a7_8_19_12d5d13a22_7a7_11_13_8a12b6c11_8b9a7_26_14b8_10a13c12c21e12d`

The cause is the solver's KINTERSECT rung (`SolverUsage.run` in
`src/games/solo/solver.ts`). When a row, column or block's total, less its
whole cages, leaves cells that all belong to one cage, it **splits that cage**
into the part with the known sum and the rest (`splitBlock`), and records
nothing: a split changes no candidate. A later rung then works on the split
part as though it were a cage. `cageSingle` narrates it as the cage the player
sees, and so claims the rest of it is filled. The same rung's **extra cages**
(a region less its whole cages, when the cells span several cages) feed
`cageMinMax` and `cageSums`, whose sentences say "This killer cage must total
N" of something the player cannot see as a cage.

So the hint relies on a deduction it never teaches, which the Palisade bar
forbids (AGENTS.md § "Hint quality bar", rule 6: a hint relies only on marks
the player can make).

## What to decide

- How a split is taught. Candidates: narrate it as its own step ("this row
  must total 45; its whole cages and digits account for all but 11, and the
  cells left all lie in this cage, so they total 11") before the step that
  uses it; or narrate the using step from the region rather than the cage. A
  split changes no note, so a step teaching it has no move of its own, and
  that is the design question.
- Whether an extra cage should be narrated at all while the player has no
  notation for it, or its tier becomes one the hint declines
  (AGENTS.md rule 6's fallback).
- What premise a step on a split part reads: the region and the whole cages
  the split came from. The audit cannot hold it (Solo offers no replay on a
  Killer board), so a test of the recording must.
