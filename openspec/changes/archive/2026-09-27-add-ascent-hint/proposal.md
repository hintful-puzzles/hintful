# add-ascent-hint

## Why

Ascent is hintless, and `characterize-the-hint-assessment-corpus`'s audit
names what its hint presses on: **modes that change the geometry** (square,
no-diagonal, hexagon, honeycomb, and an Edges mode clued by arrows), on a game
that already diverged for honest tiers and sits on the shared deduction
runner. It is also the first hint whose solver reasons over a hidden
**candidate bitmap of numbers per square**, the fact AGENTS.md's hint bar, rule
6, is about: the player writes numbers and can draw path lines, and has no
way to note which numbers a square may still take.

Facts read on 2026-09-27; re-check before relying on them.

- **The ladder** is a certified `runDeductionFixpoint` ladder of ten rungs
  (`ascent-ladder.test.ts`, nothing unreached): two placing rungs
  (`single-position`, `single-number`), two reach rungs (`proximity-simple`,
  `proximity-full`), `overlap`, and five path rungs over a second hidden
  bitmap of possible links per square.
- **The generator** blanks clues while the graded solver still finishes, and
  rejects a board the tier below finishes (`newAscentDesc`).

## What changes

1. The rule-6 question answered by measurement, as Pearl and Tents did: which
   of the solver's hidden facts does a hint need, and does any need a notation?
2. An explained `hint()` whose every step places one number, narrated to the
   Palisade bar, drawn with the target ringed and its reasons outlined, in
   square and hexagonal cells alike.
3. Enrollment in every cross-game hint guard by declaring `hint()`; a help
   section teaching the techniques the hint names.

## Refactor as you go

- Loopy strokes a face polygon inset toward its center, edge by edge, and
  Ascent needs the same for a ring in a square or hexagonal cell. Share it.
- Survey the single-target `hintKeepTrack`s before writing another.
