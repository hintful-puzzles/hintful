# deal-a-penrose-board-its-size

**Status: done (2026-10-07).** A follow-up from
`count-loopys-smallest-penrose-boards`.

## Why

That change counted the faces of a Penrose patch by size and found that a
small size is not a small board so much as a lottery. A patch is cut from a
random place in the tiling, and a good share of the cuts keep three faces
around a point, which is a board of seven loops. A player who asked for a 5x5
Penrose (rhombs) was dealt three rhombs one time in four, and eleven another
time. Upstream does the same: the patches match its fixtures.

## What a size promises

**A box, and a patch that fills it about as well as that box is usually
filled.** Counted 2026-10-07 (2,000 patches a size), the median face count of
both Penrose tilings from 6x6 to 12x12 fits 0.96 (w - 2.2)(h - 2.2): the box
less a border one unit wide, which the trimming takes. Hats and Spectres sit
within a fifth of it. So the usual count is `(w - 2)(h - 2)`, as arithmetic
and with no table of sizes, and a patch is far under its size at half of that
or less.

## What Changes

- `loopy/grid-build.ts` draws a patch again while it has half the usual faces
  or fewer, up to 400 draws, and then takes the largest it drew. Only which
  description is drawn changes: what a description builds cannot, since saved
  games and shared IDs carry descriptions. A seed deals another board at the
  sizes below and the same board elsewhere, and upstream's fixtures still
  match.
- **No size is refused, and none gives up.** A Penrose (rhombs) box 3 or 4
  wide stops growing with its length (6 faces at most, and 11), so a threshold
  alone would have ended those deals. They deal the largest patch drawn.
- **No tier is lost.** The tier follows the patch's shape, so every tier was
  dealt at every Penrose size from 3x3 to 9x9 and at the long sizes the rule
  changes most. Only the four cells already refused at Normal gave up.
- `loopy.test.ts` holds the redraw and the largest-drawn fallback, both seen
  red with the rule taken out.
- docs/games/solver-and-generator.md § "Unlucky, impossible, and load-bearing
  validation" has the case.

## The four sizes that are always three rhombs

3x3, 3x4, 3x5 and 4x3 Penrose (rhombs) are dealt as before. Their usual count
is 1 to 3, so three rhombs are not under it: they are what a box that small
holds. Refusing them would refuse sizes upstream deals and is the owner's
call; this change does not need it, and the recommendation was to leave them.
The owner agreed (2026-10-07): they stay dealt.

## What is left as it was

- **Sizes where the three faces are the usual patch keep them**: Penrose
  (rhombs) at 3x6, 3x7, 4x4 and 5x3 to 7x3 (nine patches in ten), and Penrose
  (kite/dart) at 4x3, 4x4 and 5x3 to 7x3 (15% to 40%, where no patch has more
  than 7 faces).
- **The face count is not the same turned.** 4x16 Penrose (rhombs) deals 11
  faces and 16x4 deals 14 to 21, though the tiling is marked as turning.
- **A box 5 or under on a side is still a wide spread** where it is long:
  5x16 Penrose (rhombs) is 22 to 42.

## What shows it worked

The spread of face counts, 2,000 boards a size, before (the first patch that
is not empty) and after, as lowest..highest and the share that are three
faces. Sizes not listed did not change: every size of both Penrose tilings
with both sides 7 or more, and Hats and Spectres at 6x6, 6x7, 7x6, 7x7, 6x10,
10x6, 6x16, 16x6 and 10x10.

| Penrose (rhombs) | before | three | after | three |
| --- | --- | --- | --- | --- |
| 3x8 | 3..6 | 97% | 3..6 | 0.1% |
| 4x5 | 3..8 | 83% | 6..8 | none |
| 4x6 | 3..11 | 76% | 6..11 | none |
| 4x7 | 3..11 | 63% | 6..11 | none |
| 4x8 | 3..11 | 55% | 7..11 | none |
| 5x4 | 3..9 | 78% | 5..9 | none |
| 5x5 | 3..11 | 27% | 5..11 | none |
| 5x6 | 3..13 | 10% | 7..13 | none |
| 5x7 | 3..18 | 1% | 8..18 | none |
| 5x8 | 7..21 | none | 10..21 | none |
| 6x4 | 3..12 | 66% | 5..12 | none |
| 6x5 | 3..16 | 12% | 7..16 | none |
| 6x6 | 8..19 | none | 9..19 | none |
| 6x7 | 8..25 | none | 12..25 | none |
| 7x4 | 3..14 | 58% | 6..14 | none |
| 7x5 | 3..17 | 6% | 8..17 | none |
| 7x6 | 10..22 | none | 12..22 | none |
| 8x3 | 3..6 | 87% | 5..6 | none |
| 8x4 | 3..14 | 50% | 7..14 | none |
| 8x5 | 3..21 | 3% | 10..21 | none |
| 4x16 | 3..11 | 33% | 11 | none |
| 16x4 | 3..21 | 25% | 14..21 | none |
| 5x16 | 12..42 | none | 22..42 | none |
| 16x5 | 5..46 | none | 22..46 | none |

| Penrose (kite/dart) | before | three | after | three |
| --- | --- | --- | --- | --- |
| 4x5 | 3..9 | 9% | 4..9 | none |
| 4x6 | 3..13 | 4% | 5..13 | none |
| 4x7 | 3..15 | 2% | 6..15 | none |
| 4x8 | 5..19 | none | 7..19 | none |
| 5x4 | 3..9 | 14% | 4..9 | none |
| 5x5 | 3..11 | 2% | 5..11 | none |
| 5x6 | 6..15 | none | 7..15 | none |
| 6x4 | 3..10 | 14% | 5..10 | none |
| 6x5 | 6..16 | none | 7..16 | none |
| 7x4 | 3..12 | 12% | 6..12 | none |
| 8x3 | 3..7 | 42% | 5..7 | none |
| 8x4 | 3..17 | 10% | 7..17 | none |
| 4x16 | 8..42 | none | 18..43 | none |
| 16x4 | 3..32 | 8% | 15..32 | none |

In the app, nine 5x5 Penrose (rhombs) boards dealt one after another had five
to ten rhombs each.

## Hints to pull in

None.
