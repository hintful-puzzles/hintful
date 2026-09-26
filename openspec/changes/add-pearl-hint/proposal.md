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
  six shapes a square may still take, plus blank (`bLR`, `bUD`, `bLU`, …, in
  the workspace of `pearl/solver.ts`). A shape set is exactly the kind of fact
  AGENTS.md's hint bar, rule 6, is about.
- **The ladder** is a certified `runDeductionFixpoint` ladder
  (`certify-the-tents-and-pearl-ladders`), so the hint plans with
  `singleFirings` over `pearlLadder`. Its rungs, and what each writes:
  - `shapes-from-edges` (Easy) strikes the shapes the known edges rule out. It
    writes **only shape sets**, which the player cannot see, and it fires about
    as often as the next rung. On its own it is bookkeeping, readable off the
    square's four edges, and it makes a natural first half of one journey with
    the next rung.
  - `edges-from-shapes` (Easy) nails an edge every surviving shape agrees on.
  - `pearl-clues` (Easy) holds four pearl rules. Two set or strike shapes
    directly: a black pearl's line forces a straight beyond it, and a white
    pearl whose neighbors on an axis cannot turn into it cannot run that way.
    A third makes the square past a known straight a corner. The fourth
    disconnects an edge. **The shape writes are what the rule-6 question is
    about**, because after them a square's shape set is no longer readable off
    its edges.
  - `closed-loop` (Easy) is terminal: a loop has closed, everything off it is
    blank, and the ladder stops. It fires once per board, and there is nothing
    to narrate beyond "the loop is closed".
  - `shortcut-loop` (Tricky) refuses an edge that would close a loop short of
    every square that cannot be blank, and **also strikes a shape** whose two
    ends lead into the same loop piece. The edge half reads drawn loop pieces
    the player can see, and is one placement and one check, a **Check** under
    `solver-and-generator.md` § "Check, Tactic, Search". The shape half is
    another rule-6 case. It fires on every Tricky board, which is by
    construction: the generator rejects Tricky boards that Easy finishes.
- So the question to measure is narrower than "is a shape set readable off
  the edges?". Ask it only of the shape strikes by `pearl-clues` and
  `shortcut-loop`: can each one be restated as an edge fact the player can
  mark in the same journey? If it can, the shape set can stay internal. If it
  cannot, those strikes need the notation Loopy got, or the tier that needs
  them becomes `Unreasonable`.

## Prerequisite

`certify-the-tents-and-pearl-ladders`: done. Pearl is on the runner (the
Tricky pass the proposal worried about turned out to be dead code), and its
design.md has the census.

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
- Every rung sweeps the whole grid, so the hint needs a finder that yields one
  square's or one pearl's firing at a time (`add-abcd-hint`'s lesson).
