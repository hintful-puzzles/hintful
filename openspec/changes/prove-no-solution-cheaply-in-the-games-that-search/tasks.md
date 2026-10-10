# Tasks

## 1. Measure

- [ ] 1.1 For Pegs, Sokoban and Inertia: find the hint's dead-position proof,
  and time it on the largest preset's dealt boards and on boards one edit
  from a dealt one (`descMutants`). Say what it proves and what it misses.

## 2. Pegs and Sokoban, and what the engine owns

- [ ] 2.1 Each states its proof as `hasNoSolution`, and its board moves to
  `REFUSED` in `no-solution-load.test.ts`. Every dealt board still loads
  (`desc-error-games.test.ts`), and the test is seen failing without the hook.
- [ ] 2.2 Decide whether the midend refuses a hint and a Solve from a
  position the hook holds for, and record the decision in a `design.md`. If
  it does, the two games' hints lose that refusal and keep their marks.
- [ ] 2.3 In the running app: each game's dead board is refused at load, and a
  position played into a dead one still gets its hint's marks and sentence.

## 3. The rest

- [ ] 3.1 Inertia, as 2.1.
- [ ] 3.2 Flood, Twiddle and Netslide: write each proof where one is found
  and is cheap, and leave the game in `LET_THROUGH` with the reason where
  not. Twiddle's Solve reaching "Auto-solved" on an unreachable board goes
  with its proof.
- [ ] 3.3 Slide: confirm no cheap proof, and say so on its entry.
- [ ] 3.4 Same Game: put the proposal's question to the owner, and act on the
  answer.

## 4. Close

- [ ] 4.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 4.2 `docs/games/solver-and-generator.md`, § "One answer, even when it is
  hidden", and `docs/games/hints.md` if the engine took the refusals.
- [ ] 4.3 Commit, push, archive.
