# Tasks

`design.md` says why the tasks came out other than as filed: no bound was
drawn. A division was being thrown away for a second answer in a few of its
regions, and the generator now divides those regions again.

## 1. Measure

- [x] 1.1 What a thrown-away division is thrown away for: several answers
  under its own clues, at every region size, and nothing else at three. The
  count checked against a tiling count that shares nothing with the solver.
- [x] 1.2 The steps a board takes to repair and the time of a deal, from 2 to
  300 regions, square and thin, with the tail at the sizes that stall most.
- [x] 1.3 Choose the bound: none. Recorded in `design.md`.

## 2. Build

- [x] 2.1 The generator divides the regions round a stall again, four to
  eight at a time, and throws no division away. It moved to
  `palisade/generator.ts`.
- [x] 2.2 The step cap, sized to the most steps a board was measured to take,
  and the comment that said the solver "nearly always" solves a division
  replaced by what was measured.
- [x] 2.3 No bound in `validateParams`, and the Unreasonable bound of 180
  squares taken away: every deal past it returned the board asked for.
- [x] 2.4 Tests: 9x9 in threes dealt at both tiers and 12x12 in fours at
  Easy, a hundred 6x6 boards in threes with none given up on, and the sizes
  no longer refused. Seen to fail with the move held to three regions.
- [x] 2.5 In the running app: a 12x12 board in threes and a 15x15
  Unreasonable board asked for in the Custom dialog and dealt.

## 3. Close

- [x] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [x] 3.2 `help/games/palisade.md` and `help/differences.md`.
- [x] 3.3 The guide (`docs/games/solver-and-generator.md`), and a note in
  `bound-separate-to-the-boards-it-deals`, whose grid is divided the same way.
- [x] 3.4 Commit, push, archive.
