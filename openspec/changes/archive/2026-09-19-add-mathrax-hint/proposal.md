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
own narration is the kit's shortfall.

## What changes

- **Mathrax's solver gains a recorder.** The proposal assumed it already
  threaded one; it did not, and threading one raised the change's real question.
  Mathrax's single deduction body intersects a cell's candidates across the up
  to four clues at its corners *at once*, so there is no clue a step could
  honestly name. On the recording path it attributes each elimination to a clue
  that excludes it and commits one clue per firing — the same eliminations,
  finely enough attributed to narrate. The commit gate is untouched, so the
  solver-gated generator is unaffected, and that is asserted rather than argued.
- **One clue arm, three sentences, in a new `hint-text.ts`.** Whether a sentence
  may name a digit across the clue is a fact about the working board, so the
  hint re-derives it there instead of recording it — the rule `latin-hint.ts`
  applies to a single, aimed at a neighbor.
- **The plan is `runCandidatePlan` with no rungs of its own**, plus the clue's
  evidence shading (the diagonal pair, or the block of four for `E`/`O`) and the
  collection's auto-pencil preference, which a candidate plan's `autoClean`
  requires. Mathrax joins the cross-game hint guards by having a `hint()`.
- Its help page gains nothing new: the hint, and the auto-pencil preference, are
  collection-wide features no game's page documents.

*Outcome:* the kit carried the walk. Of the fourteen-line plan call, three lines
are about Mathrax; the findings on the rest are `design.md` § 4, scaffolded as
`share-the-latin-candidate-plan`. Running the app caught a hint-mark leak no
test tier reaches (`design.md` § 3).

## What this does not do

- Not an assessment of the hint framework in general; the audit's order still
  governs that.
- Not the kit changes themselves — they are their own change, because they touch
  six games.
