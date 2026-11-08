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

## What was done (2026-11-08)

- **The split**: Pearl alone. It needed only the square tiling's edges and
  cells, which Net brought. Tracks needs cell marks beside edge marks, the
  board's border edges, a path between two given slots, and the walk's
  prerequisite and fallback roles; Tents needs links between cells, a
  matching, and its link meta-rung. They are filed as
  `describe-tracks-and-tents`, which files step 11 when archived.
- **Pearl's ladder is `pearl.description.yaml`**: a square read off its own
  edges, a black pearl's turn (its own technique, one axis at a time), its
  run-on and the run-on it cannot take, a white pearl that cannot turn and
  one that turns opposite, and a closed loop, at Easy; an edge or a way
  through a square that would close a loop early, at Normal. A square's ways
  through are a filling of its edges, so the ladder's only state is the
  edges, and the hint's recording pass, which reset the squares' shapes from
  the edges before each firing, is gone (`docs/hints-marks.md`). The hint,
  Solve, the generator's grading and `status` (the compiled answer check)
  run it; the hand-written rungs are removed. All nine techniques check
  sound and each plant comes out unsound (`results-describe-pearl.txt`; the
  two white-pearl plants need order 4).
- **The language**: `space: { tiling: square }` says a description holds on
  the square grid alone, and the checker then proves it on the square
  tilings only. Pearl's facts about a turn are false on a triangle or a
  hexagon.
- **A bug the HEAD walk comparison found**: `whiteTurnsOpposite` fired on a
  black pearl beyond the white one and drew a black pearl's run-on, which the
  narration refused. The technique now asks that square be able to run
  straight, as the hand-written rung did; the checker passed both versions,
  since both are sound. A soundness check cannot see a technique that fires
  where the hint has no words for it, but a walk can.
- **Tier names**: the description first named Normal "Tricky", and nothing
  caught it. Twelve other described games name their tiers apart from their
  menu, some legitimately (the search tier, the Latin games' own scale); the
  engine fix is filed as `name-a-games-tiers-once`.
- **Compared with HEAD**: the frozen differential against upstream's C
  matches byte for byte. Over 10 deals a preset at both tiers (120 boards)
  no board or verdict differs; deals take 1.19–2.31× HEAD's time, 1.25×
  overall, the slowest 10x12 Easy at 870 ms mean and 1.9 s worst (HEAD 731
  ms and 1.6 s). A single solve takes 2.2× HEAD's. Hint walks on 48 boards
  (6x6 to 10x10, both tiers) all finish, within 3 steps of HEAD's each and
  20 more in all; each technique fires as often as HEAD's rung give or take
  a few, and the first step differs on 33, as the ladder now reads every
  plain square before a black pearl. The desc format is unchanged, so every
  save and link loads.
- **In Chrome**: the board that crashed the hint (`8x8de:BaWjWWWbWaBaWdBdWfWgBbBhBBaWa`)
  is walked to the finish; a freshly dealt 10x10 Normal board is too, with
  its early-loop steps ringing the stretch of line; completion shows; the
  help reads the edited loop paragraph.

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
- **A technique that reads connectivity runs whole** after every firing,
  and that is where Net's large Unreasonable deals went past the bar. The
  engine fix is filed as `rerun-connected-techniques-only-where-a-firing-reached`.
  Where a game here is slow on those techniques, measure it and add it to
  that change; do not work around it in the game.
- **A set past a few dozen elements is the cost to watch**: `union` and
  `minus` switch to a `Set` past `SMALL_SET` in `describe-runtime.ts`;
  membership tests inside a quantifier are where a solve spent its time.
