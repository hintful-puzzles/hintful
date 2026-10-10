# Tasks

`design.md` says why the tasks came out other than as filed: no bound was
drawn, since a Custom size is not refused for its wait, and the crash was
fixed where it was thrown.

## 1. Measure

- [x] 1.1 Whether a pasted 64x64 board loads. It did not: the rules threw
  "Maximum call stack size exceeded" on an open 64x64 grid, which is the
  deepest walk any board has. The largest board that survives was not
  searched for, since with the walk on its own stack every board does.
- [x] 1.2 Time an Easy deal and an Unreasonable one across sizes, square and
  thin, before and after (`design.md`).
- [x] 1.3 Choose the bound: none. Recorded in `design.md`.

## 2. Build

- [x] 2.1 The connectedness rule without a call a square, reaching the same
  squares in the same order. 219 boards and their hint plans recorded before
  and compared after, and the comparison seen to fail with a defect planted.
- [x] 2.2 No bound in `validateParams`, and the Unreasonable bound of 300
  squares taken away: every deal past it returned the board asked for.
- [x] 2.3 The strip no longer runs the solver on a pair already removed.
  Same 219 boards, none moved; an Easy deal is about 2.4 times as fast.
- [x] 2.4 Tests: the rules on an open 64x64 grid and on a 127-long strip, and
  the largest sizes admitted at both tiers.
- [x] 2.5 In the running app: an 18x18 Unreasonable board asked for in the
  Custom dialog and dealt, and a pasted 64x64 board opened.

## 3. Close

- [x] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [x] 3.2 `help/games/range.md` and `help/differences.md`: read, and neither
  says anything of a size bound, so neither changes. The Parameters section
  is built from the size field's `doc`, which names the one bound left.
- [x] 3.3 The guide (`docs/games/solver-and-generator.md` § "Bound a
  generator by its tail, not its median"), and a note in each of the six
  other `bound-*-to-the-boards-it-deals` proposals.
- [x] 3.4 Commit, push, archive.
