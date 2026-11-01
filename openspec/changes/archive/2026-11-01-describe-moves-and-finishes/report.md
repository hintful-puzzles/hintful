# Report: moves and finishes described

Measured 2026-11-01 against `7d67b1a8`.

## Deals and hint walks

A trace dealt four boards of every preset of Sixteen, Fifteen and Twiddle,
and of a few custom shapes (Sixteen 5x3, 3x5m3, 4x4m0; Fifteen 2x3, 5x4, 3x3;
Twiddle 5x3, 3x5n3, 4o, 4n3o, 5n3o, 3m5, 4r, 4ro), 132 deals in all. It
walked each one by the hint's first step, up to 400 steps, recording each
step's rung, move and plan length. It ran on HEAD in a scratchpad worktree
and on the working tree. The two traces, 12,068 lines each, are
byte-identical. 124 walks end solved. The other 8 (Twiddle 6x7n4 and
4x4n3o) stop at the 400-step cap on both trees.

Before the games were moved onto the compiled rules, a throwaway comparison
played random moves on random positions of each game and found the compiled
`play`, `finished` and `deadEnd` the same as the hand code on every one.
Every existing test and snapshot of the three games passes unchanged. That
includes Twiddle's pinned hint render and Fifteen's render snapshot.

## Saves and links

The descriptions, params and move encodings are unchanged, so every save and
link loads. Fifteen still refuses an unfinishable description at load, which
was checked in the app.

## Dead-end claims

`research/technique-check/results-dead-end.txt` has the per-world counts.
The claims and their verdicts:

- **Sixteen parity** (w and h odd): sound. It holds of every one of the
  181,440 unfinishable 3×3 positions. Every other world checked can finish
  from anywhere, so the claim misses nothing.
- **Fifteen parity**: sound. It holds of exactly the unfinishable half of
  every world, so it misses nothing. The generators rely on that
  completeness when they swap two tiles.
- **Twiddle colorOdd, parity, colorTurned, turnSum**: sound. They are not
  complete: some worlds have unfinishable positions that no claim names
  (for example 1,436 of 3×3 n3's). Twiddle's generator deals by shuffling
  with real turns, so it relies on no claim, and no player sees an unclaimed
  position as an error. A world with no legal move (a block larger than the
  board) is skipped and listed.
- A planted unsound claim beside each game's own came out unsound in every
  case.

## Sixteen's planner keeps its own slide

`slide-planner` applies a slide in place, and its pruning is built on that.
The compiled `play` allocates a new position. Measured per slide:

| Board | compiled `play` | planner's in-place slide | planner's slide, allocating |
| --- | --- | --- | --- |
| 4×4 | 44 ns | 28 ns | 45 ns |
| 5×5 | 132 ns | 30 ns | 140 ns |

The cost is the allocation, not the compiled code. In the planner's inner
loop, the compiled slide would be 1.6× slower on 4×4 and 4.4× slower on 5×5.
The planner keeps its slide and takes its move list from the compiled
`moves`. `sixteen.test.ts` § "slides in the planner as the description says"
holds the two to agreement, and a planted reversed slide fails it.

## What was retired

- Twiddle: `doRotate` and `isComplete`. The turns, the finish and the
  solvability test are now the compiled rules, and the planner's generators
  are the compiled anticlockwise turns' effects (`moveEffect`).
- Sixteen: its hand-written slide in `executeMove`, its finish test, its
  `permParity` check and the hint's hand-built move list.
- Fifteen: `isCompletedTiles` and `parityP`. Its solver keeps upstream's
  greedy method and its 3×2 table, which read directions, not the move
  relation.

## The running app

These checks ran in Chrome against the dev server:

- **Fifteen:** a click off the gap's row and column is ignored. A one-tile
  slide that finishes the board flashes the win. A two-tile slide counts 2
  moves. An unfinishable link is refused at load.
- **Twiddle:** on an orientable board one turn from done, the hint fixes the
  turns and the game completes.
- **Sixteen:** on 4×4, three hint moves applied, and a row arrow slides the
  row one square right.

None of these showed a console error.
