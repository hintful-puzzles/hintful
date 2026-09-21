# bridges-hint-cites-an-unwritable-cap — design

The owner chose shape 2 of proposal.md § "The decision": give the player the
notation, and let the hint write it as a step. The owner also chose the gesture
(D2) and asked that touch have a way to do it too.

## D1. The notation is the field the solver already wrote

Stage 3 has always stored its conclusion in the state's per-span maximum
(`maxh`/`maxv`), which `possibles`, `islandAdjspace` and `islandImpossible` all
read, and which a bridge drag already wraps at. So the player's "at most"
limit *is* that field. A new move op `C` sets it (`n` at `maxb` lifts it). The
hint's cap firing records that op and a reason, and nothing else in the
deduction changes: every later rung reads the same field it always read, now
set by a move the player can see.

A limit of none is the no-line cross. It keeps its own flag and op rather than
being folded into the field as 0, because every existing reader of the cross
(the drag's "no bridge over a no-line" check, `possibles`, the renderer, old
saves) would otherwise have had to change for no player-visible gain.

## D2. The secondary drag lowers the limit one step (owner's choice)

No limit, then each limit down to one, then the cross, then no limit. Every stop
claims less than the next, so a player following an "at most one" step, or a
cross step, never passes through a mark that is false. The rejected order (the
cross first) would have put a false cross on the way to every cap, and a hint in
progress reads that as the player going their own way. The cost the owner
accepted: on a `maxb` 2 board a cross takes two right-drags instead of one.

Over a bundle the limit stops at the bridges drawn and wraps to no limit without
reaching the cross; a full bundle with no limit has nothing to lower, so the drag
finds no far end. `executeMove` rejects a limit below the bridges drawn.

**Touch.** A finger held still for 350 ms is promoted to the secondary button by
`detectSecondaryButton`, and its drag follows, which is how touch players already
drew the cross. The limit rides the same gesture, so it needed no new control.
Confirmed in Chrome with `pointerType: "touch"` pointer events: three held drags
along one span gave `≤1`, the cross, then nothing.

## D3. The limit reuses the two stage-3 premises, with the limit as a value

A cap is argued exactly as the cross is: `limit + 1` bridges here would seal a
group off or starve an island. So `wouldSealGroup` and `wouldStarve` carry
`limit`, and the sentence reads the trial and the conclusion from it: "Two
bridges here would shut these 2 islands into a finished group of their own, so
at most one can run this way." At 0 the sentence is the old one, word for word.
The validator that refused is now read for every limit, not only for 0, which is
what lets the cap name its cause.

## D4. `findMistakes` reads limits, and the cross is one of them

A limit below the solution's count on its span is a mistake, and the cross is
the bottom of the same scale, so a wrong cross is now flagged too. Before, a
wrong cross was invisible to `findMistakes`, and the hint refused with the
unlocalized-contradiction wording. Now the span lights up and the hint says to
fix mistakes first. The unlocalized refusal keeps its one remaining case: an
island marked complete too early.

`mapClear` now resets the limits. It used to leave them because upstream's
maxima were only ever solver scratch. Once a limit can be the player's, a
from-scratch solve that kept one would solve the player's reading of the board
instead of the clues, and a wrong limit would make `findMistakes` report nothing.
The generator never reaches `mapClear` with a limit standing, so its boards are
unchanged (the differential holds). Solve lifts the player's limits, because the
solution is its bridges.

## D5. The guard compares boards, not premises

The census that found the defect re-ran each premise on a player's view. That
needs per-premise knowledge and a `Solver` export. The committed guard is
simpler and stronger: replay only the shown steps onto a player board through
the real `executeMove`, and before each shown step assert that the board the
deduction reasons from carries no bridge, cross or limit the player's does not.
It cannot know which sentence leans on what, and does not need to.

It runs over the hint test's corpus and the three pinned descs. Proved: making
`recordLimit` emit nothing fails it on pinned board 1 at step 8 (`needsThisWay`,
"limit at (1,0)"), the step confirmed wrong in the app.

## D6. The mark

`≤n` in the span's own color, on a background patch at the span's middle square,
drawn after the bars and the islands' rims so nothing covers it. The patch keeps
it legible over a bridge already running through the square. The hint's limit
takes `COL_HINT`. A wrong limit turns red with its span, because it takes the
span's color. The limit sits in the line descriptor's four free high bits (two
per direction), and the hint's limit in its own bits of the hint word, so both
are in the tile cache's diff key.

## Measurements (2026-09-21)

Census: every preset × 200 seeds plus the pinned descs (1,803 boards).
Unsupported shown steps: `exactSpace` 426 of 27,011, `needsThisWay` 419 of
2,355, `mustReachOut` 9 of 42, and none among `everyNeighbor` (6,184),
`wouldSealGroup` (204) or `wouldStarve` (43). 477 of 603 Tricky boards had at
least one. Negative control: not one step on an uncapped board was flagged.
Shape 3's cost, for the record: without the maximum rung, 153 of 603 Tricky
boards do not solve (control with it: 0).

## Found on the way

- The live `bridges` spec still said the hint ran "through one
  `runDeductionFixpoint` call", which went stale with
  `share-the-single-firing-driver`. The MODIFIED block here corrects it to
  `singleFirings`. That change's own delta was an ADDED requirement on
  `ts-engine`, and nobody re-read the `bridges` spec against it.
