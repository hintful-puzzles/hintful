# count-loopys-smallest-penrose-boards

**Status: done (2026-10-06).** A follow-up from
`settle-the-cells-the-tier-walk-still-lists`.

## Why

That change made the tier walk start a field with no declared minimum at 1,
which brought Loopy's small boards into it for the first time. One cell gave
up: `3x3t12dn`, a 3x3 Penrose (rhombs) at Normal.

Counted 2026-10-06 under the generator's bounds as they then were, on a
loaded machine:

| cell | deals | boards | a run-out |
| --- | --- | --- | --- |
| `3x3t12de` (Easy) | 190,000 | all | |
| `3x3t12dn` (Normal) | 5 | 0 | 6 s |
| `3x4t12dn` | 5 | 0 | 6 s |
| `4x4t12dn` | 11 | 9 | 6 s |

A run-out there was ten patches of 10,000 boards each, so each of the two
empty cells was none in 500,000 boards over 50 patches.

## What the count found

**The tier follows the shape of the patch, and a small size draws few
shapes.** Each patch below was given 10,000 boards, and a shape is its faces,
edges, dots and each face's count of neighbors.

| shape | Easy | Normal | Tricky | Hard |
| --- | --- | --- | --- | --- |
| three faces around a point (both Penrose tilings) | all | 0 of 436 patches | all of 48,880 | all of 432 |
| four kites around a point | | 0 of 20 | all of 23,482 | 0 of 38 |
| five faces around a point | | all of 81 | all | 0 of 97 |
| six rhombs around a point | | all of 15 | all | 0 of 43 |
| every other shape drawn | | all | all | all |

The last row is 5x5, 7x7 and 10x10 on the Penrose tilings and 6x6 and the
presets on Hats and Spectres, some 80,000 patches. The tiers do not nest: the
three faces carry Tricky and Hard on the first board and never Normal.

**Four Penrose (rhombs) sizes draw the three rhombs and nothing else**: 3x3,
3x4, 3x5 and 4x3, over 100,000 patches of each. Those are refused at Normal.
No other size of either Penrose tiling is all one failing shape (widths 3 to 9
by heights 3 to 9, 20,000 descriptions a size), and Hats and Spectres have no
failing shape at their smallest size.

**The rest was the budget's split.** A patch that can carry the tier needed
489 boards at most and under ten at the median. One that cannot took all
10,000, up to 15 seconds, and only ten patches were drawn. At 4x3 Penrose
(kite/dart) Hard, 85% of patches cannot, so about one deal in five ran out. The
deal is now 200 patches of 500 boards: the same run-out, six seconds on the
three rhombs, and that cell deals in about half a second.

## What Changes

- `loopy/params.ts` refuses the four sizes at Normal, when dealing, with
  `noSuchTier`, and the size field's help says so.
- `loopy/generator.ts` splits an aperiodic deal as above (`PATCHES`,
  `PATCH_BOARDS`), with the count in its comment.
- `loopy.test.ts` pins the four cells with `describeAbsentTiers` and four
  cells beside them with `describeDealtTiers`. The kite/dart Hard one was seen
  red on the old split.
- **`Midend.paramsToFit` never turns a board to a size the game refuses to
  deal.** Found here: Penrose (kite/dart) is bounded on width alone, so a 4x3
  on an upright phone was turned to 3x4 and the player was told no Easy puzzle
  was found. The new refusals are uneven in width and height too (3x5 and not
  5x3). `midend-deal-orientation.test.ts` holds it, seen red.
- **A tier walk of some games keeps the other games' sections.** It had
  rewritten the tracked report with the one game.
- docs/games/solver-and-generator.md § "A size that cannot carry a tier" and
  docs/games/mechanics.md § "Portrait boards, and turning them to fit".

## What is left

- The three rhombs are also what a 5x5 Penrose (rhombs) deals one time in
  four at the other tiers: `deal-a-penrose-board-its-size`.
- The walk leaves 672 of Loopy's cells out as slow, none of them on an
  aperiodic tiling. Those are `bound-custom-sizes-by-their-deal`'s.

## What shows it worked

The walk for Loopy (`metrics/tier-walk.md`) lists no cell that gave up, and
no aperiodic cell as slow. In the app, a 3x3 Penrose (rhombs) at Normal is
refused in the Custom dialog with *"No 3x3 Penrose (rhombs) puzzle is
Normal."*, and a 5x3 deals five rhombs, unturned, on an upright screen.
