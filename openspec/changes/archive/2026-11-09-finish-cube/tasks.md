# Tasks

## 1. Show solution

- [x] 1.1 `solve` plans rolls until the board is finished, as one move the
      midend plays; it reports a board it cannot finish
- [x] 1.2 Tests on every preset, from a fresh board and a part-played one

## 2. Turning

- [x] 2.1 `transposeParams` swaps a cube's dimensions, and returns `null` for
      the triangular grids unless a swap turns the board exactly

## 3. Close

- [x] 3.1 Spec delta and help page; Cube no longer a draft; the running app
      checked in Chrome; archive

## Notes (2026-11-09)

- A triangle grid with `d1` and `d2` swapped draws the same size (measured
  with `computeSize` on all three triangle solids): it is the patch upside
  down, so it returns `null`.
- The solution move carries the boards between its rolls (`CubeState.via`),
  and the renderer plays one roll at a time. A line plays in at most
  `LINE_TIME` (5 s): the icosahedron's line ran past 100 rolls, 14 s at a
  roll's own pace.
- Solve plans from where the solid stands only, not from the dealt board as
  `solveBySearch` falls back to: the move is rolls from the solid's square,
  and Cube's state does not carry the dealt board.
- `orientation.test.ts` widened a board only through an item keyed `width`,
  which Cube's dialog names `width-top`; it now finds the item that turning
  moves.
