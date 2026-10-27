# Proposal

## Why

The owner ruled (2026-10-26, `retire-hint-ordinals` design D4) that a chain
is fair only if every link can be recorded with the game's ordinary marks.
A chain of suppositions is Search and belongs to Unreasonable. Map's Tricky
rung, `forcingChain` (`map/solver.ts`), is a chain of two-color regions. The
dots that leave each region with two colors are markable, and the premise
legs write them. But the alternation along the chain ("if this region is red,
the next is blue") is a conditional that no mark records. It has the same
shape as the Latin forcing chain, which moved to the recursive tier on
2026-10-27.

Map's Tricky has no other rung, so moving it would leave the tier with
nothing to deal. The owner chose (D7) to leave such a rung where it is until
a markable technique fills its tier. This change finds one.

## What Changes

- Measure what Map's Tricky boards need once the chain is gone: deal boards
  at HEAD, solve each with `forcingChain` stubbed, and list the stalls by
  what the next markable fact would be.
- Where a technique the player can mark deals the tier, add it, preferably
  in a form the engine offers more than one game. Then move `forcingChain`
  to Unreasonable, or retire it where Map has no Unreasonable.
- Where none does, bring the owner the measurement and the choice: the tier
  goes or takes another name (a compatibility break), or the rung stays.

## Impact

Map's solver, generator, hint, help page and spec, and the engine for
whatever is shared.
