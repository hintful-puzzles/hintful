# compile-the-latin-ladder

**Status: filed on the owner's decision (2026-10-29)**, which followed
`build-a-game-from-its-description` (archived; its `report.md` § "The
recommendation" and § "The owner's decision").

## Why

The pilot ran Unequal's and Adjacent's stated techniques from their JSON
descriptions, and they matched the game's own solver at every tier: the same
candidates in every cell of 1,080 closures, the same grade on 270 boards, and
each of the 2,630 firings the hint narrates produced by exactly one binding
of a stated technique. The answer check came from the rules alone for
Towers, Unequal, Adjacent and Solo. The owner's word was to go ahead with the
ladder **built from** the description, not held to code by a check.

Interpreted, the stated ladder is 15 to 146 times slower than the native
solver, and a generator calls its solver many times a deal. So the
description is compiled: each technique turned into a TypeScript function at
build time, which the deduction fixpoint runs as it runs the hand-written
ones today.

## What Changes

- A compiler from a description's techniques to the functions
  `runDeductionFixpoint` runs, with the recording a hint needs (a firing's
  bindings are its premise). The interpreter in `research/describe/` is the
  reference it is compared against.
- `latin.ts`'s deductive layer (`place`'s strikes, `elim`, `set`, `diffSet`,
  `wing`) and Unequal's clue techniques replaced by what is compiled from
  `library/latin.json` and Unequal's descriptions. The search rungs (forcing
  chains, recursion) stay code.
- Unequal's hint words read the bindings in place of its reason objects.
- The technique checker ported to TypeScript with `z3-solver`, as the owner
  decided (`compute-the-cut-by-technique-transfer`), so each technique is
  checked sound against its rules before it is compiled; its `validate` and
  `planted` cases are the port's acceptance test.
- Then, one change each, the other Latin games in the report's order of fit
  (`report.md` § "What fits, and what does not"), with bounded fillings
  executed before Keen, Towers' `arrangement` and Killer's cages.

Nothing a player sees changes: the same boards, grades and hints.

## Acceptance

The pilot's comparisons hold against the compiled ladder (closures, grades,
firings, the planted defects), Unequal's existing tests and hint guards pass
unchanged, and the generator's time per deal is measured against today's and
reported.
