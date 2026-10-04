## 0. Characterize

- [ ] 0.1 On the pinned Net board, find the first tile the solver settles that
      `deduce.ts` leaves open, and name the deduction. Same for the pinned
      Rectangles board against the rungs.
- [ ] 0.2 Take the 2-of-400 Rectangles boards the rungs finish and the solver
      does not, and say why: `findMistakes` checks nothing on such a board.

## 1. Decide

- [ ] 1.1 With the owner: strengthen the hints, refuse at load, or both, with
      the rates in proposal.md as the cost of refusing.

## 2. Build

- [ ] 2.1 The chosen route, with the two pinned boards as its tests.
- [ ] 2.2 Rectangles' `line` rung: pin a board that reaches it and remove the
      `UNREACHED` entry, or delete the rung with a power argument.
