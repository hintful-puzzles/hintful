# describe-crossing-and-ascent

**Status: filed by `describe-subsets-crossing-and-ascent` (2026-11-09)**,
which took Subsets alone. It is the rest of step 11 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"), the last.
It splits again at its start if the session finds it too large, filing the
rest as it goes. When the last of it is archived,
`describe-the-whole-catalog`'s task 4 (the engine's old layer, and the
guard) is next.

## Why

Crossing and Ascent run hand-written ladders. A description states the rules
and the reasoning once, and the checker proves each technique sound.
Crossing keeps a second hint engine that its description retires.

## What Changes

- **What these games read** is added to the description language, the ladder
  runtime and the checker. Re-check each against the game's solver before
  building it; a scaffold's "why this is hard" can be false (Subsets' "past
  31 bits at five letters" was: it is only ever dealt four). Read
  2026-11-09, each needs a construct of its own:
  - **Ascent**: a number per square up to the board's cell count, past the
    candidate bitmask's 31 bits, hexagonal tilings, adjacency by ruleset,
    walls, and the path's reach (`solverUpdatePath` and its kin). Signpost
    met the same bound with an answer whose value names a cell (`to`, and
    `chain` along it); a path's step to its next square is a neighbor, so
    the same reading may fit Ascent with no cap on its size. Weigh it first.
  - **Crossing**: a list of numbers dealt to the whole board, each placed
    in exactly one run (a matching), runs as Q, and the notes its hint
    writes; its second hint engine, `hint-solver.ts`, retires.
- **Each game's ladder is stated**, its tiers as it grades them and named as
  its menu names them, and its hand-written rungs are retired. A search the
  game keeps for grading (a forcing pass, a brute-force uniqueness check)
  stays the game's own, as Undead's and Signpost's do.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's grading,
and its hand-written rungs are removed. Every technique is checked sound, each
with a planted defect that comes out unsound. The boards dealt, their tiers,
completion and the hint walks are compared with HEAD, and each difference is
reported, with which saves or links no longer load. Large boards are timed
back to back with HEAD. The guides and help are updated and the running app
is checked.

## What Subsets learned that binds here

The lessons in `describe-subsets-crossing-and-ascent`'s proposal and its
predecessors' bind here, and these:

- **The checker reads an unknown number's bits by cases, never by `div`
  and `mod`.** With those, z3 found no answer to a Subsets board in 17
  minutes, and the checker's `hasAnswer` has no timeout, so the run hung
  without a line. Read by cases up to the board's word, each technique
  takes seconds. A new arithmetic reading in the checker is timed on the
  game's own board before the run is left to itself.
- **The checker checks a fixed board at every order as itself.** Subsets'
  4×4 is checked whole, all sixteen sets at once. A game whose board does
  not scale with the order should be measured before its run is trusted
  to finish.
- **Seed a hint's walk from the player's marks, not from what the aid
  reads.** Seeded from `canHold`, Subsets' plan opened with a run of
  collapses whose reasons the board never showed. A step that narrows a
  cell then strikes everything the visible rules exclude, so it never marks
  one letter while leaving a set that cannot fit.
- **A cap on the walk is tested by its answer, not its rungs**: an Easy plan
  equals the plan capped at Easy, and a Normal board completes under the
  full ladder and not under the Easy cap.
