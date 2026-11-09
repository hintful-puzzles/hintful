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

## What was done

- **The split**: this change took Signpost alone. Ascent, Crossing and
  Subsets each need a construct of their own and are filed as
  `describe-subsets-crossing-and-ascent`, with what Signpost taught.
- **The language**: an answer's value may name a cell (`answer.value.to`),
  which `to(c)` reads and `chain(c)` follows; `last(c)` is where a chain
  ends; `compass(c, a, k)` is a step along one of eight directions; and a
  clue that says nothing of the answer means `true`. On the marks, every
  chain is kept at once while the placements stand (`chainsOf`), so
  `|chain(c)|`, `x in chain(c)` and `last(c)` are lookups, and a binder
  over the cells whose chain holds one walks that cell's tree. A binder
  pinned on a definition kept for the marks (`num(x) = k`) reads an index
  made once a placement, and a `min` or `max` over a range whose term is
  the counter plus or minus a constant stops at its first number. Rome's
  arrows are its `to`; its techniques compile as they did, and still check
  sound.
- **Signpost is described** (`signpost.description.yaml`): a link is how far
  along the arrow the next square lies, plus one, and 1 is the last
  square, so a value fits the candidate mask; a square's number is read off
  its chain. Two techniques, both Easy: `onlyNext`, the one square an arrow
  can lead to, and `onlyBefore`, the one arrow that can lead into a square.
  Each held at order 3 on 96 and 120 sampled boards, its whole proof not
  finished in the time, and each plant (a room read one too small; the
  arrows of numbered squares left out of a square's rivals) came out
  unsound. The hand-written rungs and the hint's own copy of the ladder are
  retired; the search that grades Unreasonable stays the game's own, and
  still branches on `isValidMove`.
- **A side is at most 31 squares**, since a link is a value of the mask.
  HEAD dealt larger boards; a game ID or a saved game with a side past 31
  no longer loads. Every preset is 8 squares a side or less.
- **Compared with HEAD** (10 deals a preset, 100 boards): every verdict
  agrees; every Easy deal is the same, and 10 of the 40 Unreasonable deals
  differ, since the ladder is stronger and the search has less to do: on
  400 of HEAD's boards, 4×4 to 7×7, every finish verdict and answer kind
  agreed, and the least search budget each needed never rose. On 200 Easy
  boards every hint walk finishes in the same steps, each the same move as
  HEAD's; about one step in eight words its rivals differently, naming a
  square that follows another before one that holds the wrong number where
  both hold, as the board shows the link.
- **Timed back to back with HEAD**: a deal of the largest preset, 6×8
  Unreasonable, costs 82 ms against 10 (106 at most); a 10×10 Easy deal
  230 ms against 23; a 15×15 Easy deal 2.9 s against 0.23 s, and
  Unreasonable 9 s against 1 s; a 20×20 Easy deal 18 s against 1.5 s. Before `num` was stated once a chain and
  the rooms read outward, a 15×15 Easy deal took a minute. What is left is
  spread over the ladder's generic reads, each made again after every
  placement where HEAD renumbers once.
