# deal-every-tracks-board: design

## D1. The failing preset is 15x15 Hard, not Tricky

The proposal names 15x15 Tricky. Re-running its seeds there, `pin-0` to `pin-99`
all dealt, as did 3,000 more under three seed spellings. A per-preset sweep of
200 seeds found the failures at **15x15 Hard** (11 of 200), and at that preset
the failing seeds out of `pin-0` to `pin-99` are exactly the proposal's seven.
The census that found them had mislabeled the tier.

## D2. Measurement (task 0.1)

Each `newDesc` attempt was counted by how it ended, 100 seeds at 15x15 Hard
(`pin-0` to `pin-99`), before the fix:

| attempt ended as | count |
|---|---|
| `boring` (a row or column with no track) | 366,853 |
| `singleOnes` (a 1 at an end, or two 1s in a row) | 10,718 |
| `addClues`: bare board "too easy" | 3,444 |
| `addClues`: never soluble | 99 |
| dealt | 93 |
| **total attempts** | **381,207** |

So `boring` dominates the attempt count, but it does at every preset: it is
96% of attempts at 15x15 Tricky too, and Tricky has no tail. What separates
Hard is the share of paths that survive the cheap rejections and then deal: 93
of 3,636 (2.6%) at Hard against about half at Tricky.

Attempts are independent, so the count is geometric, and with success rate `p`
the chance of exhausting the 10,000 cap is about `e^(−10000p)`. Per preset,
200 seeds each:

| preset | before: attempts/deal (max) | before: P(cap) | after: attempts/deal (max) | after: P(cap) | after: ms/deal p50 / max |
|---|---|---|---|---|---|
| 8x8 Easy | 20 (122) | 10^−228 | unchanged | | 2 / 25 |
| 8x8 Tricky | 43 (196) | 10^−103 | 28 (157) | 10^−160 | 3 / 23 |
| 8x10 Easy | 22 (153) | 10^−200 | unchanged | | 4 / 26 |
| 8x10 Tricky | 46 (253) | 10^−95 | 29 (153) | 10^−151 | 6 / 26 |
| 10x10 Easy | 31 (170) | 10^−143 | unchanged | | 6 / 19 |
| 10x10 Tricky | 64 (424) | 10^−69 | 39 (272) | 10^−112 | 10 / 38 |
| 10x10 Hard | 290 (1,195) | 10^−15 | 83 (515) | 10^−53 | 23 / 123 |
| 10x15 Easy | 58 (312) | 10^−76 | unchanged | | 16 / 67 |
| 10x15 Tricky | 126 (556) | 10^−35 | 70 (312) | 10^−63 | 28 / 83 |
| 15x15 Easy | 101 (782) | 10^−43 | unchanged | | 39 / 115 |
| 15x15 Tricky | 219 (1,637) | 10^−20 | 116 (782) | 10^−38 | 72 / 202 |
| 15x15 Hard | 3,500 (cap, 11 failed) | 10^−1.2 | 202 (1,279) | 10^−21.6 | 112 / 484 |

Timings are from a development machine at load average ~4 with memory in
swap, so they are upper bounds; the attempt counts do not depend on load.

## D3. The cause: a stalled bare board was graded as though it had finished

Before laying any clue, `addClues` solves the bare board and returns −1 ("too
easy") when `maxDiff < diff`. `maxDiff` is the highest rung that *fired*. On a
bare board that stalls, it says only that the solver ran out of facts before
a Hard rung had anything to do. That is a fact about how few clues there are,
not about the puzzle. A bare 15x15 board almost always stalls early, so nearly
every path was thrown away there.

Upstream history shows this was not the intended behavior. Before
`f8027fb` ("Tracks: make solver return max difficulty used", 2020), the check
was `tracks_solve(scratch, diff-1) > 0`, rejecting only a bare board that
*solves* one tier down. That commit's message describes a speed-up (one solve
instead of two), but `diff_used < diff` also catches the stalled case, and the
behavior changed with it.

**The fix restores the pre-2020 semantics:** grade the bare board only when
`ret > 0`. A stalled board goes on to clue-laying. The tier stays guaranteed
by the laying loop, which keeps a clue that finishes the board only if
`maxDiff` reaches the target. The strip pass then keeps the board soluble at
the target with fewer clues. Every board was re-graded independently in the
sweep above. At every preset, every board dealt solves at its tier with
`maxDiff` equal to the tier, and does not solve one tier down.

### Alternatives not taken

- **Raise the cap.** It keeps every board that deals today, but at
  `p ≈ 1/3,500` a cap with a safe tail is 50,000 or more. That turns a crash
  into a stall of many seconds on a phone, which the proposal ruled out.
- **Repair the path instead of re-laying it** (the proposal's suggestion, aimed
  at `boring`). `boring` is not what separates Hard, per D2. Fixing it would
  change every board at every preset, Easy included, while leaving Hard's 40×
  worse survival rate in place.

## D4. What changes for players, and what replaces the oracle

Easy cannot reach the changed branch (`maxDiff < DIFF_EASY` is never true), so
every Easy board is byte-identical. Above Easy, a seed deals a different board
when its deal met a stalled bare board before succeeding. Measured over 200
seeds per preset: 37–45% of seeds at the four smaller Tricky presets, 50% at
15x15 Tricky, 75% at 10x10 Hard and 96% at 15x15 Hard (13 of those 200 used to
throw).

Saves and `params:desc` IDs carry the board and are unaffected. **Seed IDs are
not.** The Share dialog's "Link to this game" is `params#seed` whenever the
board came from New Game, so a Tracks link above Easy that was shared before
this change opens a different board after it. The dialog's "by random seed"
link to Simon Tatham's site also shows a board different from the player's
for those seeds. The owner was asked with these costs stated and chose the
fix (2026-10-02). The upstream seed link is taken up by
`link-upstream-by-game-id-only`. (`teach-solo-cage-splits` reasoned that
"shared links carry the desc". That was wrong for the default link, but its
conclusion only cost 2% of Killer seeds.)

The frozen C differential (`tracks-differential.test.ts`) retires its desc
byte-match above Easy rather than re-recording it. Three of its seven fixtures
above Easy diverged (`tracks-trace-4`, `-5`, `-6`). The other four still match
only because their seeds never met a stalled bare board, which is not a
property worth asserting. Its grade half, where the TS solver grades C's
boards, still runs on every fixture. What replaces the byte-match above Easy is
`difficulty-contract.test.ts` § "deals boards that need the tier the preset
claims". It runs one preset per tier on the gate, and every preset on the slow
tier (run for Tracks, green). The seven seeds are pinned in `tracks.test.ts`
and graded at exactly Hard. With the old check planted back, all seven fail
with `RetryLimitExceeded`.

## D5. No other game shares the defect

The other generators with a "too easy" rejection (Bridges, Group, Keen,
Magnets, Unequal, Singles, Subsets, Pattern) all ask whether the board
*solves* one tier down, which is `solvableAtExactlyTier`'s shape. None reads a
stalled solve's grade. Found with `git grep -i "too easy"` and a grep for
`maxDiff <` across `src/games/`. The lesson is in
`docs/games/solver-and-generator.md` § "A tier means exactly its rung".
