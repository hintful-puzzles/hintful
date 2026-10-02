# share-marks-across-tiles

**Status: done (2026-10-02): no helper, and a net that reaches the marks.**
Proposed after `add-pegs-hint`; the owner asked for it to be scaffolded.

**Outcome.** The shape is not shared: what Bricks and Pegs have in common is
the per-tile clip, which is two lines and the ordinary tile idiom, so no helper
was extracted (`design.md` D1). Planting each defect showed that the net named
below caught neither game's cross-tile marks, because the seeded run never
shows them. The differential now starts from a pinned board, and Pegs and
Bricks each pin the boards that reach their marks (D2).

## Why

Two games draw a mark that spans several tiles of a per-tile render cache, and
each solved the same two problems by hand:

- **Bricks**: its three-in-a-row bar and gravity diamond sit across tile edges
  (`bricks/render.ts`, the clip comment in its tile loop).
- **Pegs**: a hint jump (an arrow, or stripes) covers the three squares from
  the peg to the hole (`pegs/render.ts`, `TileJumps` and the string tile key).

The two problems: every tile the mark crosses must carry the mark in its cache
key, or a piece outlives the mark; and each tile must clip to its own square
while drawing the whole mark, so each piece leaves with the tile that carries
it (docs/games/rendering.md § "A tile paints only its own box, and tiles that
share pixels repaint together"). Both have gone wrong here before, silently:
Bricks shipped pieces that stayed after their flag cleared.

## What Changes

First establish whether the shape really is shared. Bricks' marks are rule and
mistake flags on neighbors, while Pegs' are hint marks keyed by a move, so the
common part may be only "clip, and key on what crosses you". If it is, an
engine helper that, given each mark's tiles and a key, returns the per-tile key
terms and runs a tile's painter clipped, with the warm-repaint differential
(`engine/warm-repaint.test.ts`) as the net. If the common part turns out to be
two lines, record the no-go and its reason here instead.

The next game whose marks cross tiles is the natural third user, and the
better moment if this has not been done by then.

## Hints to pull in

None.
