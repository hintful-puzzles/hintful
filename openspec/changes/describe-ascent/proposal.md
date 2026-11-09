# describe-ascent

**Status: filed by `describe-crossing-and-ascent` (2026-11-09)**, which took
Crossing alone. It is the rest of step 11 of `describe-the-whole-catalog`'s
plan (`design.md` § "The plan"), the last. It splits again at its start if
the session finds it too large, filing the rest as it goes. When it is
archived, `describe-the-whole-catalog`'s task 4 (the engine's old layer, and
the guard) is next.

## Why

Ascent runs a hand-written ladder. A description states the rules and the
reasoning once, and the checker proves each technique sound.

## What Changes

- **What Ascent reads** is added to the description language, the ladder
  runtime and the checker. Re-check it against the game's solver before
  building it; a scaffold's "why this is hard" can be false (Subsets' "past
  31 bits at five letters" was: it is only ever dealt four). Read
  2026-11-09: a number per square up to the board's cell count, past the
  candidate bitmask's 31 bits, hexagonal tilings, adjacency by ruleset,
  walls, the Edges mode's arrows, and the path's reach (`solverUpdatePath`
  and its kin), over four tiers. Signpost met the same bound with an answer
  whose value names a cell (`to`, and `chain` along it); a path's step to
  its next square is a neighbor, so the same reading may fit Ascent with no
  cap on its size. Weigh it first.
- **The ladder is stated**, its tiers as it grades them and named as its
  menu names them, and its hand-written rungs are retired, with the hint's
  own readings (`hint.ts`, `hint-edges.ts`, `premises.ts`) where the
  compiled ladder's firings replace them.

## Acceptance

Ascent runs its compiled ladder for its hint and its generator's grading,
and its hand-written rungs are removed. Every technique is checked sound, each
with a planted defect that comes out unsound. The boards dealt, their tiers,
completion and the hint walks are compared with HEAD, and each difference is
reported, with which saves or links no longer load. Large boards are timed
back to back with HEAD. The guides and help are updated and the running app
is checked.

## What Crossing learned that binds here

The lessons in `describe-crossing-and-ascent`'s proposal and its
predecessors' bind here, and these:

- **A hint whose ladder narrows marks must aim its narrowing.** Walked as a
  fallback, Crossing's `narrow` wrote 4.7 times HEAD's note steps: it noted
  whatever continued from the last step. Run ahead on a copy, then traced
  back from the placement it reaches to the strikes that placement rests
  on, it wrote fewer than HEAD. If Ascent's hint writes marks ahead of a
  placement, measure its walks against HEAD before trusting a fallback.
- **Trace a placement's premise by fact, not by cell.** Kept by "writes a
  cell the placement reads", the trace kept almost every note; kept by
  "struck the digit that first ruled out a number it needs", it kept three.
- **Take a traced step again on the live marks**, so that the reasons it
  narrates are the board's as it is written, not the copy's.
- **`CHECK_GAMES` matches the `game:` field exactly**, lowercase. A wrong
  name checks nothing and passes in under a second, and on macOS its results
  file is the same file as the right one's.
