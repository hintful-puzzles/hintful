# describe-subsets-crossing-and-ascent

**Status: done (2026-11-09) for Subsets alone**; Crossing and Ascent are
filed as `describe-crossing-and-ascent`. Filed by
`describe-subsets-crossing-ascent-and-signpost` (2026-11-09), which took
Signpost alone. It is the rest of step 11 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"), the last.
It splits again at its start if the session finds it too large, filing the
rest as it goes. When the last of it is archived,
`describe-the-whole-catalog`'s task 4 (the engine's old layer, and the
guard) is next.

## Why

Subsets, Crossing and Ascent run hand-written ladders. A description states
the rules and the reasoning once, and the checker proves each technique
sound. Crossing keeps a second hint engine that its description retires.

## What Changes

- **What these games read** is added to the description language, the ladder
  runtime and the checker. Re-check each against the game's solver before
  building it; a scaffold's "why this is hard" can be false. Read
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
  - **Subsets**: a value per square that is a set of letters, `2^n` of
    them, past 31 bits at five letters; bitwise relations between squares
    and the letter projection the player marks.
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

## What was done

Subsets alone; Crossing and Ascent are filed as `describe-crossing-and-ascent`.
The scaffold's 31-bit worry was false: Subsets is only ever dealt four
letters, so a set is a mark value from 1 to 16, its letters read by the new
`bits(n)`. The description states nine techniques, eight at Easy and
`bigger` at Normal. Each has a planted defect that comes out unsound at
order 3. Eight are proved sound in seconds. `onlyCell` was not proved whole
in its two minutes and held on 48 boards, so it is recorded `held`. The hint walks the compiled ladder from the player's own marks
(`ladderWalk`), and every hand-written rung and `SweepOffers`, its last user
gone, are removed. A board with no answer now validates as `invalid`.

Measured 2026-11-09, 100 seeds a tier against HEAD: the boards dealt are the
same, and 400 of 400 tier verdicts agree. Deals take 0.9 ms at Easy against
HEAD's 0.8, and 3.8 ms at Normal against 3.6. Every hint walk ends on the
same answer, in fewer steps (4,379 against 4,490 at Easy) and with fewer
rule-outs (199 against 310). Most hidden singles become collapses, since the
walk settles each cell as soon as its sets agree. No save or link changes.

## What Signpost learned that binds here

The lessons in `describe-subsets-crossing-ascent-and-signpost`'s proposal
and its predecessors' bind here, and these:

- **A value that names a cell fits the mask where a number does not.**
  Signpost's link is how far along its arrow the next square lies, plus one,
  and the answer's `to` says which square that is; its numbers are then read
  off the chains (`|chain(c)|`). It still capped a side at 31, a link being
  a distance; a neighbor's direction would not.
- **A chain read on the marks is kept, every cell's at once**, while the
  placements stand: `|chain(c)|` and `x in chain(c)` are lookups. Before
  that, and before a definition over chains was kept by placement, a 6×8
  deal cost 80 times HEAD's; after, 17 times. Profile a deal before
  restating a technique, and count a chain as the loop it is.
- **State a set outward from the square that owns it**: the squares whose
  arrows reach `j` read as each direction and distance from `j`, not as
  every square tested for reaching it.
- **A bound over an empty set reads none**, and an arithmetic on none is
  none: Signpost's room before the 1 was stated as a `max`, read −1, and let
  a square link into the 1. State a room as the `min` of the gaps, so an
  empty set leaves it unbounded.
- **Compare the search's budget, not only the verdicts**: Signpost's deals
  moved on Unreasonable because the stronger ladder left the search less to
  do, every board's least budget lower; HEAD's boards under both ladders
  showed it.
