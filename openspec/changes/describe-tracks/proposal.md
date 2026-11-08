# describe-tracks

**Status: filed by `describe-tracks-and-tents` (2026-11-08)**, which took
Tents alone. It is the last of step 10 of `describe-the-whole-catalog`'s plan
(`design.md` § "The plan"). When it is archived, it files step 11,
`describe-the-remaining-number-games`.

## Why

Tracks runs a hand-written ladder (`src/games/tracks/solver.ts`,
`tracksLadder`). A description states the rules and the reasoning once, and
the checker proves each technique sound.

## What Changes

- **What Tracks reads** is added to the description language, the ladder
  runtime and the checker. Pearl's split found these (2026-11-08; re-check
  them): Tracks marks cells (track or no track) beside its edges, reads the
  board's border edges and the two slots the track enters and leaves by,
  joins those two slots by one path, orders its rungs with the walk's roles
  (`update-flags` is a prerequisite, `check-loose-ends` a fallback), and reads
  the parity of the track crossing a bridge (`check-bridge-parity`).
- **The ladder is stated**, with its tiers as it grades them and named as its
  menu names them, and its hand-written rungs are retired.

## Acceptance

Tracks runs its compiled ladder for its hint and its generator's grading, and
its hand-written rungs are removed. Every technique is checked sound, each with
a planted defect that comes out unsound. The boards dealt, their tiers and the
hint walks are compared with HEAD, and each difference is reported, with which
saves or links no longer load. Large boards are timed back to back with HEAD.
The guides and help are updated and the running app is checked.

## What Tents learned that binds here

The lessons in `describe-tracks-and-tents`', `describe-pearl-tracks-and-tents`'
and `describe-net-pearl-tracks-and-tents`' proposals bind here, and these:

- **Compare completion with HEAD, not only the ladder.** Describing a game's
  answer check moves what "solved" means, and no ladder comparison sees it:
  Tents' first description wanted every open square marked grass.
- **A hint walk that ends early on one side is a finding.** Count the walks
  each side leaves unfinished before comparing step counts.
- **Read open squares as `blank`** where the board places a value from a
  clue, and read a mark with the value it sits beside: the checker's marks
  need neither.
- **A deal that gives up is compared candidate by candidate**: the generator
  draws the same boards, so run both solvers on each and stop at the first
  verdict that differs.
