# describe-pearl-tracks-and-tents

**Status: filed by `describe-net-pearl-tracks-and-tents` (2026-11-08)**,
which took Net alone. It is the rest of step 10 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"): the line
games on the square grid, Pearl, Tracks and Tents. Split at the start by
what each game adds to the language, take the first, and file the rest. The
last of them files step 11, `describe-the-remaining-number-games`, when it
is archived.

## Why

Pearl, Tracks and Tents each run a hand-written ladder. A description states
the rules and the reasoning once, and the checker proves each technique
sound.

## What Changes

- **What these games read** is added to the description language, the
  ladder runtime and the checker. Net brought the square grid in as a tiling
  (`src/engine/square-tiling.ts`), so a line game on the grid reads its edges
  and cells as Loopy and Net do.
- **Each game's ladder is stated**, with its tiers as it grades them, and its
  hand-written rungs are retired.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading, and its hand-written rungs are removed. Every technique is checked
sound, each with a planted defect that comes out unsound. The boards dealt,
their tiers and the hint walks are compared with HEAD, and each difference is
reported, with which saves or links no longer load. Large boards are timed
back to back with HEAD. The guides are updated and the running app is
checked.

## What Loopy and Net learned that binds here

The lessons of the archived `describe-loopy-…` and `describe-net-…` changes
bind here, and the list in `describe-net-…`'s proposal before them.

- **Run the ladder in place against a known answer**, deal boards from a known
  answer, and compare the marks after every technique's run
  (`docs/descriptions.md` § "A statement's order is behavior").
- **A reach the hand-written rung computed by trial is stated as a set built
  step by step**, as Net's seal is: the description says which side a square
  could carry a wire across, and the reach is that relation's closure. Say it
  that way in the help too; a hint sentence the stated reach cannot make true
  is dropped, not kept.
- **A generator that searches may deal with a prefix of the ladder** and ask
  the whole ladder once, at the end (Net's `QUICK` in `solver.ts`). Measure
  it: a prefix holding an expensive technique made Net's deals slower.
- **A square settled by its neighbors' notes is locked by the hint** before
  the walk and after each firing, where the game has locks; the plan ends
  with every square locked.
- **A set past a few dozen elements is the cost to watch**: `union` and
  `minus` switch to a `Set` past `SMALL_SET` in `describe-runtime.ts`;
  membership tests inside a quantifier are where a solve spent its time.
