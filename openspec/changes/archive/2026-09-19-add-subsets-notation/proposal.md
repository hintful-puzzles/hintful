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

## Carried from `add-slant-notation`

Slant went through the same audit finding (2026-09-19-add-slant-notation). What it
learned that bears on this change:

- **The audit's list of arms is a floor, not the population.** It keyed on the
  sentences that gave the breach away. Slant's audit named one arm; grepping the
  solver for every read of the hidden state (`equiv`) found a second that fired
  five times as often and whose sentence was false. Here, find every rule that
  *reads* `cube` (not only `collapse` and `singlePosition`) before measuring.
- **Measure what the recorder derives before designing the mark.** Slant's
  measurement showed every merge joined two neighbors and meant "same slant", which
  settled the notation to one mark with no opposite. Record each elimination's
  reason and parents first (a trace object passed through the solver's options,
  inert when absent, so the generator's path and any differential stay unchanged),
  then read the notation off the chains.
- **Take a census of the reasons' shapes before writing sentences.** Slant's first
  wording named each premise clause by clause and ran to 275 characters, against
  `hint-quality.test.ts`'s 120 limit and 300 ceiling. The census showed three
  board patterns, and naming the pattern ("This 2 lies in a line between two 1s")
  brought the longest to 106, with the rule taught in the help. Do the census
  first, and check sentence lengths against that guard early.
- **Place a mark before the firing that first cites it, if its sentence still
  holds there, and otherwise where it was found.** Classify each premise as
  monotone or expiring as the board fills, and re-check expiring ones against the
  board the step is shown on.
- **Test the claims against the board, not against the recorder.** Slant's
  `slant-notes.test.ts` walks each step's board independently: every mark is true,
  placed once, before any step citing it, and each sentence's clues and pattern are
  where it says. Plant a defect to see each check fail. A plan resumed from marks
  made out of order may place different marks; assert "true and placed once", not
  equality with the first plan.
- **Guards the new input will meet.** The note-vocabulary guard rejects a typed
  array named `marks`. The capability-surface snapshot records every new `Ui` and
  draw-state field. If the aid's crossing-out runs through `ui.pencilMode`, the
  Marks-key and pencil-indicator placement guards enroll Subsets automatically.
  Remove `skip_specs` from `.openspec.yaml` when the delta is written, or validate
  refuses it.

## Acceptance

Owner acceptance: a new input, and a changed reference aid.
