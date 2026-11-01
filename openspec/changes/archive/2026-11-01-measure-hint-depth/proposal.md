# measure-hint-depth

**Status: filed on the owner's word (2026-10-31)**, in
`review-rect-hints-and-tiers`: "let's please also see if we might arrive at
some mechanistic way to clarify the complexity/difficulty of hints", and on
the measure proposed there, "File it as an engine change".

## Why

A tier is a set of rungs, and which rungs belong in which tier has been judged
by reading their sentences. Nothing in the engine says how hard a step is, so
a rung can sit in a tier its reasoning does not belong in until a player
notices. The owner did: Patches' Easy showed a line step that leaned on a fact
its words never stated.

Measured 2026-10-31 on Rectangles (`review-rect-hints-and-tiers`,
`design.md` § "What the walk found"), two plain measures do not track how
hard a step is:

- **The sentence's size**: words, marks and premise elements are flat across
  the five rungs. The easiest rung after "only one fit" has the longest
  sentence.
- **The placements its claim ranges over**: this orders the rungs backwards,
  because a player judges "no other clue can reach it" by sight and does not
  enumerate.

What does order them is **how many facts a step leans on that the board does
not show**, each a claim about every placement of some element: 0 for fit, 1
for reach and overlap, 1 per fit ruled out for starve, 2 for line.

## What Changes

- **A reference says whether the fact it marks is seen or derived.** "The
  outlined clue" is on the board; "the striped squares the 6 always covers"
  is derived. The declaration lives on the reference (`mark.*` in
  `engine/hint-words.ts`), where the words already bind the marks, so a
  sentence cannot name a derived fact without saying so.
- **A step's depth is read off its sentence**: the derived references it
  names, plus one for a `follows` part.
- **A cross-game report** (`scripts/checks/`, beside the other hint reports)
  gives, per game and rung, the depth of the sentences its walks speak, and
  lists a rung whose tier is out of order with its depth.
- **What it should catch that nothing does now**: a sentence that rests on a
  derived fact it never names. Rectangles' `line` "misses" case did, until
  `review-rect-hints-and-tiers` gave it "only it reaches"; the report is
  tried against that sentence as it was.

## Open

- **Whether depth becomes a rule or stays a report.** A guard that refuses a
  rung whose depth exceeds its tier's is the stronger form, but which depth
  is Easy is a question per game. Start as a report, and look at what it
  lists across the games before proposing a rule.
- **What counts as derived in a candidate game.** A pencil mark the player
  made is on the board; a candidate the step strikes by elimination is
  derived. The first games to read are a candidate game (Towers) and an edge
  game (Palisade), beside Rectangles.

## Acceptance

The report run over every hinted game, its listings read, and the cases it
flags brought to the owner with a recommendation for each.
