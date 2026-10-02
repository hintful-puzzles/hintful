## 1. Design

- [x] 1.1 Re-derive the population from `UNBREAKABLE` and read each game's
      `solve`; the owner's call on Inertia, Slide, Flip, Blackbox and Guess
      (2026-10-02: all consistent). A sweep from played positions added Flood.
- [x] 1.2 The declaration a game makes when its Solve cannot leave a solved
      board: none built, since no game needs one (design D1).

## 2. Engine

- [x] 2.1 `Midend.solve` refuses a lost board and throws on a move that leaves
      the board unsolved, before it enters the history.
- [x] 2.2 `solve-finishes.test.ts`: every game solved from its deal and from
      played positions; proved to fail by planting Flood's old Solve.
- [x] 2.3 `position-status.test.ts`: the ledger re-derived, and a second walk
      pass that drags the other two ways (design D5).

## 3. Games and help

- [x] 3.1 Inertia, Slide, Flip, Black Box, Guess, Mines and Flood, with their
      help pages, dev guides and spec deltas; the lost dialog drops Show
      solution.
- [x] 3.2 Run the app on each changed game.
