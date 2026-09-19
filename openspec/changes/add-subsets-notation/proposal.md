# add-subsets-notation

## Why

`apply-markable-facts-rule`'s audit found Subsets' collapse and last-place steps
breaking `AGENTS.md` § "Hint quality bar" rule 6. The recorder keeps
`cube[cell][set-value]` across the whole plan, and three of its rules eliminate
set-values with no move attached (`docs/games/hints.md` § "Narrate by what survives
(Subsets)"). A collapse then says *"Only the highlighted sets can still go in this
cell"* over eliminations the player cannot record. The player marks only letters,
and the reference aid is shallow by design: a cell's marks plus its decided
neighbors.

Measured over 40 boards per tier, a collapse's letters did not follow from the
board, even with the no-horseshoe rule the aid does not draw added back in, in 76
of 291 collapses on Easy (32 boards) and 136 of 410 on Tricky (all 40). Every
`singlePosition` rests on the cube: 4 on Easy, 38 on Tricky.

## What changes

- Give players a way to rule a set-value out of a cell. The reference aid's
  location→values view is the natural home, since it already lists a cell's possible
  sets. Crossing one out there becomes a move, and the aid then reads the player's
  eliminations as well as the shallow rules.
- Record each cube elimination's reason and place the ones a firing cites as steps
  before it, beside the firing (`docs/games/hints.md` § "Give the facts a notation
  (Loopy)"). The advanced-arrow chain is the long case, so measure chain lengths
  first.
- Have `findMistakes` vouch for the new marks, and seed them into the recorder.

## Acceptance

Owner acceptance: a new input, and a changed reference aid.
