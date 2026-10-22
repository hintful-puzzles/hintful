# Design — share-edge-hint-marks

## Context

From the survey `add-path-ts-port` ran (2026-10-21); re-check before relying
on a reference.

| Game | Mark kind and key | Packed as | Drawn as |
| --- | --- | --- | --- |
| Pearl | `EDGE {sq, dir}`, `sq:dir` | separate hint word, `H_LINE`/`H_CROSS`/`H_AREA` shifts, both squares | the line at half weight or the heavier cross, in `COL_HINT` |
| Path | `EDGE`, edge number | word 2: six bits a side, with the chain ordinal | the line or cross asked, in `COL_HINT`; outlined edges thin in `COL_HINT_EVIDENCE`, numbered |
| Tracks | `PIECE`, R/D canonical | `H_TRACK`/`H_BLOCK`/`H_CITED` shifts, both squares | stubs, cross, a short bar for cited |
| border grid | `EDGE`, canonical | `EDGE_HINT(border) << 24`, both squares | the edge colored, whatever is asked |
| Galaxies | `WALL`, half-grid point | `HINT_WALL`/`HINT_REFWALL` per side | a bar, where no wall is too |
| Rect | `LINE {h\|v, x, y}` | `RING_SHIFT` side bits | `drawMarkSides` in `COL_HINT` |
| Net | `SIDE` | ring and outline side bits | the note's shape |
| Dominosa | `SPOT` | `DF_HINT_EDGE_*` | a thick bar |

Evidence outlines are drawn in the tile with `drawMarkSides` by every edge
game (Pearl, Path, Tracks, Rect, Galaxies, the border grid), and that stays.

## D1 — One mark, keyed by the edge's number

The kind's key is the square-edge number, so a sentence naming an edge from
either square names one mark, and `hint-binding` compares them as one.
Pearl's non-canonical key is a latent bug this removes.

Tracks keeps its `PIECE` kind: one reference there names squares, sides and
a clue together ("it must run through the ringed one" over a square and its
sides), a reference is of one kind, and its side key is already canonical.
It takes the packer and the painter, which is where the hand-packed bits
were.

## D3a — A side on the rim (measured 2026-10-22)

Tracks' evidence names a side on the board's rim, which has no square
beyond it and no edge number: 408 of the 2,618 sides its hints named over
1,177 steps (24 boards, three sizes). So an `EdgeHint` takes an edge number
or a square's side, and a rim side is drawn by its one square. A chain's
ordinal goes on the edge's first square, whose side is right or down, and
the module refuses one it has no corner for.

## D3b — What moving them changed (measured 2026-10-22)

A draw-op differential over 1,023 hint frames, HEAD against the module
(Tracks 423, Path 285, Pearl 315): Tracks and Pearl draw the same ops,
reordered in 18 frames where only marks of one ink or apart from each other
moved. Path differs in 2 frames, both a chain's straight run through a
square that also holds a laid line: it was two round-ended halves, the knob
Path's line comment avoids, and is now one stroke. Path draws the step's
edges under the player's lines, as Pearl does.

## D2 — The border grid's hint changes look (asked in this change)

Moving Palisade and Separate onto the shared painter draws the wall or
not-wall the step asks for in the hint color, where today the edge is only
colored. That is what `docs/hints-marks.md` § "A mark on something that is
not a cell" asks of every game, and what Pearl, Path and Tracks do. It is a
change a player sees: show the owner a before and after of each, with the
recommendation to take it, and wait.

## D3 — What a game still declares

The game says how its line and its cross are drawn (Pearl's line and Tracks'
stubs differ, and the hint draws each game's own), through a declared
painter; the module owns the bits, both squares, the colors and the ordinal.

## D4 — Measure the rest

Galaxies' walls on a space grid, Rect's edges, Dominosa's spots, Net's notes
and Slant's alike marks: count what moving each would remove and decide, with
the reason here.
