# describe-crossing-and-ascent

**Status: done (2026-11-09), for Crossing alone.** Filed by
`describe-subsets-crossing-and-ascent`, which took Subsets alone, it split
again at its start: Ascent's constructs (numbers past 31 bits, hexagonal
tilings, the path's reach) are a change of their own, filed as
`describe-ascent`.

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

## What was done

- **A board clue's field may be a list** (`list: true`): Crossing's listed
  numbers are one `numbers` clue at the board, each a list of digits, read
  whole, by `|f(k)|` and by `nth(f(k), i)`. The checker deals each a length
  up to the longest line, members in range. A run is a `stretch` of the
  open squares; the matching is a rule (each run reads exactly one number,
  numbers distinct), so no new sort was needed.
- **The ladder is seven techniques at one tier**: `onlyNumber`, `onlyRun`,
  `sharedDigit`, `crossRuns`, `narrow`, and the checks `misread` and
  `twice`. All are sound, and each plant comes out unsound. Upstream's
  "square down to one digit" is not a technique: `sharedDigit` always
  covers it, and `onlyNumber` turns an emptied square into a contradiction.
- **`hint-solver.ts` is retired**; the plan reads the compiled firings.
  Where no placement shows, `narrow` runs ahead on a copy until one does,
  and only the strikes that placement rests on are written, traced fact by
  fact. On 70 Easy boards, 10 a preset, both solve all 70; the plan takes
  2,097 steps against HEAD's 2,110, 83 of them notes against 103.
- **Deals, tiers and completion are HEAD's**: `crossing-differential`
  matches the generator's boards, and `deal-compare` found no board or
  verdict that differs. No save or link stops loading.
- **Timed with HEAD on the same boards**, 6 deals a preset: deals take 2.2
  times HEAD's on the whole; 15×15 1.2 times (440 ms against 366), 9×11
  Unreasonable 3.8 times (515 ms against 137, at most 2.1 s). Two compiler
  changes got it there from 15 times: the answer check reads a definition
  kept for the board rather than inlining it, and a binder pinned by
  `value(x) = t` reads an index of the placed values. Both reach other
  games; `deal-compare` over the 17 whose modules changed, and the 7 that
  run the Latin library's `fish` through it, found no difference in a board
  or verdict, and times within HEAD's own spread (0.89 to 1.13 times).

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
