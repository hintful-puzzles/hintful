# deal-a-penrose-board-its-size

**Status: scaffolded, not started (2026-10-06).** A follow-up from
`count-loopys-smallest-penrose-boards`.

## Why

That change counted the faces of a Penrose patch by size and found that a
small size is not a small board so much as a lottery. A patch is cut from a
random place in the tiling, and a good share of the cuts keep three faces
around a point, which is a board of seven loops.

Counted 2026-10-06, 20,000 descriptions a size, as the share of patches that
are those three faces (`gridNewDesc` then `gridNew`, patches trimmed to
nothing left out):

| size | Penrose (rhombs) | Penrose (kite/dart) |
| --- | --- | --- |
| 3x3, 3x4, 3x5, 4x3 | all | refused, or 15% at 4x3 |
| 4x4 | 94% | 22% |
| 5x4 | 77% | 15% |
| 5x5 | 27% | 1% |
| 6x5 | 13% | none |
| 7x5 | 7% | none |
| 6x6 and up | none | none |

So a player who asks for a 5x5 Penrose (rhombs) is dealt three rhombs one
time in four, and eleven rhombs another time. Upstream does the same: the
patches match its fixtures.

The face count is not symmetric in width and height either (3x5 is always
three rhombs, and 5x3 is five rhombs one patch in fifteen), though the tiling
is marked as turning.

## What is known and what is not

- **The three faces are a legal board** at Easy, Tricky and Hard, and each
  deals at once. Nothing gives up. This is about what the size promises.
- **Whether a size should mean a face count is not decided.** The widest
  spread counted is 5x7 Penrose (rhombs), 3 faces to 18.
- **Hats and Spectres were counted at their smallest size only**, 6x6, where
  the spread is 14 to 20 faces and 10 to 17.

## What Changes

To be designed. The cheap form is for the generator to draw another patch
when one has far fewer faces than its size usually gives, which changes
which board a seed deals and nothing else. The four sizes that are always
three rhombs then have no other patch to draw, and refusing them outright
would refuse sizes upstream deals: that part is the owner's call.

## Hints to pull in

None.

## What would show it worked

The spread of face counts at each size, before and after.
