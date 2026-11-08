# describe-the-remaining-number-games

**Status: filed by `describe-tracks` (2026-11-08)**, step 11 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"), the last.
It holds the constructs only one game needs each, and splits at its start if
the session finds it too large, filing the rest as it goes. When it is
archived, `describe-the-whole-catalog`'s task 4 (the engine's old layer, and
the guard) is next.

## Why

Subsets, Undead, Crossing, Ascent, Signpost and Pattern run hand-written
ladders. A description states the rules and the reasoning once, and the
checker proves each technique sound. Crossing keeps a second hint engine
that its description retires.

## What Changes

- **What these games read** is added to the description language, the ladder
  runtime and the checker: the plan names values (V), bijections, lists,
  matchings, walks and bitwise relations. Re-check each against the game's
  solver before building it; a scaffold's "why this is hard" can be false.
- **Each game's ladder is stated**, its tiers as it grades them and named as
  its menu names them, and its hand-written rungs are retired.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's grading,
and its hand-written rungs are removed. Every technique is checked sound, each
with a planted defect that comes out unsound. The boards dealt, their tiers,
completion and the hint walks are compared with HEAD, and each difference is
reported, with which saves or links no longer load. Large boards are timed
back to back with HEAD. The guides and help are updated and the running app
is checked.

## What Tracks learned that binds here

The lessons in `describe-tracks`' predecessors' proposals bind here, and
these:

- **A rule the hand-written solver kept hidden is a definition.** Tracks'
  update-flags rules (a rail makes a square track, closed sides empty it)
  were firings the plan hid; read as definitions (`on`, `shut`), no technique
  concludes them, nothing is hidden, and `showable` goes.
- **What the generator guarantees of a clue kind is a rule**, or a technique
  sound on every dealt board comes out unsound on one the game never deals
  (Tracks' `closeLoop` on a board with no ends).
- **Profile a slow deal before accepting it.** Tracks' Tricky deals took
  twice HEAD's time from one binder asking reach once a member; a library
  term (`cut_edges`) answering every member in one search made them 0.57×
  HEAD's. A set bound once and read by each binding is cheap; one rebuilt
  a binding is not.
- **Compare a candidate by everything the generator reads**, not only its
  verdict: Tracks' clue-laying reads how far a stalled solve got.
- **A spec scenario that names a first step can be false at HEAD**: run it.
  The space's order (rows before columns) moves which line a hint takes
  first.
