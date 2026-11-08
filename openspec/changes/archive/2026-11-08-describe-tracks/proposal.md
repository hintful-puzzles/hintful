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

## What was done

- **The language**: a mark on the cells may mean something of an answer on
  the edges (Tracks' `track`, `of: "2 - drawn(at) / 2"`), kept per cell by
  `CellMarks`' `markOn`; the checker reads `/` by a number the board fixes;
  and `cut_edges(E)`, the members of a set of edges whose two cells the set
  joins only through them, is one search (Tarjan's bridges) in the runtime
  and reach with each member left out in the checker.
- **Tracks is described** (`tracks.description.yaml`): eleven techniques,
  Easy, Normal and Tricky as the menu names them, each sound at order 3 and
  each plant unsound; `parity` is held (240 sampled boards, its whole proof
  past the budget once it read `cut_edges`). Upstream's hidden update-flags
  rules are definitions the techniques read (`on`, `off`, `shut`), so no
  firing restates what the board shows, and the plan's `showable`, the
  reasonless firings and the recorder on the board are gone.
  `check-single` is not stated: after update-flags it concludes nothing. The
  rule `ends` (a board deals two ends) is what made `closeLoop` sound: the
  checker found a lone loop answering a board dealt none. The `sharedFate`
  step that did both neighbors at once is two steps.
- **Compared with HEAD** (15 deals a menu cell, 180 boards): every deal is
  the same; HEAD's generator ran both solvers on each of its 6,233
  candidate boards, and none differs in its verdict, its grade, or how far a
  stalled solve got and which rails it laid, which is all the clue-laying
  reads. Every tier and every Solve is the same; status and the mistakes
  shown agree at every position of both walks. Hint walks all finish on both
  sides, 13,364 steps against 13,294, within 17 of HEAD's on every board,
  at 0.15× HEAD's time. Per step kind: `bothSidesLeft` 6351/6278, `clueFull`
  2090/2053, `onlyOneSideLeft` 1847/1799, `sharedFate` 1301/1323, `clueExact`
  1076/1133, `wouldCloseLoop` 548/469, `wouldStrandTrack` 24/112, looseEnd
  89/85, parity 38/41, `wouldFinishEarly` 0/1: the ladder tries a loop
  before a stranding, so a side both block is named a loop, and it reads
  rows before columns, so a hint often counts a row where HEAD counted a
  column. The desc format is unchanged, so every save and link loads.
- **Timed back to back** (20 deals a cell, alternating sides): deals take
  0.6 to 0.9× HEAD's at Easy and Normal from 10x10 up. 15x15 Tricky first
  took 2.2× (p90 810 ms, 2 of 60 past a second): a profile put 55% in
  `parity`'s walk a side. With `cut_edges` it is 0.57× HEAD's (60 deals: mean
  103 ms against 182, max 275 against 479). Bridges asks the same of a
  side in its `acyclic` rule; it is left as written, since only the answer
  check reads it, and rewriting it would re-check every "no loops"
  technique for no time a player sees.
- **A game ID with track off the grid away from A and B is refused.** The
  gate's near-miss IDs found two the described ladder finished while the
  game did not: the description has no edge off the rim, so it read such a
  square as finished without its stray rail. No generator writes one, so no
  dealt board or save is refused; HEAD showed such a board and could never
  call it solved.
- **Spec**: the requirements on hidden firings and reasonless rules are
  replaced by one that no firing concludes what the board decides; the
  first-step scenarios were false at HEAD too (it took a row of 8, not a
  column) and now name the rows.
- **In Chrome**: the spec's 8x8 Normal board's first hint hatches the sixth
  row, "Clue 8 is the length of this row, so every square in it must carry
  track", and following the hint finishes it with the completion dialog; a
  15x15 Tricky deal finishes the same way in 206 moves. The help quoted a
  hint sentence the game no longer says; it quotes the current one.
