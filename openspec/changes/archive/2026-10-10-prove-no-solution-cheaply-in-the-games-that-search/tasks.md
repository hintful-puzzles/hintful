# Tasks

## 1. Measure

- [x] 1.1 For Pegs, Sokoban and Inertia: find the hint's dead-position proof,
  and time it on the largest preset's dealt boards and on boards one edit
  from a dealt one (`descMutants`). Say what it proves and what it misses.
  (`design.md`, Decision 1.)

## 2. Pegs and Sokoban, and what the engine owns

- [x] 2.1 Each states its proof as `hasNoSolution`, and its board moves to
  `REFUSED` in `no-solution-load.test.ts`. Every dealt board still loads
  (`desc-error-games.test.ts`), and the test is seen failing without the hook.
- [x] 2.2 Decide whether the midend refuses a hint and a Solve from a
  position the hook holds for, and record the decision in a `design.md`. If
  it does, the two games' hints lose that refusal and keep their marks.
  (The hint, yes, where the proof names its cause; Solve, no. Decisions 2
  to 4. The marks moved with the refusal into `hasNoSolution`.)
- [x] 2.3 In the running app: each game's dead board is refused at load, and a
  position played into a dead one still gets its hint's marks and sentence.

## 3. The rest

- [x] 3.1 Inertia, as 2.1.
- [x] 3.2 Flood, Twiddle and Netslide: write each proof where one is found
  and is cheap, and leave the game in `LET_THROUGH` with the reason where
  not. Twiddle's Solve reaching "Auto-solved" on an unreachable board goes
  with its proof. (All three have one. Twiddle's is not complete, so its
  Solve still says so on a board the proof passes: Decision 5.)
- [x] 3.3 Slide: confirm no cheap proof, and say so on its entry.
- [x] 3.4 Same Game: put the proposal's question to the owner, and act on the
  answer. (The lone tile of a color needed no answer and is in. The board
  with no move is filed as `refuse-a-same-game-board-with-no-move`:
  Decision 6.)

## 4. Close

- [x] 4.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [x] 4.2 `docs/games/solver-and-generator.md`, § "One answer, even when it is
  hidden", and `docs/games/hints.md` if the engine took the refusals.
- [x] 4.3 Commit, push, archive.
