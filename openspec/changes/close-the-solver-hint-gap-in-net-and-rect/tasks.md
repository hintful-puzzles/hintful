## 0. Characterize

- [ ] 0.1 On the pinned Net board, find the first tile the solver settles that
      `deduce.ts` leaves open, and name the deduction. Same for the pinned
      Rectangles board against the rungs.
- [ ] 0.2 Take the 2-of-400 Rectangles boards the rungs finish and the solver
      does not, and say why: `findMistakes` checks nothing on such a board.

## 1. Build

- [ ] 1.1 Net: a narratable rung for each deduction 0.1 names, until
      `finishes` agrees with the solver on the 62-of-261 sample; the generator's
      re-deal then stops firing, so say what replaces the differential's
      `DIVERGED` entry.
- [ ] 1.2 Rectangles: the same against `rungsFinish`.
- [ ] 1.3 The two pinned boards as tests: each loads and its hint finishes it.
- [ ] 1.4 If a deduction turns out not to be narratable at a glance, ask the
      owner about refusing those boards at load, with the rates in proposal.md.
- [ ] 1.5 Rectangles' `line` rung: pin a board that reaches it and remove the
      `UNREACHED` entry, or delete the rung with a power argument.
