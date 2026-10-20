# Tasks

## 1. Decide

- [x] 1.1 Measure in-place against copying children on Pegs' 9x9 Cross and
      Same Game's 15x20, in time a position.
      Measured 2026-10-20 on fifteen random unfrozen 9x9 Cross positions,
      300,000-position proofs, 4.1 million positions a variant, two rounds:
      the old `exhaust` 4.0–4.3 µs a position; the helper in place with a
      running peg count 4.6; in place counting the pegs afresh 5.7–6.0; a
      copy a child 5.7–6.9. Every variant expanded the same positions and
      gave the same outcomes. So the helper allows both: Pegs keeps one
      board, changed and restored in a `finally`, with its count on the
      position; Same Game makes a new board a move (a removal's falls and
      closed columns are not worth undoing), and matched its old search,
      39–45 µs a position either way over twenty 15x20 positions.
- [x] 1.2 Measure restarts on Pegs' proof of loss.
      Measured 2026-10-20 on the 652 positions, of random walks on three
      boards each of 9x9 Cross, 7x7 Cross and 9x9 Random, where both of
      `findFinish`'s beams missed, at 300,000 positions: 110 restarts of
      2,500 proved nothing one try did not, lost one proof on 9x9 Random,
      and found one line, on 7x7 Cross, that one try ordered by `spread`
      also found. A proof of loss expands every position no cut stops
      whatever the order, so a short try only repeats work. Pegs keeps one
      try, in the order its jumps are listed.
- [x] 1.3 Whether the lost-at-a-glance cut is also the rival trap a hint
      leads with. It is its first half in both games, and each game's hint
      already calls the one function its cut calls (`frozenPegs`,
      `lastOfColor`). What the trap adds is the game's own: which pieces to
      mark, and a second look (Pegs a reply later, Same Game a board left
      with no group). So the hint layer shares nothing more; the cut stays
      one function a game, used in both places.

## 2. Build

- [x] 2.1 The engine helper, with a brute-force test on small boards
      (`engine/finish-search.ts`; seen to fail with a budget-cut position
      remembered as lost, and with an expansion not counted).
- [x] 2.2 Move Pegs and Same Game onto it; their hint tests unchanged.
- [x] 2.3 Name it in `docs/hints-search.md` and `docs/engine-catalog.md`.
