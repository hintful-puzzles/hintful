# add-mathrax-hint

## Why

Mathrax is the one member of the Latin squares family with no hint. The corpus
audit (`characterize-the-hint-assessment-corpus`, `audit.md`) called it "the
right pick for *value*" and "the worst assessment", because it re-measures a
family already measured six times. Both still hold.

It has one use as an instrument, which that audit could not have named because
the thing did not exist yet: it is the first game to adopt `runCandidatePlan`
from scratch. After `candidate-plan-kit`, the claim is that a Latin-family game
gets the walk, the ordering, setup and journeys by supplying its own rungs and
sentences. Mathrax tests that claim directly: what it had to write beyond its
three `usersolvers`' narration is the kit's shortfall.

## What changes

- Mathrax records deductions through `latinSolverTop`'s recorder, which it
  already threads, and narrates its three game-specific rungs in a new
  `hint-text.ts`.
- Its hint plan is `runCandidatePlan` over the standard rungs plus any rung of
  its own. It joins the cross-game hint guards by having a `hint()`.
- Its help page gains nothing new: the hint is a collection-wide feature.

## What this does not do

- Not an assessment of the hint framework in general; the audit's order still
  governs that.
