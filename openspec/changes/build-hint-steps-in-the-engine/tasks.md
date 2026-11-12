# Tasks

## 1. Trial

- [x] 1.1 Write the design: a step's terms, a conclusion's named arms, mark roles, how a firing is shown, and the adapter, read against the earlier withdrawals
- [x] 1.2 Build the comparison of every hint walk's words and marks, and see it fail on a planted change (`src/engine/hint-walk-fingerprint.test.ts`, snapshots taken at `HEAD` for Unruly, Singles and Boats; a planted outline-to-stripes swap failed Unruly's)
- [ ] 1.3 Move Unruly, Singles and one of Boats or Bridges onto it, and measure the lines that went against the report's prediction
  - [x] Unruly (`a6ccdf4b`): `says` in the schema, compiler and runtime; `engine/described-hint.ts`; hint, keep-track and kinds engine-built. Comparison: the same words, and marks differ only where the old ones were defective (design § "What the trial found"). **Lines**: measure `git show --stat a6ccdf4b` for `unruly/` against the report's ~90 + 71 + 72 + 123 (A, B, C, D) for it
  - [x] Singles: `says.arms`, `says.marks.strand` and `reads`, and `engine/described-firing-hint.ts`; every walk's hash equals `HEAD`'s on the snapshot's boards and on 40 boards a preset (design § "Singles, built"). **Lines**: 400 of hint glue out of `index.ts` and `solver.ts`, 138 in (66 of them yaml)
  - [ ] Boats (or Bridges): terms that replace restated definitions, and `with`

## 2. The catalog

- [ ] 2.1 Move the rest of the described games, a family at a time, each compared
- [ ] 2.2 Remove what no game uses, and update `docs/descriptions.md`, `docs/hints.md` and the skeletons
- [x] 2.3 Check and fix the two defects named under "Fixed in passing" (Mines' dead region arm removed in `1118d723`; Loopy's `closed` throw is unreachable, since a closed loop with every clue met is solved and one with a clue unmet is a mistake, so it stays as the invariant's guard)
