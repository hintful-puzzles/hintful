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

## What was done

- **The split**: Tents taken, Tracks filed as `describe-tracks`, which files
  step 11 when it is archived. Tents adds less: a cell mark naming a tree,
  and a matching of tents to trees.
- **The language**: `matched(A, B)`, a rule that the cells of `A` and `B`
  pair off one to one side by side, and `paired(a, b)` for a mark's
  `means`, which the checker reads as the rules' witness pairing.
- **Tents is described** (`tents.description.yaml`): nine techniques, Easy
  and Normal as the menu names them, all sound at order 3 with every plant
  unsound. The solver, the generator's grading and the hint run the compiled
  ladder. The hint keeps its link meta-rung, which draws a link only where a
  technique then fires, over the compiled link techniques. Completion is the
  description's answer check, a square left open read as grass.
- **An engine bug the walk found**: a compiled technique handed its reason a
  set that was the buffer its next binding refills, so a reason kept past
  that binding changed under it (Tents' `treesDone` came out with no squares,
  and the hint drew links nothing used). The compiler now copies a set into
  the binding; every compiled game is regenerated.
- **A completion bug the walk found**: the answer check first wanted every
  open square marked grass, which HEAD never asked. Fixed, and a test holds
  it.
- **Compared with HEAD**: the frozen differential against upstream's C
  passes. Over 10 deals a preset (60 boards) no board or verdict differs;
  deals take 0.40× HEAD's time and single solves 0.37×, 13x17 Easy at 10 ms
  mean against 28. At 20x20 deals take 0.4× HEAD's (1.0 s against 2.3–2.7 s
  for the slow seed). A 30x30 Easy seed gives up after 10,000 tries on both
  sides: both solvers were run on each of its 2,000-odd candidate boards and
  no verdict differs. Hint walks on 48 boards (8 a preset) all finish on
  both sides, 2187 steps against 2186, within 9 of HEAD's on each; the first
  step is the same on all 48. Per technique: line counts 699 against 725 and
  their neighbors 91 against 110, as the ladder reads rows before columns
  (the space's order), so a hint now often counts a row where HEAD counted
  a column; nextToTent 692/667, treeSingle 516/490, treeDiagonal 35/43,
  links drawn 12/9. A first plan is 0.4× HEAD's time at 13x17. The desc
  format is unchanged, so every save and link loads.
- **In Chrome**: the spec's 8x8 Normal board walks to the finish in 46
  hints; its third step hatches the second column and rings the squares
  beside it, as the spec says; completion flashes and the Hint button
  disables.

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
