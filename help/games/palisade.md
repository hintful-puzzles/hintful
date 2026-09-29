# Palisade

Draw lines along the grid edges, in such a way that the grid is
divided into connected regions, all of the size shown in the status
line. Also, each square containing a number should have that many of
its edges drawn in.

## Controls

{{controls}}

The cursor moves by half a square, so it rests on the edges between
squares as well as on the squares themselves.

## Hints

**Hint** explains the next step rather than simply making it, and it
always says *why*: every sentence names the fact that forces the move,
not just the move. It reasons only from the numbers, the region size and
the edges you have decided, your walls and your "no wall" marks, so it
carries on from wherever you are, as long as none of them is wrong; if
one is, it asks you to fix the highlighted mistakes first.

{{hint-marks}}

The sentence says which way a ringed edge goes: "must be a wall" means
click the edge, and "can't be a wall" (or "clear them") means right-click
it to mark it as no wall.

A region, in the hint's words, is a group of squares your own "no wall"
marks already join, so a single square counts as one too. The size it
compares against is the one in the status line.

These are the ideas the hint teaches, from the plainest up:

* **A clue that is full, or that needs everything left.** A clue that
  already has all its walls allows no more, so its other edges are open;
  a clue that can reach its number only if every remaining edge is a wall
  gets them all. A 0 allows no walls at all.
* **Regions are all one size.** An edge whose opening would join two
  regions into more squares than a region holds must be a wall. A region
  still short of its size, with just one edge left to grow through, must
  grow through it.
* **A wall can't stop in mid-air.** Where a wall arrives at a corner and
  only one other edge there could carry it on, that edge must be a wall.
* **Two clues side by side.** If the edge between two neighboring clues
  were open, each clue's walls would all have to go on its other three
  sides, and whatever sides are left open lead further into the same
  region. On boards with small regions that can make the shared region
  bigger than a region may be, so the edge between them must be a wall.
  Two 3s are the sharpest case: each keeps just one side open, so their
  region would be the two squares alone, which is too small.
* **Edges that share a fate.** When two undecided edges of a clue both
  border the same region, the clue's square either joins that region,
  and both edges are open, or is walled off from it, and both are walls.
  It can't do one of each. So if walling both would exceed the clue,
  neither can be a wall; and if leaving both open would leave it short,
  both must be walls.

## Palisade parameters

{{parameters}}
