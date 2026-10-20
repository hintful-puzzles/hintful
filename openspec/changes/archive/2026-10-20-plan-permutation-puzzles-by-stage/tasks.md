# Tasks

## 1. The shared planner

- [x] 1.1 Lift the library, the stage tables, the remainder lookup and the
      rank out of `twiddle/solver.ts` into an engine module over moves given as
      effects; Twiddle's hint tests pass unedited.
- [x] 1.2 Catalog entry and the module's own tests (the rank falls on every
      hinted move, on a game-free fixture: a walk recomputed after every move
      arrives and never revisits a board; seen failing with the remainders
      off and with the parity products off).

## 2. Twiddle's known limit

- [x] 2.1 A family of small in-place twists for odd blocks with orientation.
      Walk 4×4 n3 and 5×5 n3 orientable to solved with no refusal, and add
      them to `twiddle-hint.test.ts`'s custom shapes.

## 3. The other permutation games

- [x] 3.1 Measure Sixteen, Netslide and Fifteen on the staged planner against
      their current plans: length, request time, reach. Record it in
      `design.md`.
- [x] 3.2 Move the ones the measurement favors, each keeping its hint's
      quality bar; drop a game from `SEARCH_REACH` only when its walk no
      longer refuses. The measurement favors none (`design.md` § 3).
