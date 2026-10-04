## 0. Characterize

- [x] 0.1 On the pinned Net board, find the first tile the solver settles that
      `deduce.ts` leaves open, and name the deduction. Same for the pinned
      Rectangles board against the rungs. (design D1, D4)
- [x] 0.2 Take the Rectangles boards the rungs finish and the solver does not,
      and say why: `findMistakes` checks nothing on such a board. (design D7)

## 1. Build

- [x] 1.1 Net: `Reach` replaces `sealedBy`'s one-tile look, and the hint leaves
      none of 23,100 solver-settled boards unfinished. The generator keeps its
      gate (design D2), and `net-trace-4` returns to the byte-match (design D3).
- [x] 1.2 Rectangles: a line on an edge whose every fit across it is ruled out.
      3 of 2,260 solver-settled boards are left, against 20 (design D4, D6).
- [x] 1.3 The two pinned boards as tests: each loads and its hint finishes it.
      Upstream's 10x10e0.5 Rectangles fixture is restored to the differential.
- [x] 1.4 Rectangles' three boards need reasoning no line can record (design
      D6). Asked, with the rates: both games refuse at load what their hint
      cannot finish (design D8).
- [x] 1.5 Rectangles' old `line` rung is deleted with an argument from the code
      (design D5). The new one is pinned in `warm-repaint.test.ts`, and the
      `UNREACHED` entry is gone.

## 2. Close

- [x] 2.1 Help pages, the mark legend, the sentence ledger, and the two guides.
- [x] 2.2 Spec deltas for `net` and `rect`.
- [x] 2.3 Run the app on both pinned boards and read the new steps.
