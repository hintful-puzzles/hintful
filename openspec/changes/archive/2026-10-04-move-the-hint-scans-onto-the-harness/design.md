# Design: the hint scans, moved

## D1. The population, retaken, and what it cost

Taken three times, each by shape. The first key was a loop over seeds near a
hint call in a test file, and it was read by three agents, one a third of the
games. The second, after they reported, dropped the variable name from the
key (a loop that deals a board, asks for a hint or a plan, and leaves early),
and found three scans the first reading had missed because their loop
variable was `s` or `i`: Tents' `reach`, Subsets' collapse exclusion and
Sixteen's `animatingFrame`. Crossing's three `because` variants came out of
the same pass. So the proposal's list was a starting point and no more.

Timed before starting, on the hint-touching test files under `src/games/`
and `src/engine/hint-ordinal.test.ts` (110 files), summed per-test duration,
2026-10-04, load average 6 to 9 and about 21 GB into swap both times, so
upper bounds whose ratio is the usable part:

- before: 244 s
- after: 180 s

**57.7 s of the 64 s saved is one file.** `hint-ordinal.test.ts` was 57.8 s
and is 0.1 s. The per-game scans were cheap: all of them together account
for the rest, and several files moved by less than the noise between two
runs (an untouched file varied by 15 to 30 percent). What the per-game moves
bought is not time. It is that no hint test finds its board by walking seeds,
every pin says how many positions it rests on, and about twenty
`if (!found) return` holes after a scan now throw.

## D2. What the harness grew, and the game that asked

- **Moves as one string.** Galaxies has no desc for a mid-game board, so a
  late rung's pin is a board and up to a few hundred moves. As a literal the
  formatter spreads that over hundreds of lines, so the scan writes the moves
  as their JSON in one string and the loader parses it. The scan also reports
  the position fewest moves in, not the first found.
- **Dropping the moves a kind does not need was tried and removed.** On
  Galaxies it shortened pins by 10 to 30 percent: a ladder's late rung opens
  a plan only once every earlier rung is spent, so nearly every move is
  needed. Thirty lines for that was not worth keeping.
- **`opening`** (Keen, Mathrax, Rome, Solo, Towers, Unequal's mark-all;
  Mines' first click, whose pre-click desc and click reload to the same
  board).
- **`ui`** (Group's populate reading).
- **`stray`** (Pegs). A second line of play on each board, steered by the
  game. It reaches 14 of Pegs' 15 sentences. `trapSoonOwn` held on none of
  about 17,600 positions under two policies, so its pin keeps the earlier
  board and says so, which the requirement now allows for.
- **The scan asks with no `aux`,** as a pin is loaded. It used to pass the
  generator's answer and load without it, so a pin could be found under
  conditions it was never loaded under. Netslide's four scans, first left
  for needing `aux`, pinned once this was so.
- **A loaded pin is kept.** The harness's own test and the game's test both
  read each pin, and for a hint that plans by search that was the plan
  twice: Sixteen and Netslide were 6 s slower each until it was.

## D3. A solver firing is a kind that reads the board

Task 2.3 asked whether a firing with no step saying it belongs to the
harness or to a ladder census. Both, for different questions. A test that
wants *a board to assert a firing's content on* states the kind as a
predicate that ignores the step and asks the solver about the board, and the
test reads the firing back from the pinned state. Boats, Clusters, Crossing,
Pattern, Rect, Singles, Spokes, Sticks, Subsets, Tents and Unruly do. The
harness needed nothing for it. *Whether a rung fires at all on a corpus*,
with a ledger of the unreached, is `describeLadderCensus`'s question, and the
recorder censuses that assert an absence (Tracks, Undead, Loopy, Magnets,
Pearl, Solo, Group, Ascent) stay as they are.

## D4. What stayed, each with its reason at the site

- **A refusal is not a kind.** It has no step for the loader to return.
  Pegs' lost board is kept by hand.
- **A sentence that never opens a plan.** Rome's "This area now has", Salad's
  "The N just placed" and Slant's equivalence sentence are only ever a
  plan's second step: after the first is played, the recompute explains the
  square another way. Each is a `hintUntil` on a literal board with the
  count beside it. Tents restated the same case as "the opening firing has a
  leg that says it", which pins.
- **Kinds no scan reached.** Black Box's `hiddenBall` (0 of 32,561) and
  Net's upright-straight sentence (0 of 3,618) keep their boards, the count
  beside each.
- **Boards that feed a sweep.** Magnets' four descs and Bridges' three are
  walked whole by a sweep whose thresholds are about those boards.
- **Seed-named frames with no scan** now name the board the seed dealt, as a
  literal, with their snapshots unchanged as the proof.

## D5. The ordinal guard

`hint-ordinal.test.ts` searched every hinted game for a numbered chain on
every run, and most games have none. It reads one pinned position a game
from `testing/hint-chain-pins.ts`. Which games owe a pin is still derived:
`hint-quality.test.ts`'s length walk, the widest walk of hints there is,
fails on a numbered chain from a game with no pin. Both were seen red: Rome
with its pin taken away, and Keen with its ordinal draw disabled.

The scan found Rome (266 of 427), which the old roster of six had never
listed though the sweep reached it, and Group at 12x12 Hard (3 of 1,228),
which the old sweep's boards could not reach. Mathrax imports the drawing
helper and numbered no chain in 748 positions, so it has no pin, and the
walk will say so if that changes.

## D6. Tests that cover less, on purpose

A count-only test ("saw every sentence across these seeds") is what the
harness's own test now asserts, so those are gone: Black Box's, Crossing's,
four of Salad's and Map's per-arm tests. Keen's hidden-single narration was
asserted on the first match of up to six boards and is asserted on one.
Three assertions held only on the board the old scan happened to land on
(Bridges, Keen, Clusters); each kind was tightened to say what the assertion
needs, and the assertion kept.
