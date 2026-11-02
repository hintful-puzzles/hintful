# Design: a space the board deals

## Sections

| Section | What it holds |
| --- | --- |
| What G is | the vocabulary, and what it reused |
| The checker | how a dealt relation is checked |
| Map | its ladder, its hint, and the comparison with HEAD |

## What G is

**A board of cells alone, its neighbors a relation it deals.** The planning
compiler already had both: `space.cells: <size>` (Cube's squares) and
`space.relations: { name: dealt }` (Flip's patterns), read `name(c)`. The
technique compiler takes them too, so G needed no declaration of its own:
Map's regions are the space's cells and `borders(c)` the regions a region
borders, a field of `Dealt` the game builds once a graph. The grid's
geometry (`x`, `adj4`, lines) is refused on such a board, as it is in a
planning game.

**The marks are keyed by element already.** `CellMarks` over
`describedSpace([], n, 1)` is one entry a region; nothing in it reads a
row. The record's `x, y` reads a region as `x`, which Map never reads.

**The candidate walk stays Map's own.** `runCandidatePlan` is built on grid
points and the Latin row and column cull, and Map's hint is already a walk
over elements, with words owner playtests set (the premise dots, the
uncircled neighbors of a single). The hint now takes its firings from the
compiled rungs' `firings` and keeps its plan. Rebuilding the shared walk on
elements is weighed when a second graph game needs it (step 10's Bridges,
Spokes and Loopy), not for one game whose walk would only be translated.

## The checker

A board of cells alone is checked with the square of the order in cells,
9 and 16, as many as the grid of that order, which holds a weighing of a
three-color middle (five regions) with room. A dealt relation is every
relation on those cells, each ordered pair in it or not, a cell with itself
too: the description says only that it is dealt, so nothing makes it
symmetric, and a technique sound over every relation is sound over the
planar, symmetric ones a map deals. A domain ending at a number (Map's
`range(1, 4)`) reaches it at every order.

Map's four techniques are sound at both orders, each planted defect
unsound, in 22 seconds (2026-11-02).

## Map

**The ladder is upstream's tiers.** `placed` strikes a color from the
regions bordering it; `lone` is Easy, `pair` Normal, `weigh` Tricky (the
engine's wing with `borders` for "sees", whose solver half in
`engine/wing.ts` is retired: Map was its last caller, Solo having never
called it). Unreasonable is the engine's `searchAnswers` over the compiled
marks, dividing on a most-constrained region in upstream's order, in place
of the game's own recursion. Upstream's had no bound; the search's is
100,000 positions, where the most any solve of the comparison below tried
was 45. A color is one more than its index there,
since the marks hold no value 0. The answer check is the compiled
`isAnswer`.

**Against HEAD, nothing a player sees moved.** Measured over 20 seeds at
every tier of 15×20 with 30 regions, 25×30 with 75 and 10×10 with 15
(240 boards, 2026-11-02): every desc and aux is HEAD's, every grade, and
every hint walk played to the end by its first step, under both readings.
So no save or link stops loading. Deal time median/worst rose by up to a
fifth (Tricky 10×10: 51/201 ms at HEAD, 62/237 ms), and a hint's worst
latency stays under 6 ms.
