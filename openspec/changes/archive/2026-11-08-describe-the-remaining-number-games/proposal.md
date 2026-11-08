# describe-the-remaining-number-games

**Status: filed by `describe-tracks` (2026-11-08)**, step 11 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"), the last.
Its session sized the six games and took Undead alone (task 1.1): each of
the others reads constructs of its own, and Undead's alone needed a new
geometry and a checker reading of it. The rest is filed as
`describe-subsets-crossing-ascent-signpost-and-pattern`, which, when the
last of it is archived, leaves `describe-the-whole-catalog`'s task 4 (the
engine's old layer, and the guard) next.

## Why

Undead runs a hand-written ladder (`src/games/undead/solver.ts`). A
description states the rules and the reasoning once, and the checker proves
each technique sound.

## What Changes

- **What Undead reads** is added to the description language, the ladder
  runtime and the checker: a sightline through a maze of mirrors from a
  border slot (`sight(s, M)` and its parts).
- **The ladder is stated**, its tiers as it grades them and named as its
  menu names them, and its hand-written rungs are retired. The forcing rung
  (Unreasonable) and the brute-force uniqueness check stay the game's own:
  each is a search.

## Acceptance

Undead runs its compiled ladder for its hint and its generator's grading,
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

## What was done

- **The language**: `sight(s, M)` is the cells seen from slot `s` through
  the mirrors a cell clue kind `M` deals, and `sight_direct`, `sight_bent`,
  `sight_twice` and `sight_exit` its parts, built once a board from the
  engine's `traceSight`, which the game's own path tracing now uses too.
- **Undead is described** (`undead.description.yaml`): `single` and
  `sightline` at Easy, `total` at Normal. `sightline` strikes every value of
  a square on a line that no filling of the line from the marks, within
  both clues and the monsters left to place, gives it. Upstream tries its
  paths fewest monsters first, then clockwise round the grid; Easy is
  bounded by three sightline passes, so that order is grading behavior, and
  5 of 180 deals moved until the description stated it (`round`,
  `ofRound`). `total` is stated before `sightline`, though Easy grades
  without it: the sightline strikes everything a count would, so stated
  after it no count ever fired, and the hint says the count first.
- **Checked sound**: `single` and `total` are sound at order 3, and
  `sightline` is held (not proved whole in its time, then asked on 408
  sampled boards with no defect); each technique's plant is found unsound.
- **The checker**: a sightline is read a step at a time, each way a line
  can stand (cell, heading, bent or not) under the guards that bring it
  there; walking every mirror layout whole, as `beam` is read, made
  298,240 ways at order 4 and ran z3 out of memory.
  `sightline.test.ts` holds the step-wise reading equal to the runtime's on
  every layout of a 3×3 and a 2×4 board, and fails with a planted error.
  A `fill` of more than 4,096 assignments is a z3 quantifier, one integer a
  member: the sightline's fill of nine squares listed 262,144 a binding
  and ran the JS heap out. **Two defects that read too little were
  found and fixed**: a binder over `range` held only the board's values,
  `0` to `top`, so a range past the order was cut short unseen (Bridges'
  `range(0, maxb)` at maxb 4 on a board of order 3; Seismic's `n in
  range(1, |cells(r)|)` on an area of four at order 3; Undead's slots); and
  `top` did not reach a domain ending at a sum of sizes (Bridges'
  `range(1, maxb + 1)`) or at a region's size (Seismic's), so worlds of
  three and four bridges, and Seismic's areas of four at order 3, left out
  answers. A pass over every game's queries, built and not solved, logged
  each range past `top`: Bridges, Seismic and Mines' `count` are checked
  again. `count` binds `size in range(0, 5)`, and had skipped sets of four
  clues at order 3 and of five at order 4; it is sound with them at order
  3, where its plant is caught, so the check stops there, and its order-4
  run of the 2nd stands for sets of up to four. Bridges is sound at every
  maxb as before, each plant caught; its `tooMany` at three and four
  bridges a line, now with its widest answers, outgrew the JS heap as one
  query and is checked a query per island and side (`CHECK_SPLIT=3`). With
  loops refused, `tooMany` is held: at maxb 2 and 3 on 61 and 144 sampled
  boards, but at maxb 4 the technique's ten minutes were spent before a
  board was asked, so that world goes unchecked; it was asked on 61 boards
  at HEAD, with the narrower domain. A plant one board of an order has
  caught is no longer asked on the rest, since its whole query outgrew the
  heap at maxb 3 too. Seismic is sound and each plant caught; with areas of
  four now holding a 4, its keep-apart mode is checked at order 3, where
  before no board had an answer. Dominosa's clue `range(0, n)` reads an
  unknown `n`, held to `top` as before, where no board of order 4 or less
  uses a full set past it.
- **Compared with HEAD** (20 deals a menu cell, 180 boards): every deal is
  the same, and so is its tier. Hint walks on 135 boards are identical
  step for step, 45 unfinished on both sides (the Unreasonable boards,
  whose forcing rung the hint never shows); status agrees at every position
  of every walk and on 1,755 random fillings; the frozen C differential
  passes. The desc format is unchanged, so every save and link loads.
- **Timed back to back**: hint walks take 0.55× HEAD's time. 6x8 Normal
  deals take 0.31× HEAD's (306 ms against 987 for 20); 6x8 Unreasonable
  1.13× (6,958 ms against 6,137), where the forcing pass reruns the
  compiled ladder once a supposition.
- **A census** (`undead-ladder.test.ts`) holds that every technique fires on
  dealt boards; capping every solve at Easy makes it fail on `total`.
