# add-tents-hint

## Why

Tents is hintless, and its hint presses on something no shipped hint has had
to answer: **a deduction whose premise is a pairing the player cannot mark.**
Facts below were read on 2026-09-26; re-check them before relying on them.

- **Board model.** A square grid of BLANK / TREE / TENT / NONTENT. The player
  marks tents and grass, and there are no pencil notes, so this is not a
  candidate-walk game. It plans the way Range or Singles do (`deduceHintPlan`,
  or `singleFirings` once the ladder is on the runner).
- **The links.** The solver's first rung ties a tent with one unattached
  adjacent tree to that tree, and later rungs read the result: "not adjacent to
  any *unmatched* tree", "a tree with exactly one {*unattached* tent, blank}
  neighbor". Those links live in the solver's `links` array. The game gives the
  player no way to draw one (`render.ts`'s `linked` feeds the error display
  only). AGENTS.md's hint bar, rule 6, says what to do: give the player the
  notation, and have the hint place those marks, or make the tier that needs it
  `Unreasonable`. First find out whether any narrated premise really needs a
  link, or whether "this tree's only possible tent" can always be read off the
  board as drawn.
- **Line enumeration.** The count rung enumerates every placement of a row's or
  column's remaining tents and fixes each square every placement agrees on:
  nonogram overlap reasoning, whose narration the collection has not written.
  At Tricky it also lets the adjacent rows constrain the enumeration. Classify
  both halves under `solver-and-generator.md` § "Check, Tactic, Search" before
  narrating either.
- **Tricky's diagonal-pair tree elimination** is a third premise to narrate.

## Prerequisite

`certify-the-tents-and-pearl-ladders`: Tents on the runner with a firing
census, so the narration is designed against rungs the generator reaches.

## What changes

1. The link question answered, with the owner if it adds a notation (a player
   control that behaves differently is theirs to accept).
2. Narration for every reached rung, to the Palisade bar, the enumeration rung
   as one journey per line.
3. Enrollment by declaring `hint()`; a tier-2.5 frame for the enumeration rung.

## Refactor as you go

- The enumeration is a line-overlap deduction. Before writing it, check whether
  anything in the tree already narrates one (Pattern's line solver is the place
  to look) and whether the two could share a finder.
- `add-abcd-hint`'s lesson applies: a technique that sweeps owes the hint a
  finder that yields one line's firing at a time; the plan owns the order.
