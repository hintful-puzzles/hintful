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

### What the captures found (2026-10-22), and the question

The premise above is half right. The border grid's own notation has one
shape for both states: a wall is the edge in ink, a not-wall the same edge
in pale gray, undecided the same edge in yellow. So for a wall the hint's
blue edge already is the move's shape recolored. For a not-wall it is the
wrong one: "these edges can't be walls" is drawn exactly as "these must be
walls" would be (Palisade `5x5n5de:2c2c1a2d1g1`, its first step; Separate
`5x5n5de:DBECEADBEAECCDBBADDCAABEC`, the seventh). That is what
`hints-marks.md` § "Echo the move's shape in the hint color" forbids, a
mark showing the opposite of its sentence. And Separate's help already
promises "a mark saying 'no wall here'" that the board never draws.

Two prototypes were captured. A thin blue line along the edge is not seen
at a phone's tile size, where the edge is three pixels wide. A blue cross
on the edge, the edge left in its own undecided color, reads at every size,
and is the cross Pearl, Path and Tracks draw for "not a line". It is a
shape the border grid's own notation does not have, so it is put to the
owner: the cross (recommended), or keep today's blue edge and correct
Separate's help. A wall ask is drawn as today either way.

A constraint the captures taught: while a hint shows, the app repaints
every op drawn in a hint ink over the board, so a game cannot cover an
ink mark afterwards; a not-wall edge must be drawn in its own color and
never in the ring's.

## D3 — What a game still declares

The game says how its line and its cross are drawn (Pearl's line and Tracks'
stubs differ, and the hint draws each game's own), through a declared
painter; the module owns the bits, both squares, the colors and the ordinal.

## D4 — Measure the rest

Galaxies' walls on a space grid, Rect's edges, Dominosa's spots, Net's notes
and Slant's alike marks: count what moving each would remove and decide, with
the reason here.

Measured 2026-10-22; each is declined, with the line count the move would
remove:

- **Galaxies** (about 10). Its walls are keyed by half-grid point, beside
  dots on the same points, which stay hand-packed; a wall has one shape,
  a bar along the edge, and no cross.
- **Rect** (about 10). Its edge hint is a side of the shared `hint-mark.ts`
  band it rings a rectangle with, one look for both; its move has no cross.
- **Dominosa** (about 20). Only its barrier is an edge; its other answer,
  a domino placed, is a ring round two squares painted outside the tiles.
- **Net** (15 to 20). Its notes are a line and a cross, the closest fit,
  but a wrapping board's sides across the wrap have no edge number and need
  both their squares drawn, and its outline recolors the player's own note
  where the module draws under it. The module would take Net once it
  numbers a wrapping board's edges.
- **Slant** (about 5). One shape, the "=", drawn on a ring-extended tile
  grid, sharing one priority code per side with the player's and Check &
  Save's marks.
