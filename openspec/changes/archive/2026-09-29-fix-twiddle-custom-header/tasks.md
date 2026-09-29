## 1. Guard, proven red

- [x] 1.1 `augmentation.test.ts`: every preset header of every game with a
      formatter contains no `NaN` or `undefined`. Red on Twiddle alone
      ("3x3, rotating NaNxNaN blocks"), 112 others green.

## 2. Fix

- [x] 2.1 Twiddle's `describeParams` supplies the four fields its formatter
      reads (block size and move target as strings, the two flags as real
      booleans).
- [x] 2.2 Every Twiddle preset's header now reproduces its title (apart from
      `×` against `x`, which `declare-params-in-one-place` unifies), and a
      custom game renders "4x4 rows only, orientable, rotating 3x3 blocks, 50
      shuffles", seen in the browser at `?type=4x4n3rom50`.
