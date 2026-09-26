# Design notes: shorten-the-untangle-endgame

D1–D7 are the scaffold's findings; D8 is what was built, and where it overturns
an earlier section it says so.

Everything in D1–D7 was measured on 2026-09-26 against the hint at `fbd8490c`, with
the prototype in `reference/`. Timings were taken at load average 10–19 on the
development machine, so they are upper bounds; the ratios are what to trust.
Re-measure before designing against any of them.

## D1. Where the moves go

The owner's board, `20#343769d2db4f418cccd3b79e00c975d0` (a seed ID, so `aux`
is present), following the current hint one step at a time. Board totals after
each move:

| Moves | Crossings | What happens |
|---|---|---|
| 1–13 | ~170 → 8 | each step removes the most crossings any single move can |
| 14–31 | 6–10, then 0 at move 31 | stall-breaking steps add crossings, the next step takes them back |

The owner took the same board to move 15 by hint, then finished in 5 moves: 20
in total. **The opening is not the problem, the endgame is.** Any work on the
opening (see D6) is secondary.

A second owner board, pinned as a description in `untangle-hint.test.ts`
("never spends a stall-breaking move on a point with nothing to untangle"),
shows the same shape: solved at move 35, with a long tail of small back-and-forth
moves.

## D2. Why moving only crossing points cannot finish some boards

At move 13 on the owner's board, **a single point touches all 8 remaining
crossings**, the smallest possible culprit set. Yet no set of up to 7 points
drawn from the points of crossings could be re-placed so that the board ends
untangled. That held with the clearance limits nearly off (point gap 0.1, line
gap 0.03 point-spacings) and a 48×48 grid. So the obstacle is topological, not
a matter of room.

The explanation: part of the board is untangled locally but **flipped**
relative to the rest. Points in that part cross nothing, but they are on the
wrong side of their neighbors, and no placement of the crossing points can fix
that. A person sees it and moves the flipped part; the owner's 5 moves were
points at the top that were in no crossing.

## D3. Detecting the flipped part: neighbor order

A 3-connected planar graph has one crossing-free embedding up to mirroring
(Whitney). So around each point, its neighbors must appear in one circular order
(or its reverse, for the mirror). Compare each point's current circular order
of neighbors (by angle) with the solved layout's, for whichever mirror
agrees more. A point that disagrees must move eventually, crossings or not.

On the owner's board, wrong-order points along the walk:

| Move | Crossings | Wrong-order points |
|---|---|---|
| 8 | 27 | 8: `0,3,4,6,8,10,11,18` |
| 11 | 11 | 7 |
| 12 | 9 | 5 |
| 13 | 8 | 3: `0,3,10` |
| 15 | 8 | 5 |

**Caveat for the implementation:** generated graphs are not always 3-connected
(degree ≤ 4, greedy fill; points of degree 1 or 2, cut vertices and separation
pairs all occur). Where the graph is not 3-connected, parts can legitimately
flip, so a wrong order there is not proof that a point must move. Either
restrict the check to vertices of 3-connected components (an SPQR tree is the
principled tool; probably overkill), or treat a wrong order as a *candidate*
for the culprit set rather than a mandatory member (the prototype made it
mandatory).

## D4. What the prototype showed, and why it is not shippable

The endgame: culprits R = (a minimal set of points touching every crossing
pair) ∪ (wrong-order points). Then re-place R one point at a time, most
constrained first. Each point goes to a grid spot where its lines to the settled
points cross no settled line, clear of points and lines, backtracking over up
to 6 spots per point and 3000 nodes. The culprit sets are enumerated by
branching on a crossing pair's four endpoints, sizes 0–6, 40 sets per size, and
|R| ≤ 8.

- **Owner's board: 20 moves** (from 31), firing at move 14, the same count as
  the owner. From move 13 it finishes in 7 moves; from move 15 in 6.
- **Population, 24 boards** (n = 10, 20, 25; half from the generator's circle
  with `aux`, half scattered at random without), under the policy "try the
  endgame at every request when there are ≤ 30 crossings, else the current
  hint":

  | n | current hint, avg moves | endgame policy, avg moves | move the endgame first fired |
  |---|---|---|---|
  | 10 | 6.6 | 7.4 | 0–1 (fires immediately) |
  | 20 | 31.0 | 32.1 | 13–35 |
  | 25 | 50.9 | 50.9 | 36–53, once never |

- **Cost: up to 30 s for one request** (n = 10, where it fires from the start
  with a large R), and 11–14 s at n = 20 and 25.

Why it helped only the owner's board:

1. **It fires too late.** Early on the wrong-order set is large (8 at move 8),
   so R exceeds the size cap and the endgame is skipped.
2. **Grid placement is both slow and weak.** A grid spot can miss the only
   region that works, and backtracking over grid spots is what costs seconds.
3. **At n = 10 it made things worse**: firing from the start with a large R and
   greedy spot choices does worse than the plain hint's opening.

The fix for 2 is the heart of this change: **place by face**. The settled
drawing is crossing-free, so it divides the box into faces. A culprit whose
settled neighbors do not all lie on one face's boundary cannot be placed yet.
If they do, the feasible spots form a region inside that face, from which each
neighbor is visible. Enumerating the faces (few) instead of grid spots (576),
and choosing a roomy point inside the visible region, should make placement
both complete (it cannot miss a feasible face) and fast (milliseconds).
Backtracking then runs over faces, and the culprit search can afford larger R,
which addresses 1.

## D5. Explaining an endgame step

The hint's sentences may state only what the player can see (owner,
`explain-untangle-hints`). Candidates, all to be checked with the owner:

- First culprit step: "Every remaining crossing involves one of these 3 marked
  points. Moving this one here clears its lines." Checkable: every red line
  touches a marked point, and the move's lines are black afterwards. It needs a
  new highlight marking the culprit set.
- A wrong-order point in no crossing is the hard case. Its reason (its
  neighbors go round it the wrong way) is true but hard to see. Something like
  "…this part of the board is flipped, so its crossings can't clear until this
  point moves" makes a claim the player can only partly verify. Decide with the
  owner; the fallback is to narrate it by what its move frees, as the current
  stall-breaking step does.
- Counts stay numerals, and every sentence stays under the 120-character ledger
  (`explain-untangle-hints` design D3a).

## D6. What did not help (don't retry without a new reason)

- **"Balloon" tie-breaks** among moves that remove equally many crossings:
  crowding minus twice the distance from center, or pure distance from center.
  Average moves over 10 boards each: n = 10 base 10.1 / blend 7.9 / outward
  9.7; n = 20 31.2 / 29.5 / 30.5; n = 25 46.0 / 47.3 / 48.2; owner board 31 /
  31 / 37. That's noise. A tie-break cannot fix an objective that only looks
  one move ahead. The owner's "move it toward the diametrically opposite side"
  is already covered: the spot search spans the whole board.
- **Two-move lookahead as the stall breaker** (`explain-untangle-hints` design,
  "Declined"): slow and still incomplete.

## D7. Theory

Finding the fewest vertex moves that untangle a drawing is NP-hard (Goaoc,
Kratochvíl, Okamoto, Shin, Spillner, Wolff, "Untangling a planar graph",
Discrete & Computational Geometry, 2009; cited from memory, verify before
quoting). So the endgame is a heuristic, and the bar is "about as many moves as
a person", measured on the pinned boards and a population, not optimality.

## Constraints to keep

- Following hints must still end solved from any position, and a plan
  recomputed after any step must not cycle (`explain-untangle-hints` design D3:
  placed points frozen, orientation by most points placed). An endgame plan
  that fails partway must fall back to the current machinery, not refuse.
- Every count is exact and in the board's own pairing (`hint.ts`
  `crossingsAt`).
- A request should stay around 300 ms on the desktop at n = 25 (the current
  worst case), since a phone is several times slower.

## D8. What was built, and what it measured

`src/games/untangle/endgame.ts`, called first by `deduceUntangleHintPlan` once
30 or fewer crossings are left. Measured 2026-09-26 on the same owner boards and
the same 24-board population as D4 (the prototype's seeds), following the hint
two ways: whole plans, as the app does, and recomputing after every step, as
`hint-resume.test.ts` does. The machine was swapping (about 0.7 GB of 19 GB
swap free) at load average 4–15, so the timings are upper bounds.

| | before | whole plans | recompute each step |
|---|---|---|---|
| owner board (owner: 20) | 31 | 21 | 29 |
| second owner board | 35 | 22 | 21 |
| n = 10, average | 6.6 | 5.4 | 6.0 |
| n = 20, average | 31.0 | 26.5 | 27.9 |
| n = 25, average | 50.9 | 47.4 | 49.1 |

Requests averaged 79 ms, the worst 289 ms.

**Journeys, not only a finish (overturns D4's shape).** A full-board finish
multiplies the choices for separate knots together. At n = 25 the crossings fall
into groups that share no point, so each group seeds its own culprit sets, and a
journey succeeds when none of *its* points' lines crosses anything. It is
finishing if its culprits touch every crossing, and partial otherwise. One leaf
test covers both: no crossing has a culprit at an end.

**Neighbor order is a guide, not a mandate (settles D3's caveat).** On the
25-point boards the wrong-order set was 8–15 points on boards a few moves from
solved, and it swapped to roughly its complement between consecutive moves: on
graphs that are not 3-connected, it mostly flags legitimate alternative
embeddings. Making it mandatory, as the prototype did, pushed every set past the
size cap. It now only ranks sets: a set is ordered by the points it adds
*beyond* the wrong-order ones, then by size.

**Growing a failed set.** When placement fails, the culprits that had nowhere to
go name the fix: moving one of their neighbors is what opens room. So the set
is re-queued grown by each neighbor of its two most-stuck culprits. On the
owner's board at move 13, point 10 had to see points 4 and 15 on opposite sides
of a drawing that reached the frame on both; no hitting set could place it, and
the working set added point 4 for room.

**Placement by face, as built (refines D4).** A face is named by the wedge at
one settled neighbor that the line to the spot leaves through; each face offers
up to 3 spots, well apart, with every face's best tried before any face's
second. Three findings:

- The grid could not be dropped for points with two or more settled neighbors
  (a spot seeing them all can lie far from all of them), so it stays at 16×16,
  beside samples in each neighbor's wedges.
- **Fail-first ordering** decided it: placing the culprit with fewest options
  next, and failing the branch as soon as any culprit has none. Before it,
  placement of {3, 12, 24} on a 25-point board failed every time; after it, it
  succeeded at once.
- A **pull toward the settled neighbors' center** in the spot score. Without it,
  roominess alone sends each culprit to the emptiest corner, where it walls in
  the ones after it. On the owner's board at move 14 that took 5–22 times the
  work, depending on grid size, and gave 6–7 moves against 5–6 with it.

**A culprit left where it is (a defect found in the app's frames).** At first a
staying culprit was checked at a tenth of the line gap everywhere, and a new
line to a *moved* neighbor then ran straight through another point. Now only
lines and points the search has not moved get the relaxed gap.

**Termination.** Three cycles were seen on the way, each with the hint
recomputed after every step, and all from journeys that could start by adding
crossings or by moving a point on its solved-layout place. The rules that
remove them: a journey's first leg always cuts crossings and never moves a
placed point, and a partial journey moves no placed point at all. Then every
executed step, of any kind, either places a point or cuts crossings without
unplacing one, and the (placed, −crossings) potential of `explain-untangle-hints`
holds. Only a finishing journey moves a placed point, after its first leg, and
it ends solved. Freezing placed points in *every* journey also terminates, but
it cost the owner's board 4 moves (20 → 24, measured before the pull above
existed), because the flip there needs a point the stall-breaking step had just
placed.

**The budget.** Work is counted in candidate spots tested, so the same board
gets the same hint on every machine. At 400k (then 131 ms average, 492 ms
worst) the owner's board and the n = 20 average improved by 1.5 moves at most.
A budget ten times larger, with sets of up to 11, took n = 20 to 23.6. It also
raised the worst request to 14.6 s and cycled one board, before the termination
rules above existed. 200k is the setting.

**What is left: a mirrored cluster.** The n = 25 walks still thrash, mostly on
boards where a whole cluster of about ten points is mirrored against the rest
(the wrong-order set is exactly that cluster). No journey of up to 8 points
unflips it, and none of up to 11 did either. A person would move the cluster
bodily. A journey that re-places a whole cluster by a reflection of its current
positions, checked like any other journey, is the direction to try next.

**Narration (D5, decided in the app, owner acceptance pending).** The first leg
reads "Moving the 6 marked points clears every crossing. This one first: it
cuts its crossings from 6 to 5.", or "…clears every crossing they are in." for a
partial journey. Later legs read "The next marked point: …" and "The last marked
point: …". Each is checked against the board's own count in
`untangle-hint.test.ts`. A leg may say its crossings rise: that is true on the
board, and the first leg has said what the whole journey does. A point in no
crossing is narrated like any other ("its lines stay clear"); D5's "flipped"
sentence was not needed, because the count sentence is true and the journey
sentence carries the reason. A one-leg journey is narrated as an ordinary
clearing step. The marked points still to move wear a ring in the hint color,
drawn on the point, not on a crossing.

**Test cost.** Checking every leg's claims made the follow-hints test 10.1 s →
38 s on four seeds per configuration, and Untangle's slices of the cross-game
guards 6 s → 18 s. The per-commit test now runs two seeds of every size and kind
of start (17 s), and the slow tier all four. One firing position, where a
partial journey would otherwise unplace a point, is pinned as positions: the
per-commit seeds do not reach it.
