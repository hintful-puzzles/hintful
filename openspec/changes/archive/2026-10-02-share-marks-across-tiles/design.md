# Design: share-marks-across-tiles

## D1. The helper is a no-go: the shared part is the clip

Read side by side (2026-10-02), Bricks and Pegs share less than the proposal
hoped.

**Who puts a mark into each tile's key.** In Pegs, the renderer: a hint jump is
one mark keyed by its move, `across(j)` names its three squares, and each square
keys on the jumps crossing it (`arrowsAt`, the string tile key). In Bricks, the
validator: `bricksValidate` sets a flag on every square a rule mark touches
(`FE_LINE_LEFT`/`FE_LINE_RIGHT` along a run, `FE_ERROR` above a gravity break,
`FE_TOPLEFT`/`FE_TOPRIGHT` on the two squares below it), and those flags are the
mistake data as well as the key. A helper that took "each mark's tiles" would
make Bricks state twice what its validator already states once.

**What each tile draws.** Pegs draws the whole arrow and lets the clip cut its
piece. Bricks draws a piece decided by its own flag (a bar half-extended toward
the flagged side, a diamond centered on its own corner), so the clip there
trims overhang rather than choosing the piece.

**What is left in common** is `dr.clip(box); paint; dr.unclip()`, which is two
lines, and it is not specific to marks that cross tiles: it is the ordinary
tile idiom, written by most of the collection's renderers
(`git grep -l '\.clip(' -- 'src/games/*/render.ts'`).

**The wider population says the same.** Bridges (a span sets a line bit on
every square between its islands), Pearl (an edge sets a bit on both its
squares), Net (a side on both its tiles), Galaxies (a wall or dot on the tiles
it touches) and Ascent (a route's direction bits on each square) also spread
multi-tile marks into per-tile keys. Each writes *which piece* a tile draws,
which is the game's own geometry: a side, a direction, a half. None keys on a
mark's identity and draws the mark whole the way Pegs does. Region outlines,
the one cross-tile shape that does recur, are already the engine's
(`MarkOutlines.packed` in `engine/hint-mark.ts`).

So there is no helper. The two idioms and when to pick each are written in
`docs/games/rendering.md` § "A tile paints only its own box, and tiles that
share pixels repaint together". If a third game draws a mark whole and keys it
by identity, that is when to reopen this.

## D2. What the change does instead: put the marks in front of the net

The proposal named the warm-repaint differential as the net under these marks.
Before relying on it, each defect was planted to see whether it would go red:

| planted defect | caught by |
| --- | --- |
| Pegs: arrow left out of the tile key | nothing |
| Pegs: stripes left out of the tile key | nothing |
| Pegs: arrow not spread to its middle square | `pegs-hint.test.ts` arrowhead count |
| Bricks: left-edge ground repaint removed | two snapshots only |
| Bricks: clip removed (ground repaint kept) | two snapshots only |

The two Pegs key defects are exactly the class the proposal describes. Nothing
caught them because the seeded run deals a fresh board and plays its hint's
opening, and neither mark appears there. The Bricks one is the 171-pixel stale
diamond that `warm-repaint.test.ts` convicted when it first painted drags
(`f1d3e4b1`). The collection-wide run no longer reaches it. A scan of 200 seeds
at 60 events with only the clip removed went green throughout. With the
ground repaint removed too, 6 of the first 60 seeds went red, all at 171 px.
That means it is the ground that keeps the diamond honest. The clip only keeps
a flagged square's repaint off its neighbors, and random input does not reach
that.

The fix gives the differential an optional `board`, a game id to start from in
place of a seeded deal, and pins one case per mark:

- Pegs: `PINNED.trap` (stripes) and `PINNED.onlyThese` (arrows), each red when
  its term leaves the key;
- Bricks: `6x7de:2b4ba5b3_0_3eb3b2c2b3d2b2c` with event seed `bricks-0`, red
  at 171 px when the edge square stops repainting its ground.

Each case pins the board and the event stream as inputs, not a deal seed, so a
change to the generator cannot quietly move the mark out of reach.

## D3. The spec scenario said the collection-wide run catches it

`ts-engine`'s "A mark drawn across tiles outlives its flag" read as a property
of the seeded run, and on 2026-10-02 the seeded run did not have it. The
delta rewrites the scenario to say what holds: the comparison catches a stale
piece on a frame it paints, and a game whose cross-tile mark the seeded deal
does not reach runs the comparison from a board that shows it.
