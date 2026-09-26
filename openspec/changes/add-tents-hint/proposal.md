# add-tents-hint

## Why

Tents is hintless, and its hint presses on something no shipped hint has had
to answer: **a deduction whose premise is a pairing the player cannot mark.**
Facts below were read on 2026-09-26; re-check them before relying on them.

- **Board model.** A square grid of BLANK / TREE / TENT / NONTENT. The player
  marks tents and grass, and there are no pencil notes, so this is not a
  candidate-walk game. The solver is a certified `runDeductionFixpoint`
  ladder (`certify-the-tents-and-pearl-ladders`), so the hint plans with
  `singleFirings` over `tentsLadder`, as Range or Singles do.
- **The ladder**, easiest first: `tent-link` (below Easy), then
  `grass-away-from-trees`, `grass-next-to-tents`, `tree-single` and
  `line-count` at Easy, then `tree-diagonal-pair` (after `tree-single`) and
  `line-neighbors` (after `line-count`) at Tricky. Every rung fires on the
  generator's boards.
- **The links.** `tent-link` ties a tent with one unattached adjacent tree to
  that tree, and it **writes only links**: when it fires, nothing the player
  can see changes. `tree-single` places a tent and ties it too. Later rungs
  read the result: "not adjacent to any *unmatched* tree", "a tree with
  exactly one {*unattached* tent, blank} neighbor". The game gives the player
  no way to draw a link (`render.ts`'s `linked` feeds the error display only).
  AGENTS.md's hint bar, rule 6, says what to do: give the player the notation,
  and have the hint place those marks, or make the tier that needs it
  `Unreasonable`. First find out whether any narrated premise really needs a
  link, or whether "this tree's only possible tent" can always be read off the
  board as drawn. A `tent-link` firing is at best a hidden step
  (`deduceHintPlan`'s `showable`) unless links become a notation.
- **Line enumeration** is two rungs. `line-count` enumerates every placement
  of a row's or column's remaining tents and fixes each square every placement
  agrees on: nonogram overlap reasoning, whose narration the collection has not
  written. `line-neighbors` reads the same placements for the two lines
  alongside, marking grass where every placement puts a tent next to it. It is
  what makes Tricky Tricky: silenced, 265 of 300 Tricky boards no longer
  finish. Classify both under `solver-and-generator.md` § "Check, Tactic,
  Search" before narrating either.
- **Tricky's diagonal-pair tree elimination** is a third premise to narrate.
  It fires on most Tricky boards but is needed on about one in fifty. Because
  it sits before `line-count` in the ladder, the hint will narrate it whenever
  it fires. Keep that position only if it is also the easier explanation for a
  player. Moving it changes the order of the walk, not what the ladder
  concludes, and the ladder test would say so.

## Prerequisite

`certify-the-tents-and-pearl-ladders`: done. Its design.md has the census and
the necessity measurements.

## What changes

1. The link question answered, with the owner if it adds a notation (a player
   control that behaves differently is theirs to accept).
2. Narration for every reached rung, to the Palisade bar, each enumeration
   rung as one journey per line.
3. Enrollment by declaring `hint()`; a tier-2.5 frame for each enumeration
   rung.

## Refactor as you go

- The enumeration is a line-overlap deduction. Before writing it, check whether
  anything in the tree already narrates one (Pattern's line solver is the place
  to look) and whether the two could share a finder.
- `add-abcd-hint`'s lesson applies: every Tents rung sweeps the whole grid, so
  the hint needs a finder that yields one line's or one tree's firing at a
  time, and the plan decides the order.
