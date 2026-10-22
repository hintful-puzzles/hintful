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

**Decided: R, U, L, D, not Path's up-left-right-down.** With that order a
direction `d`'s bit `1 << d` is upstream's `R`/`U`/`L`/`D` (1, 2, 4, 8), the
bit Net's wires, Pearl's lines and marks and Tracks' rails are stored and
saved in. So the module also takes the mask algebra (`opposite`,
`clockwise`, `anticlockwise`, `rot`, `dirX`, `dirY`, `dirCount`), which
`engine/wires.ts` held for Net and Netslide and Pearl and Tracks wrote again,
and a stored mask and the module's direction meet without a table. Path's
reading-order argument bought nothing a caller used: `edgeBetween` searches
four slots in any order.

Reordering Path's slots found two places that did arithmetic on slot numbers
(`render.ts`'s ordinal loop over `[2, 3]`, and `p.k + q.k === 3` for "these
two sides face each other"). Path's render snapshots did not see either; the
cross-game `hint-ordinal.test.ts` saw the first. Both now name `RIGHT`,
`DOWN` and `reverse`. The shape to look for when an order moves is a slot
number in arithmetic, not a slot number in an index.

**A game whose stored bits are in another order keeps its own index.** The
border grid's U, R, D, L nibble is in every Palisade and Separate move's
`flag`, and its direction index is the bit position in it; renumbering it
would put a table between every `BORDER(dir)` and its bit. It keeps `DX`,
`DY` and `FLIP` for that index and maps to the module's at the pointer,
through one table (`SQUARE_DIRS`).

## D3, as built

`sideAt(g, layout, p, still)` takes the still middle as a fraction of a tile:
Path and Pearl a quarter, the border grid and Slant none. On the diagonal the
vertical side wins. Pearl gave the tie to the horizontal side and Slant to
the left, then right, then up; each differs only on a press exactly on a
square's diagonal, a single pixel line, and the border grid's own tie-break
test still holds. The edge a press aims at from inside a square is Path's
`pointAtEdge`, three eighths of a tile from the middle; the border grid's
0.35 and Net's 0.4 were the same idea.

## D2, as built

No game's stored state or move changed shape. Pearl's ops, Tracks' ops and
`sflags`, the border grid's edits, Net's note moves and Slant's `alike`
moves are byte for byte as before; what moved is how each game computes
them. Pearl's, Path's and Slant's pointer target became the edge number, an
internal value the engine's sweep compares and nothing saves.

Tracks keeps `spotAt` and the `sE*` helpers. `spotAt` reads the cursor's
half-grid, where a square and an edge are both addresses, and the `sE*`
helpers read and write the edge bits inside `sflags`, which the desc carries
(`n2cUpper(sEDirs(…))`). Its `DIRS = [U, D, L, R]` is upstream's generator
order, which a board's layout depends on.

Netslide re-exported the wire vocabulary through its `state.ts`, which
`engine-catalog.md` § "What every game does" forbids; its modules now import
from where each thing lives.

## D4 — Measure before moving the five

Dominosa, Rect, Galaxies, Net and Slant each hold edges in their own shape for
a reason of their own (Galaxies' space grid is upstream's solver's; Net's
notes wrap round a torus). For each, count the lines the module would remove
and what it would cost, and record the decision here. "Noticeably cleaner" is
reason enough to take it on; "the shape is the puzzle's" is the reason to
decline.

Measured 2026-10-22:

| Game | Decision | Why |
| --- | --- | --- |
| Net, Netslide | Taken: the mask algebra. Declined: the numbering and the pointer | The algebra was `wires.ts`'s and is now the module's, and `noteVerbs.pointAt` uses `dirX`/`dirY` where it wrote them inline. Notes wrap round a torus and the rim has no `-1`; the note move names a side by Net's R or D bit; the press rule has a lock zone in the middle, not a still one. |
| Slant | Taken: the pointer and the edge between two squares | The "alike" mark is an edge stored on its first square, right or down, which is the module's numbering read back. `sideMarkAt`, `markBetween` and the hint's tap point went, about twenty lines; the move's `"right"`/`"down"` words are unchanged. |
| Dominosa | Declined | The target is the cursor's half-grid pair, and the press rule shares `squareAt` with the press on a number. The module would save about five lines and add a translation between an edge and a half-grid point. The solver numbers placements vertical first, upstream's order, which a deduction depends on. |
| Rect | Declined | The press snaps to a corner, a middle or an edge (`coord_round`), and a drag between corners draws a rectangle: it is not side picking. The solve move's bit strings are upstream's vertical-first order. |
| Galaxies | Declined | Edges, dots, corners and squares share upstream's (2w+1)×(2h+1) space grid, which the solver walks. Nothing in it repeats the module. |
