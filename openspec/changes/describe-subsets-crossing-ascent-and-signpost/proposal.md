# describe-subsets-crossing-ascent-and-signpost

**Status: filed by `describe-subsets-crossing-ascent-signpost-and-pattern`
(2026-11-09)**, which took Pattern alone. It is the rest of step 11 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"), the last.
It splits again at its start if the session finds it too large, filing the
rest as it goes. When the last of it is archived,
`describe-the-whole-catalog`'s task 4 (the engine's old layer, and the
guard) is next.

## Why

Subsets, Crossing, Ascent and Signpost run hand-written ladders. A
description states the rules and the reasoning once, and the checker proves
each technique sound. Crossing keeps a second hint engine that its
description retires.

## What Changes

- **What these games read** is added to the description language, the ladder
  runtime and the checker. Re-check each against the game's solver before
  building it; a scaffold's "why this is hard" can be false. Read
  2026-11-09, each needs a construct of its own:
  - **Signpost**: a value per square up to the board's cell count, past the
    candidate bitmask's 31 bits (V), or an answer read as each square's step
    along its arrow, which fits it; the chains the links make, with the
    numbers they carry (`isValidMove`'s look-ahead on a numbered chain).
  - **Ascent**: V again, hexagonal tilings, adjacency by ruleset, walls,
    and the path's reach (`solverUpdatePath` and its kin).
  - **Crossing**: a list of numbers dealt to the whole board, each placed
    in exactly one run (a matching), runs as Q, and the notes its hint
    writes; its second hint engine, `hint-solver.ts`, retires.
  - **Subsets**: a value per square that is a set of letters, `2^n` of
    them, past 31 bits at five letters; bitwise relations between squares
    and the letter projection the player marks.
- **Each game's ladder is stated**, its tiers as it grades them and named as
  its menu names them, and its hand-written rungs are retired. A search the
  game keeps for grading (a forcing pass, a brute-force uniqueness check)
  stays the game's own, as Undead's does.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's grading,
and its hand-written rungs are removed. Every technique is checked sound, each
with a planted defect that comes out unsound. The boards dealt, their tiers,
completion and the hint walks are compared with HEAD, and each difference is
reported, with which saves or links no longer load. Large boards are timed
back to back with HEAD. The guides and help are updated and the running app
is checked.

## What Pattern learned that binds here

The lessons in `describe-subsets-crossing-ascent-signpost-and-pattern`'s
proposal and its predecessors' bind here, and these:

- **A filling the ladder enumerates is exponential in its set**, and a line
  of 30 has hundreds of thousands. Where a game's test of a filling has a
  known polynomial reading (Pattern's runs), recognize its shape in the
  compiler and compile it to that program, held equal to the enumeration in
  a runtime test, rather than enumerating faster.
- **Hoist the per-square question first**: a pinned `f(x) = t` under a
  binder over the squares is one projection a binding of the rest, and the
  recognized program must answer it as a projection, or the cost multiplies
  by the line again.
- **A name a game defines shadows a builtin's** (`runs` was Pearl's): pick
  a builtin's name by searching every description, and say what it returns
  (`run_lengths`).
- **The hint's order is the walk's**, continuing from what it decided; a
  game's spec scenario pinning "first line" order is modified, not kept.
- **Check a fast "sound" with a second plant**: Pattern's check took 0.1 s,
  and a subtler plant (runs read of the clear squares) confirmed it reads
  the fillings.
