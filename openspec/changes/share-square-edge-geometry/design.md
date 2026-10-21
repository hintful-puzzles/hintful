# Design — share-square-edge-geometry

## Context

The survey `add-path-ts-port` ran (2026-10-21), with file references, is the
starting point; re-check each before relying on it (a claim about code
carries its date). Games marking edges of a square grid, and how:

| Game | Storage | Its own helpers |
| --- | --- | --- |
| Path | flat `edges: Uint8Array` by edge number | `Geometry` (`a`, `b`, `around`), `across`, `edgeBetween`, `edgeAt`, `pointAtEdge`, `edgeFromCursor` |
| Pearl | per-square R/U/L/D bits, `lines` and `marks`, written on both squares | `DX`, `DY`, `F`, `CW`, `ACW`, `NBITS`, `sideAt`, `markInDirection`, hint's `DIRS`/`step`/`edgeState` |
| Tracks | edge bits inside `sflags` at shifts 16 and 20, mirrored to the neighbor | `DX`, `DY`, `FLIP`, `sEDirs`, `sECount`, `sESet`, `sEClear`, `spotAt` |
| border grid (Palisade, Separate) | per-square wall and not-wall nibbles, U/R/D/L as `1 << dir` | `BORDER`, `FLIP`, `DX`, `DY`, `pointerEdge`, `edgeEdits` |
| Dominosa | barrier bits per square, both squares | inline |
| Rect | `vedge` and `hedge` arrays | inline |
| Galaxies | upstream's (2w+1)×(2h+1) space grid | `adjacencies`, `tilesFromEdge`, `forWallSides` |
| Net (notes) | `sides` stored under the left or upper tile | `sideIndex`, `wires.ts` `opposite`/`dirX`/`dirY`/`offset` |
| Slant (alike notes) | `ALIKE_RIGHT`/`ALIKE_DOWN` bits | inline |

## D1 — One numbering, one order

Edges are numbered as Path numbers them: the horizontal-neighbor edges in
reading order of their left square, then the vertical ones in reading order
of their upper square, so `a[e] < b[e]`. A square's four edges are held in one
order, and the module exports that order's deltas, so no game writes `DX`
again. Choose the order once, in this change, and say why: Path's
up-left-right-down sorts a square's edges by the square across them, which is
reading order.

## D2 — What is a player's bytes, and what is not

A game's state arrays are internal and may change shape. **Its move format is
not**: a saved game replays its moves, so Pearl's `{kind, l, x, y}` ops,
Tracks' ops and the border grid's edits stay byte for byte. Where a game's
state moves to a flat edge array, its `executeMove` translates the old ops.
Where that costs more than it saves, the game takes only the traversal and
pointer helpers. Prove each game's saves still load (`docs/work-management.md`
§ "A cross-game refactor moves no bytes a player owns").

## D3 — The pointer side lives here too

`edgeAt` (the side of its square a press is nearest, `null` near the middle
or on the rim) and `pointAtEdge` are pixel geometry every edge game writes
(Pearl's `sideAt`, Path's `edgeAt`, the border grid's `pointerEdge`). They take
the tile size and border, and call `fromCoord` (`engine/geometry.ts`), which
`coord-conversion.test.ts` holds every game to.

## D4 — Measure before moving the five

Dominosa, Rect, Galaxies, Net and Slant each hold edges in their own shape for
a reason of their own (Galaxies' space grid is upstream's solver's; Net's
notes wrap round a torus). For each, count the lines the module would remove
and what it would cost, and record the decision here. "Noticeably cleaner" is
reason enough to take it on; "the shape is the puzzle's" is the reason to
decline.
