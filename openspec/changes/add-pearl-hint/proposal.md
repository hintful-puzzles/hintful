# add-pearl-hint

## Why

Pearl is hintless, and it is the collection's second loop-drawing game on edges.
Loopy is the first, and its hint needed a player notation
(`add-loopy-notation`). So Pearl's hint tests whether that answer generalizes or
was Loopy's alone. Facts below were read on 2026-09-26; re-check them before
relying on them.

- **What the player can mark.** A line or a no-line cross on each edge
  (`PearlState.lines` / `marks`).
- **What the solver reasons over.** Besides the edges, a per-square set of the
  six shapes a square may still take (`bLR`, `bUD`, `bLU`, …, in the `ws`
  workspace of `pearlSolve`). Its rungs discard shapes inconsistent with known
  edges, nail edges a square's surviving shapes agree on, and reason about the
  two kinds of pearl further along a line. A shape set is exactly the kind of
  fact AGENTS.md's hint bar, rule 6, is about. It may always be readable off the
  edges around the square, or it may need the notation Loopy got, or the tier
  that needs it becomes `Unreasonable`. Measure which before designing.
- **The shortcut-loop rung** refuses an edge or shape that would close a loop
  short of every pearl. It reads the drawn loop pieces, which the player can
  see, and it is one placement and one check, a **Check** under
  `solver-and-generator.md` § "Check, Tactic, Search".

## Prerequisite

`certify-the-tents-and-pearl-ladders`: it settles whether Pearl's Tricky pass is
restart-equivalent (adopt the runner) or a recorded no-go, and gives the rungs a
firing census either way. Design the narration against that census.

## What changes

1. The shape-set question answered (rule 6), with the owner if it adds a
   notation.
2. Narration for every reached rung, to the Palisade bar.
3. Enrollment by declaring `hint()`; a tier-2.5 frame for a pearl deduction.

## Refactor as you go

- **What Loopy's hint gives an edge/loop board**: its recording, its edge
  marks and hatch, its notation machinery. Read `src/games/loopy/hint.ts` and
  `notes.ts` before writing a second copy, and extract what the two games would
  plainly share. Record what stays per game, and why.
- If Pearl stays off the runner, the bespoke loop still owes the three
  obligations in `solver-and-generator.md` § "What a bespoke loop still owes".
