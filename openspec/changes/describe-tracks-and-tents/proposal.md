# describe-tracks-and-tents

**Status: filed by `describe-pearl-tracks-and-tents` (2026-11-08)**, which
took Pearl alone. It is the rest of step 10 of `describe-the-whole-catalog`'s
plan (`design.md` § "The plan"): Tracks and Tents. Split at the start by
what each game adds to the language, take the first, and file the other. The
last of them files step 11, `describe-the-remaining-number-games`, when it
is archived.

## Why

Tracks and Tents each run a hand-written ladder. A description states the
rules and the reasoning once, and the checker proves each technique sound.

## What Changes

- **What these games read** is added to the description language, the
  ladder runtime and the checker. Pearl's split found (2026-11-08, re-check
  it): Tracks marks cells as well as edges, reads the board's border edges,
  joins two given slots by one path, and orders its rungs with the walk's
  prerequisite and fallback roles; Tents links cells, reads a matching of
  tents to trees, and has a link meta-rung.
- **Each game's ladder is stated**, with its tiers as it grades them and
  named as its menu names them, and its hand-written rungs are retired.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's grading,
and its hand-written rungs are removed. Every technique is checked sound,
each with a planted defect that comes out unsound. The boards dealt, their
tiers and the hint walks are compared with HEAD, and each difference is
reported, with which saves or links no longer load. Large boards are timed
back to back with HEAD. The guides and help are updated and the running app
is checked.

## What Pearl learned that binds here

The lessons in `describe-pearl-tracks-and-tents`' and
`describe-net-pearl-tracks-and-tents`' proposals bind here, and these:

- **Walk the hint on dealt boards against HEAD before trusting the
  checker.** A technique can be sound and still fire where the narration has
  no words for it (Pearl's white pearl that turns opposite fired on a black
  pearl). Run both hints to the finish on a few dozen boards a preset and
  compare the step counts and each rung's total.
- **Say where a description holds.** `space: { tiling: square }` keeps the
  checker to the square tilings; a fact about a turn or a straight is false
  on the others.
- **A library name cannot be a definition's** (Pearl's `lines` became
  `drawn`), and a definition's own fill may be clearer than a shared one
  where a hoisted clue narrows a type.
- **Name the tiers as the menu does.** Nothing checks it yet
  (`name-a-games-tiers-once`).
- **A shape a square can take is a filling of its edges**, so a ladder
  whose only state is the marks the player makes needs no reset pass
  (`docs/hints-marks.md`).
